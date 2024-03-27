import express from 'express';
const router = express.Router();
import { readFileSync } from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import nm from 'nodemailer';
import { jsPDF } from 'jspdf';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import canvas from 'canvas';
import 'jspdf-autotable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import '../public/assets/fonts/Roboto-Bold-bold.js';
import '../public/assets/fonts/Roboto-Regular-normal.js';
import '../public/assets/fonts/GeistMono-bold.js';

import addText from '../lib/addText.js';
import checkY from '../lib/checkY.js';
import addFooters from '../lib/addFooters.js';

import dotenv from 'dotenv'
dotenv.config();

const transporter = nm.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_APP,
		pass: process.env.EMAIL_APP_PSWD
	}
});

transporter.verify((err, success) => {
	err ? console.log(err) : console.log(`=== Server is ready to take messages: ${success} ===`);
});

//Auth
import pool from '../database.js';
import { isLoggedIn } from '../lib/auth.js';
import code from '../lib/uid.js';

//GET & POST Routes with Auth
router.get('/inicio', isLoggedIn, async (req, res) => {
	const { id: userID, type } = req.user;

	const classes = await pool.query(`SELECT * FROM ${req.user.type === "teacher" ? "classes" : "student_class"} WHERE id_${req.user.type} = ?`, [ userID ]);
	
    const userData = {};
    userData[`${req.user.type}`] = true;
	userData[`classes`] = [];

    if (type === "teacher") userData[`classes`] = [ ...classes ];

	if (type === "student") {
		const classesID = classes.map(classInfo => classInfo.id_class).join(", ");
		const classInfo = classesID ? await pool.query(`SELECT * FROM classes WHERE id in (${classesID})`) : [];
		userData[`classes`] = [...classInfo];
	};

    res.render('links/inicio', {
        rendererJS: '<script defer type="module" src="/scripts/renderer.js"></script>',
        styles: 'style',
        documentTitle: `${req.user.type === "teacher" ? "RecuEngine - " : ""}Inicio`,
        theme: req.user.theme,
        ...userData
    });
});

router.post('/inicio', isLoggedIn, async (req, res) => {
	const { id: userID, type } = req.user;

	if (type === "student") {
		const { codeClass } = req.body;
		const dataClass = {};
		const existsClass = await pool.query('SELECT * FROM classes WHERE code = ?', [ codeClass.trim() ]);

		if (existsClass.length < 1) {
			req.flash('error', "La clase no existe.");
			return res.redirect('/inicio');
		};

		const { id: classID, students, tests } = existsClass[0];

		if (students === 30) {
			req.flash('error', 'La clase ya no puede admitir más estudiantes.');
			return res.redirect('/inicio');
		};

		const studentInClass = await pool.query('SELECT * FROM student_class WHERE id_student = ? AND id_class = ?', [ userID, classID ]);

		if (studentInClass.length > 0) {
			req.flash('error', "El estudiante ya esta en la clase.");
			return res.redirect('/inicio');
		};

		dataClass["id_student"] = userID;
		dataClass["id_class"] = classID;
		dataClass["grade"] = JSON.stringify([...Array.from({length: tests}, (x, i) => { return {test: `Evaluación ${i + 1}`, grade: 0.00}}), { test: "Otros", grade: 0.00 }]);

		await pool.query('INSERT INTO student_class set ?', [ dataClass ]);
		await pool.query('UPDATE classes SET students = ? WHERE id = ?', [ students + 1, classID ]);

		req.flash('success', 'Te has unido a la clase exitosamente.');
		return res.redirect('/inicio');
	};

	const { nameClass, sectionClass, testsClass, colorClass } = req.body;

	const subject = {
		name: nameClass.trim(),
		id_teacher: userID,
		section: sectionClass.trim(),
		color: colorClass.trim(),
		code: await code(6),
		tests: testsClass.trim()
	};

	await pool.query('INSERT INTO classes set ?', [ subject]);

	req.flash('success', 'Clase creada exitosamente.');
	res.redirect('/inicio');
});

router.get('/class:classId', isLoggedIn, async (req, res) => {
	const { id: userId, type } = req.user;
	const { classId } = req.params;

	const userData = {};
	userData[`${type}`] = true;

	if (type === 'teacher') {
		const classDetails = await pool.query(`SELECT * FROM classes WHERE id = ? AND id_teacher = ?`, [ classId, userId ]);

		if (classDetails.length < 1) {
			req.flash('error', 'Esta clase no existe.');
			return res.redirect('/inicio');
		};

		const [ classInfo ] = classDetails;

		const { students } = classInfo;

		if (students > 0) {
			const studentsList = await pool.query(
			`SELECT s.id AS id_student, s.firstname, s.lastname, s.ci, s.email, s.theme, s.type, sc.id_class, sc.grade, sc.canRecu
			FROM students s
			LEFT JOIN student_class sc
			ON s.id = sc.id_student
			WHERE sc.id_class = ?`,
			[ classId ]);

			studentsList.map(student => {
				const grades = JSON.parse(student["grade"]);
				student["grade"] = grades.map(gr => gr.grade).reduce((a, b) => a + b).toFixed(2);
				grades.map(test => test["grade"] = test["grade"].toFixed(2));
				student["grades"] = [...grades];
			});

			userData["studentsInfo"] = studentsList;
		};

		return res.render('links/materiaDetalles', {
			rendererJS: '<script defer type="module" src="/scripts/renderer.js"></script>',
			styles: 'style',
			documentTitle: `${req.user.type === "teacher" ? "RecuEngine - " : ""}Clase`,
			theme: req.user.theme,
			...userData,
			classDetails: classInfo
		});
	};

	if (type === 'student') {
		const classDetails = await pool.query(
		`SELECT c.id, c.name, t.firstname AS tfirstname, t.lastname AS tlastname, c.section, c.students, c.color
		FROM classes c
		LEFT JOIN teachers t
		ON c.id_teacher = t.id
		LEFT JOIN student_class sc
		ON c.id = sc.id_class
		WHERE c.id = ? AND sc.id_student = ?`,
		[ classId, userId ]);

		if (classDetails.length < 1) {
			req.flash('error', 'Esta clase no existe.');
			return res.redirect('/inicio');
		};

		const [ classInfo ] = classDetails;

		const { students } = classInfo;

		if (students > 0) {
			const studentsList = await pool.query(
			`SELECT s.id AS id_student, s.firstname, s.lastname, s.ci, s.type, sc.id_class, sc.grade, sc.canRecu
			FROM students s
			LEFT JOIN student_class sc
			ON s.id = sc.id_student
			WHERE sc.id_class = ?`,
			[ classId ]);

			studentsList.map(student => {
				const grades = JSON.parse(student["grade"]);
				student["grade"] = grades.map(gr => gr.grade).reduce((a, b) => a + b).toFixed(2);
				grades.map(test => test["grade"] = test["grade"].toFixed(2));
				student["grades"] = [...grades];
			});

			userData["studentsInfo"] = studentsList;
		};

		return res.render('links/materiaDetalles', {
			rendererJS: '<script defer type="module" src="/scripts/renderer.js"></script>',
			styles: 'style',
			documentTitle: `${req.user.type === "teacher" ? "RecuEngine - " : ""}Clase`,
			theme: req.user.theme,
			...userData,
			classDetails: classInfo
		});
	};

	res.redirect('/inicio');
});

router.post('/class:classId/send', isLoggedIn, async (req, res) => {
	const { id: teacherId, type, email: emailTeacher, firstname, lastname } = req.user;

	if (type === 'teacher') {
		const { classId } = req.params;
		const { dateRecu: dR } = req.body;
		const [ yyyy, mm, dd ] = dR.split("-");
		const dateRecu = `${dd}/${mm}/${yyyy}`;

		const classInfo = await pool.query('SELECT * FROM classes WHERE id = ? AND id_teacher = ?', [ classId, teacherId ]);

		if (classInfo.length < 1) {
			req.flash('error', 'No se pudo enviar la notificación.');
			return res.redirect(`/class${classId}`);
		};

		const studentsInfo = await pool.query(
		`SELECT s.firstname, s.lastname, s.email
		FROM students s
		LEFT JOIN student_class sc
		ON s.id = sc.id_student
		WHERE sc.id_class = ?
		AND sc.canRecu = 1`,
		[ classId ]);

		if (studentsInfo.length < 1) {
			req.flash('error', 'No se pudo enviar la notificación.');
			return res.redirect(`/class${classId}`);
		};

		const studentsToNoti = [...studentsInfo.map(s => { 
			return {
				name: `${s.firstname} ${s.lastname}`,
				email: s.email 
			};
		})];

		studentsToNoti.forEach((student, ind) => {
			const { name, email } = student;

			const mailOptions = {
				from: `RecuEngine ${process.env.EMAIL_APP}`,
				to: email,
				subject: `RecuEngine: Notificación De Recuperativo`,
				html: `
				<div>
					<span style="display: block; margin-top: 1em; font-size: 2em;">Saludos, <b>${name}</b>.</span>
					<span style="display: block; margin-top: 3em;">Se le notifica que la fecha para el recuperativo de la materia <b>${classInfo[0].name}, sección: ${classInfo[0].section}</b> será el día <b>${dateRecu}</b>.</span>
					<span style="display: block; margin-top: 1em;">Buena suerte.</span>
					<span style="display: block; margin-top: 3em; font-size: .9em; opacity: .6;">Esta es una cuenta de correo automatizada, por favor, no respondas o reenvíes mensajes a este correo.</span>
				</div>
				`
			};

			transporter.sendMail(mailOptions, (err, inf) => {
				if (err && ind === 0) {
					req.flash('error', 'No se pudo enviar la notificación.');
					return res.redirect(`/class${classId}`);
				};
			});
		});
			
		req.flash('success', 'Notificación enviada exitosamente.');
		return res.redirect(`/class${classId}`);
	};

	res.redirect(`/inicio`);
});

router.get('/class:classId/del', isLoggedIn, async (req, res) => {
	const { id: teacherId, type } = req.user;

	if (type !== 'teacher')  {
		return res.redirect('/inicio');
	};

	const { classId } = req.params;

	const classInfo = await pool.query('SELECT * FROM classes WHERE id = ? AND id_teacher = ?', [ classId, teacherId ]);

	if (classInfo.length < 1) {
		req.flash('error', 'No se pudo eliminar la clase');
		return res.redirect('/inicio');
	};

	await pool.query('DELETE FROM student_class WHERE id_class = ?', [ classId ]);
	await pool.query('DELETE FROM classes WHERE id = ? AND id_teacher = ?', [ classId, teacherId ]);

	req.flash('success', 'Clase eliminada exitosamente.');
	res.redirect('/inicio');
});

router.get('/class:classId/student/exit', isLoggedIn, async (req, res) => {
	const { id: userId, type } = req.user;
	const { classId } = req.params;

	if (type !== 'student') return res.redirect(`/class${classId}`);

	const studentClass = await pool.query(
	`SELECT sc.id_student, sc.id_class, c.students
	FROM student_class sc
	LEFT JOIN classes c
	ON sc.id_class = c.id
	WHERE sc.id_student = ? AND sc.id_class = ?`,
	[ userId, classId ]);

	if (studentClass.length < 1) {
		req.flash('success', 'No has podido salir de la clase.');
		res.redirect(`/class${classId}`);
	};

	const [ studentInfo ] = studentClass;
	const { id_student, id_class, students } = studentInfo;

	await pool.query('DELETE FROM student_class WHERE id_student = ? AND id_class = ?', [ id_student, id_class ]);
	await pool.query('UPDATE classes SET students = ? WHERE id = ?', [ students - 1, id_class ]);

	req.flash('success', 'Has salido de la clase exitosamente.');
	res.redirect('/inicio');
});

router.get('/class:classId/student/del/:studentId', isLoggedIn, async (req, res) => {
	const { id, type } = req.user;

	if (type === 'teacher') {
		const { classId, studentId } = req.params;

		const teacherClass = await pool.query('SELECT * FROM classes WHERE id = ? AND id_teacher = ?', [ classId, id ]);

		if (teacherClass.length < 0) {
			req.flash('error', 'El estudiante no se pudo eliminar de la clase.');
			return res.redirect(`/class${classId}`);
		};

		const studentInClass = await pool.query('SELECT * FROM student_class WHERE id_student = ? AND id_class = ?', [ studentId, classId ]);

		if (studentInClass.length < 0) {
			req.flash('error', 'El estudiante no esta en esta clase.');
			return res.redirect(`/class${classId}`);
		};

		await pool.query('DELETE FROM student_class WHERE id_student = ? AND id_class = ?', [ studentId, classId ]);
		await pool.query('UPDATE classes SET students = ? WHERE id = ?', [ teacherClass[0].students - 1, classId ]);

		req.flash('success', 'Estudiante eliminado exitosamente.');
		return res.redirect(`/class${classId}`);
	};

	res.redirect('/inicio');
});

router.post('/class:classId/student:studentId/grades', isLoggedIn, async (req, res) => {
	const { id, type } = req.user;

	if (type === 'teacher') {
		const { classId, studentId } = req.params;

		const teacherClass = await pool.query('SELECT * FROM classes WHERE id = ? AND id_teacher = ?', [ classId, id ]);

		if (teacherClass.length < 0) {
			req.flash('error', 'No se pudo guardar las notas.');
			return res.redirect(`/class${classId}`);
		};

		const { tests: numTests } = teacherClass[0];

		const studentInClass = await pool.query('SELECT * FROM student_class WHERE id_student = ? AND id_class = ?', [ studentId, classId ]);

		if (studentInClass.length < 0) {
			req.flash('error', 'El estudiante no esta en esta clase.');
			return res.redirect(`/class${classId}`);
		};
		
		const objGrades = req.body;

		const parsedGrades = Object.values(objGrades).map((grade, ind, { length }) => {
			if (length - 1 === ind) {
				return {
					test: `Otros`,
					grade: Number(grade)
				};
			};
			return {
				test: `Evaluación ${ind + 1}`,
				grade: Number(grade)
			};
		});

		const totalGr = Object.values(objGrades).reduce((a, b) => Number(a) + Number(b));
		const canRecu = ((60 * Number(numTests)) - totalGr) <= 100 ? 1 : 0;

		await pool.query('UPDATE student_class SET grade = ?, canRecu = ? WHERE id_student = ? AND id_class = ?', [ JSON.stringify(parsedGrades), canRecu, studentId, classId ]);

		req.flash('success', 'Cambios guardados exitosamente.');
		return res.redirect(`/class${classId}`);
	};

	res.redirect('/inicio');
});

router.get('/report', isLoggedIn, async (req, res) => {
	const { id, type } = req.user;
	const REPath = join(__dirname, '../public', 'assets', 'logos', 'RE_logo.jpg');
	const UNERGPath = join(__dirname, '../public', 'assets', 'logos', 'UNERG_logo.jpg');
	const RobotoPath = join(__dirname, '../public', 'assets', 'fonts', 'Roboto-Regular.ttf');
	const RobotoBlackPath = join(__dirname, '../public', 'assets', 'fonts', 'Roboto-Black.ttf');
	const day = new Date().toLocaleString('es-VE', { day: '2-digit' });
	const month = new Date().toLocaleString('es-VE', { month: 'long' });
	const year = new Date().toLocaleString('es-VE', { year: 'numeric' });
	const mm = `${month[0].toUpperCase()}${month.slice(1)}`;
	const newDate = `${day} de ${mm} de ${year}`;
	const time =  new Date().toLocaleTimeString('es-VE', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
		timeZone: 'America/Caracas'
	})
	.replace("p. m.", "PM")
	.replace("a. m.", "AM");

	const cWidth = 900;
	const cHeight = 500;

	const configuration = {
		type: 'pie',
		plugins: [
			{
				id: 'background-colour',
				beforeDraw: chart => {
					const ctx = chart.ctx;
					ctx.save();
					ctx.fillStyle = 'white';
					ctx.fillRect(0, 0, cWidth, cHeight);
					ctx.restore();
				}
			}
		]
	};

	/** @param { import('chart.js') } ChartJS */
	const chartCallback = ChartJS => {
		ChartJS.defaults.responsive = true;
		ChartJS.defaults.maintainAspectRatio = false;
	};

	const chartJSNodeCanvas = new ChartJSNodeCanvas({
		width: cWidth,
		height: cHeight,
		chartCallback
	});

	chartJSNodeCanvas.registerFont(RobotoPath, {
		family: 'Roboto',
		weight: 'normal'
	});

	chartJSNodeCanvas.registerFont(RobotoBlackPath, {
		family: 'Roboto-Black',
		weight: 'black'
	});

	if (type === 'teacher') {
		const REImgData = readFileSync(REPath).toString('base64');
		const UNERGImgData = readFileSync(UNERGPath).toString('base64');
		
		const doc = new jsPDF({
			orientation: 'portrait',
			unit: 'pt',
			format: 'a4',
			filters: [ "ASCIIHexEncode" ]
		});

		const { width: pWidth, height: pHeight } = doc.internal.pageSize;

		const margins = {
			left: 25,
			top: 25,
			right: pWidth - 25,
			bottom: pHeight - 25
		};
		let x = margins.left, y = margins.top;

		doc.addImage(REImgData, 'JPEG', x, y + 9.25, 104, 18.5, 'RE_logo', 'NONE');
		doc.addImage(UNERGImgData, 'JPEG', margins.right - 90, y, 90, 37, 'UNERG_logo', 'NONE');
		y += 100;

		doc.setFontSize(12);
		doc.setFont('Roboto-Bold', 'bold');

		const classesDetails = await pool.query(
		`SELECT c.name AS c_name, c.section AS c_section, CONCAT(t.firstname, ' ', t.lastname) AS t_name, t.ci AS t_ci, CONCAT(s.firstname, ' ', s.lastname) AS s_name, s.ci AS s_ci, sc.canRecu
		FROM students s
		LEFT JOIN student_class sc
		ON s.id = sc.id_student
		LEFT JOIN classes c
		ON c.id = sc.id_class
		LEFT JOIN teachers t
		ON t.id = c.id_teacher
		WHERE c.id_teacher = ${ id }
		ORDER BY c.name ASC`);

		const { 0: { t_ci, t_name } } = classesDetails;

		doc.text('Reporte', pWidth / 2, y, { align: 'center' });

		y += 35;

		addText(`**Profesor:** ${t_name}`, doc, x, y, 12, 'Roboto', 'top');

		y += 20

		addText(`**Cédula:** V - ${new Intl.NumberFormat('es-VE').format(t_ci)}`, doc, x, y, 12, 'Roboto', 'top');

		y += 20

		addText(`**Fecha:** ${newDate}, ${time}`, doc, x, y, 12, 'Roboto', 'top');

		y += 20

		/** 
		 * @typedef {object} ClassDetails
		 * @property {string} name
		 * @property {string} section
		 * @property {object} teacher
		 * @property {string} teacher.name
		 * @property {string} teacher.ci
		 * @property {{
		 * 		name: string,
		 * 		ci: string,
		 * 		recu: boolean
		 * }[]} students
		 */
		/** @type { Array.<ClassDetails> } */
		const classes = classesDetails.reduce((clss, currStudent) => {
			const lastClass = clss.findLast(arr => true);
			const { c_name, c_section, t_name, t_ci, s_name, s_ci, canRecu } = currStudent;

			const student = {
				name: s_name,
				ci: new Intl.NumberFormat('es-VE').format(s_ci),
				recu: Boolean(canRecu) ? 'Si' : 'No'
			};

			if (lastClass && lastClass.name === currStudent.c_name) {
				const lastClassInd = clss.findIndex(arr => arr.name === lastClass.name);
				clss.splice(lastClassInd, 1, {
					...lastClass,
					students: [
						...lastClass.students,
						student
					]
				});
				return clss;
			};

			const classDetails = {
				name: c_name,
				section: c_section,
				teacher: {
					name: t_name,
					ci: t_ci
				},
				recuQty: classesDetails.reduce((count, student) => {
					const { canRecu } = student;
					const validClass = c_name === student.c_name;
					if (validClass) {
						if (canRecu) return {
							...count,
							pst: count.pst + 1
						};
						
						return {
							...count,
							ngt: count.ngt + 1
						};
					};

					return count;
				}, { pst: 0, ngt: 0 })
			};

			clss.push({
				...classDetails,
				students: [ student ]
			});
			return clss;
		}, []);

		classes.forEach((c, ind) => {
			const { name, section, students, recuQty: { pst, ngt } } = c;

			const formatedStudents = students.map(s => {
				const { name, ci, recu } = s;
				return [
					name,
					ci, recu
				];
			});

			y += 25;
			
			if (checkY(y + 20, margins.bottom)) {
				doc.addPage();
				y = margins.top;
			};

			doc.autoTable({
				theme: 'grid',
				// head: [
				// 	[ 'Nombre', 'Cédula', 'Recuperación' ]
				// ],
				columns: [
					{ header: 'Nombre', dataKey: 'nombre' },
					{ header: 'Cédula', dataKey: 'cedula' },
					{ header: 'Recuperación', dataKey: 'recuperacion' }
				],
				body: formatedStudents,
				startY: y + 20,
				pageBreak: 'avoid',
				willDrawPage: data => {
					const { settings: { margin: { left } } } = data;
					addText(`**Clase:** ${name}, **sección:** ${section}`, data.doc, left, y, 12, 'Roboto', 'top');
				}
			});
			y = doc.lastAutoTable.finalY + 15;

			const data = {
				labels: [ 'Recuperables', 'Irrecuperables' ],
				datasets: [{
					data: [ pst, ngt ],
					backgroundColor: [ '#b4fecf', '#acbccd' ],
					borderColor: [ '#24ee71', '#5e7c99' ]
				}]
			};

			const avgChart = chartJSNodeCanvas.renderToDataURLSync({
				...configuration,
				data,
				options: {
					plugins: {
						legend: {
							display: true,
							position: 'left',
							labels: {
								font: {
									family: 'Roboto',
									weight: 'normal',
									size: 40
								}
							},
							title: {
								display: true,
								position: 'left',
								text: name.toUpperCase(),
								font: {
									family: 'Roboto-Black',
									weight: 'black',
									size: 22
								}
							}
						}
					}
				}
			}, 'image/jpeg');
			
			if (checkY(y + 129, margins.bottom)) {
				doc.addPage();
				y = margins.top;
			};

			doc.addImage(avgChart, 'JPEG', (pWidth / 2) - 130, y, 260, 144, `AVGCHART_${name}_Sec${section}_${ind}`, 'NONE');

			y += 125
		});

		addFooters(doc, margins);

		const pdf = doc.output('datauristring');
		return res.send(pdf);
	};

	res.redirect('/inicio');
});

export default router;