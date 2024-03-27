import { MultiForm } from './formsHandler.js';

// Function Listener Storage
const handlerFunctionListener = {};

/**
 * 
 * @param {HTMLElement} el Element
 * @param {HTMLElement} holder Div Container
 * @param {String} dir Direction
 * @returns {boolean} true or false
 */
const isElementVisible = (el, holder, dir) => {
	const { left: elemLeft, right: elemRight } = el.getBoundingClientRect();
	const { left: holdLeft, right: holdRight } = holder.getBoundingClientRect();

	if (dir === "left") {
		if ((Math.round(holdLeft) - Math.round(elemLeft)) > 0 && (Math.round(holdLeft) - Math.round(elemLeft)) <= 1) return true;
		return Math.round(holdLeft) - Math.round(elemLeft) <= 0;
	};

	if ((Math.round(elemRight) - Math.round(holdRight)) > 0 && (Math.round(elemRight) - Math.round(holdRight)) <= 1) return true;
	return Math.round(elemRight) - Math.round(holdRight) <= 0;
};

/**
 * @param {HTMLElement} element window that can be shown
 */
 const showElement = element => {
    element.classList.add('show');
};

/**
 * @param {HTMLElement} element window that can be hidden
 */
 const hideElement = element => {
    element.classList.remove('show');
};

/**
 * @param {HTMLElement} e 
 * @returns {boolean}
 */
 const isEllipsisActive = e => {
    return e.offsetWidth < e.scrollWidth;
};

const alertBox = () => {
    const alertBox = document.querySelector('.alertBox');
    const alertBoxCloseBtn = document.querySelector('.alertBox__container--close');

    if (alertBox) {
        alertBoxCloseBtn.addEventListener('click', () => {
            closeAlertBox();
        })

        setTimeout(() => {
            showElement(alertBox);
        }, 100);

        setTimeout(() => {
            closeAlertBox();
        }, 7200);

        const closeAlertBox = () => {
            hideElement(alertBox);
            setTimeout(() => {
                alertBox.remove();
            }, 200);
        };
    };
};

const copyToClipboard = code => navigator.clipboard.writeText(code);

const checkForm = () => {
    const signInForm = document.getElementById('signInUpForm');
    const signInBtn = document.getElementById('signInUpBtn');

    for (let i = 0; i < signInForm.elements.length; i++) {
        signInForm.elements[i].addEventListener('keyup', () => {
            signInForm.checkValidity() ? signInBtn.classList.add('next') : signInBtn.classList.remove('next');
        });
    };

	signInBtn.addEventListener('click', () => {
		if (signInBtn.classList.contains('next')) return signInForm.submit();

		for (let i = 0; i < signInForm.elements.length; i++) {
			if (signInForm[i].value.length === 0 || !signInForm[i].checkValidity()) {
				signInForm[i].focus();
				break;
			};
		};
	});
};

/**
 * Close/unshow HTML Element with Escape key
 * @param {HTMLElement} element Element that can close with Escape key
 */
const escapeCloseElement = element => {
    const elementClass = element.getAttribute('class').split(' ')[0];
    const elementName = elementClass + '_onEscapeKey';
    return handlerFunctionListener[elementName] || (handlerFunctionListener[elementName] = key => {
        if (key.code === 'Escape') {
            window.removeEventListener('keydown', escapeCloseElement(element));
            document.removeEventListener('click', clickCloseElement(element));

            hideElement(element);
        };
    });
};

/**
 * Close/unshow HTML Element with Click
 * @param {HTMLElement} element Element that can close with Click
 */
const clickCloseElement = element => {
    const elementClass = element.getAttribute('class').split(' ')[0];
    const elementName = elementClass + '_onClick';
    return handlerFunctionListener[elementName] || (handlerFunctionListener[elementName] = click => {
        if (click.target !== element && !Array.from(element.childNodes).includes(click.target)) {
            window.removeEventListener('keydown', escapeCloseElement(element));
            document.removeEventListener('click', clickCloseElement(element));

            hideElement(element);
        };
    });
};

/**
 * Close/unshow HTML Window with Escape key
 * @param {HTMLElement} win Window that can close with Escape key
 */
const escapeCloseWindow = win => {
    const windowClass = win.getAttribute('class').split(' ')[0];
    const windowName = 'win_' + windowClass + '_onEscapeKey';
    return handlerFunctionListener[windowName] || (handlerFunctionListener[windowName] = key => {
        if (key.code === 'Escape') {
            window.removeEventListener('keydown', escapeCloseWindow(win));
            document.removeEventListener('click', clickCloseWindow(win));

            hideElement(win);
            hideElement(document.querySelector('.main_cover'));
        };
    });
};

/**
 * Close/unshow HTML Window with Click
 * @param {HTMLElement} win Window that can close with Click
 */
 const clickCloseWindow = win => {
    const windowClass = win.getAttribute('class').split(' ')[0];
    const windowName = 'win_' + windowClass + '_onClick';
    return handlerFunctionListener[windowName] || (handlerFunctionListener[windowName] = click => {
        if (click.target.classList.contains('main_cover')) {
            window.removeEventListener('keydown', escapeCloseWindow(win));
            document.removeEventListener('click', clickCloseWindow(win));

            hideElement(win);
            hideElement(document.querySelector('.main_cover'));
        };
    });
};

/**
 * @param {HTMLElement} win window that can be shown
 */
const showWindow = win => {
    showElement(win);
    showElement(document.querySelector('.main_cover'));

    setTimeout(() => {
        if (win.classList.contains('show')) {
            window.addEventListener('keydown', escapeCloseWindow(win));
            document.addEventListener('click', clickCloseWindow(win));
        };
    }, 300);
};

/**
 * Close/unshow HTML Element with Escape key
 * @param {HTMLElement} element Element that can close with Escape key
 */
 const escapeDeactivateElement = element => {
    const elementClass = element.getAttribute('class').split(' ')[0];
    const elementName = elementClass + '_onEscapeKey';
    return handlerFunctionListener[elementName] || (handlerFunctionListener[elementName] = key => {
        if (key.code === 'Escape') {
            window.removeEventListener('keydown', escapeDeactivateElement(element));
            document.removeEventListener('click', clickDeactivateElement(element));

            element.classList.remove('active');
        };
    });
};

/**
 * Close/unshow HTML Element with Click
 * @param {HTMLElement} element Element that can close with Click
 */
const clickDeactivateElement = element => {
    const elementClass = element.getAttribute('class').split(' ')[0];
    const elementName = elementClass + '_onClick';
    return handlerFunctionListener[elementName] || (handlerFunctionListener[elementName] = click => {
        if (click.target !== element && !Array.from(element.childNodes).includes(click.target)) {
            window.removeEventListener('keydown', escapeDeactivateElement(element));
            document.removeEventListener('click', clickDeactivateElement(element));

            element.classList.remove('active');
        };

        if (element.classList.contains('active') && click.target === element || Array.from(element.childNodes).includes(click.target)) {
            window.removeEventListener('keydown', escapeDeactivateElement(element));
            document.removeEventListener('click', clickDeactivateElement(element));

            element.classList.remove('active');
        };
    });
};

/**
 * @param {HTMLElement} element window that can be shown
 */
 const activateElementX = element => {
    element.classList.add('active');

    setTimeout(() => {
        if (element.classList.contains('active')) {
            window.addEventListener('keydown', escapeDeactivateElement(element));
            document.addEventListener('click', clickDeactivateElement(element));
        };
    }, 300);
};

/**
 * @param {HTMLElement} container 
 * @param {[HTMLElement]} buttons 
 * @param {String} idForm 
 * @returns {void}
 */
const containerSlider = (container, [prev, next], idForm) => {
	const containerName = `sliderForm_${idForm}_onScroll`;
	return handlerFunctionListener[containerName] || (handlerFunctionListener[containerName] = e => {
		if (Math.ceil(container.offsetWidth + container.scrollLeft) >= container.scrollWidth) next.classList.add("unshow");
		if (container.scrollLeft === 0) prev.classList.add("unshow");
	});
};

/**
 * @param {HTMLElement} container
 * @param {HTMLElement[]} btn 
 * @param {HTMLElement[]} elements 
 * @param {String} id 
 * @param {String} dir 
 * @return {void}
 */
const containerSliderScroll = (container, [prev, next], elements, id, dir) => {
	const scrollBtnName = `scrollBtn_${dir}_${id}`;
	return handlerFunctionListener[scrollBtnName] || (handlerFunctionListener[scrollBtnName] = e => {
		let toScroll = null;
		if (dir === "left") toScroll = elements.findLast(test => !isElementVisible(test, container, dir));
		if (dir === "right") toScroll = elements.find(test => !isElementVisible(test, container, dir));

		if (!toScroll) return;
		
		toScroll.scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: dir === "left" ? "nearest" : "end"
		});
		if (dir === "left") next.classList.remove("unshow");
		if (dir === "right") prev.classList.remove("unshow");
	});
};

document.addEventListener('DOMContentLoaded', () => {
	alertBox();

    // Variables
    const links = document.querySelectorAll('a');
    const loggedUser = document.getElementById('loggedUser');
    const inputNumbers = document.querySelectorAll('input[type="number"]');
    const inputs = document.querySelectorAll('input');
	const reportBtn = document.getElementById("report");

    links.forEach(link => {
        link.addEventListener('dragstart', e => {
            e.preventDefault();
        });
    });

    inputNumbers.forEach(input => {
		input.addEventListener("keydown", e => {
			const maxValue = Number(input.max);
			let inputValue = input.value;
			
			if (e.key !== ".") return;
			if (Number(inputValue) !== maxValue) return;
			e.preventDefault();
		});

        input.addEventListener('input', e => {
            const maxLength = Number(input.maxLength);
            const maxValue = Number(input.max);
            const minValue = Number(input.min);
            let value = input.value;

            if (value.length > maxLength) input.value = value.slice(0, maxLength);
            if (Number(value) > maxValue) input.value = value.slice(0, -1);
            if (Number(value) < minValue) input.value = value.slice(0, -1);
        });
    });

    inputs.forEach(input => {
		input.value.length > 0 ? input.classList.add('input--nonEmpty') : input.classList.remove('input--nonEmpty');
        input.addEventListener('input', () => {
            const value = input.value;

            value.length > 0 ? input.classList.add('input--nonEmpty') : input.classList.remove('input--nonEmpty');
        });
    });

    if (loggedUser) {
        const userMenu = loggedUser.querySelector('.userMenu');
        loggedUser.addEventListener('click', () => {
            if (!userMenu.classList.contains('show')) {
                showElement(userMenu);
                setTimeout(() => {
                    if (userMenu.classList.contains('show')) {
                        window.addEventListener('keydown', escapeCloseElement(userMenu));
                        document.addEventListener('click', clickCloseElement(userMenu));
                    };
                }, 300);
            };
        });

		if (reportBtn) reportBtn.addEventListener("click", async e => {
			if (reportBtn.classList.contains('loading')) return e.preventDefault();
			
			reportBtn.classList.toggle('loading');
			const res = await fetch('/report');
			const url = await res.text();
			const link = document.createElement('a');

			link.href = url;
			link.setAttribute('download', 'Reporte.pdf');
			document.body.appendChild(link);
			reportBtn.classList.toggle('loading');
			link.click();
			link.remove();
		});
    };

	if (document.title === 'Inicio') {
		const newClass = document.getElementById("newClass");
		const newClassBtn = newClass.querySelector(".button");
		const joiningClass = document.querySelector(".joiningClass");
		const joinClass = document.querySelector(".joinClass");
        const classesTitles = document.querySelectorAll('.class__details--title');
		
		joinClass.addEventListener("click", () => {
			showWindow(joiningClass);
		});

        classesTitles.forEach(title => {
            if (isEllipsisActive(title)) title.setAttribute('title', title.innerText);
        });

		for (let i = 0; i < newClass.elements.length; i++) {
			newClass.elements[i].addEventListener("input", () => {
				newClass.checkValidity() ? newClassBtn.classList.add('submit') : newClassBtn.classList.remove('submit');
			});
		};

		newClassBtn.addEventListener("click", () => {
			if (newClassBtn.classList.contains("submit") && newClass.checkValidity()) {
				return newClass.submit();
			};

			for (let i = 0; i < newClass.elements.length; i++) {
				if (newClass[i].value.length === 0 || !newClass[i].checkValidity()) {
					newClass[i].focus();
					newClass[i].reportValidity();
					break;
				};
			};
		});
	};

    if (document.title === 'RecuEngine - Inicio') {
		const newClass = document.getElementById("newClass");
		const newClassBtn = newClass.querySelector(".button");
        const classesTitles = document.querySelectorAll('.class__details--title');
        const createClass = document.querySelector('.createClass');
        const creatingClass = document.querySelector('.creatingClass');
		const inputColor = document.getElementById("colorClass");
		const colorElements = document.querySelector(".select__input--container").querySelectorAll(".element");
		const colors = [ "EDNddrdRnO", "dWRAwWrYAr", "RaDdAAzLAz", "cIiLIECLii", "uAHNELuHnp", "duEZEURZrr", "cPfPABCPLb", "oUFoGUErUe", "u1458OOL1w", "UfVL6sSUuF" ];
		inputColor.setCustomValidity("empty");

        classesTitles.forEach(title => {
            if (isEllipsisActive(title)) title.setAttribute('title', title.innerText);
        });

        createClass.addEventListener('click', () => {
            showWindow(creatingClass);
        });

		colorElements.forEach((color, index) => {
			color.addEventListener("click", () => {
				colorElements.forEach(colorActive => {
					if (colorActive.classList.contains("active")) colorActive.classList.remove("active");
				});

				inputColor.value = colors[index];
				inputColor.setCustomValidity("");
				inputColor.dispatchEvent(new Event("input"));
				color.classList.add("active");
			});
		});

		for (let i = 0; i < newClass.elements.length; i++) {
			newClass.elements[i].addEventListener("input", () => {
				newClass.checkValidity() && colors.includes(inputColor.value) ? newClassBtn.classList.add('submit') : newClassBtn.classList.remove('submit');
			});
		};

		newClassBtn.addEventListener("click", () => {
			if (newClassBtn.classList.contains("submit") && newClass.checkValidity() && colors.includes(inputColor.value)) {
				return newClass.submit();
			};

			for (let i = 0; i < newClass.elements.length; i++) {
				if (newClass[i].value.length === 0 || !newClass[i].checkValidity()) {
					newClass[i].focus();
					newClass[i].reportValidity();
					break;
				};
			};
		});
    };

	if (document.title === 'RecuEngine - Clase') {
		const main = document.body.querySelector("main");
		const mainCover = main.querySelector(".main_cover");
		const students = document.querySelector(".content__container--students").childElementCount === 2 ? true : false;
		const codeShow = document.querySelector(".code__show");
		const codeUnShow = document.querySelector(".code__unshow");
		const [ dots ] = document.querySelector(".code__container").children;
		const codeContainerClassID = document.querySelector(".code__container--classID");
		const [ code ] = codeContainerClassID.children;
		const classId = window.location.pathname.split("/class")[1];
		const sendNotiBtn = document.querySelector(".classDetails__header--centralInfo > .classDetails__bottom > .classDetails__bottom--button.send");
		const delClassBtn = document.querySelector(".classDetails__header--centralInfo > .classDetails__bottom > .classDetails__bottom--button.del");

		if (students) {
			const validRecus = document.querySelectorAll(".content__student--row > .content__field > svg.valid").length > 0 ? true : false;
			const editGrButton = document.querySelectorAll(".content__button.edit");
			const delStudButton = document.querySelectorAll(".content__button.delete");
			const submitGrButton = document.querySelectorAll(".content__button.submit");
			const cancelGrButton = document.querySelectorAll(".content__button.cancel");

			const cantSendNotiModal = `
			<div id="cantSendNoti" class="cantSendNoti">
				<div class="cantSendNoti__container">
					<span class="cantSendNoti__container--title">Enviar notificación</span>
					<span class="cantSendNoti__container--context">No hay estudiantes que puedan hacer el recuperativo para enviarles la notificación.</span>
					<div class="cantSendNoti__container--buttons">
						<button class="cantSendNoti__buttons accept">Aceptar</button>
					</div>
				</div>
			</div>
			`;

			const sendNotiForm = (today, maxDate) => {
				return `
					<div class="sendNotiForm">
						<div class="sendNotiForm__container">
							<span class="sendNotiForm__container--title">Enviar notificación</span>
							<span class="sendNotiForm__container--context">Seleccione la fecha del recuperativo para notificarle a los estudiantes.</span>
							<form id="sendNotiForm" action="/class${classId}/send" method="post">
								<input type="date" name="dateRecu" id="dateRecu" min="${today}" max="${maxDate}" required>
								<div class="sendNotiForm__container--buttons">
									<button class="sendNotiForm__buttons cancel">Cancelar</button>
									<button class="sendNotiForm__buttons accept">Aceptar</button>
								</div>
							</form>
						</div>
					</div>
				`;
			};

			sendNotiBtn.addEventListener("click", () => {
				if (validRecus) {
					const [ yyyy, mm, dd ] = new Date().toISOString().split("T")[0].split("-");
					const today = `${yyyy}-${mm}-${dd}`
					const maxDate = `${Number(yyyy) + 1}-${mm}-${dd}`
	
					showElement(mainCover);
					main.insertAdjacentHTML("afterbegin", sendNotiForm(today, maxDate));
					const sendNotiNode = document.querySelector(".sendNotiForm");
					const notiForm = document.getElementById("sendNotiForm");
					const dateRecu = document.getElementById("dateRecu");
					const [ cancel, accept ] = document.querySelector(".sendNotiForm__container--buttons").children;
	
					cancel.addEventListener("click", e => {
						e.preventDefault();
						sendNotiNode.remove();
						hideElement(mainCover);
					});
	
					accept.addEventListener("click", e => {
						e.preventDefault();
						const mindate = new Date(today).getTime();
						const maxdate = new Date(maxDate).getTime();
						const dateValue = new Date(dateRecu.value).getTime();
						const validDate = dateValue >= mindate && dateValue <= maxdate;
	
						notiForm.checkValidity() && validDate ? notiForm.submit() : notiForm.reportValidity();
					});
					return;
				};

				showElement(mainCover);
				main.insertAdjacentHTML("afterbegin", cantSendNotiModal);
				const cantSendNoti = document.getElementById("cantSendNoti");
				const [ accept ] = document.querySelector(".cantSendNoti__container--buttons").children;
				
				accept.addEventListener("click", e => {
					e.preventDefault();
					cantSendNoti.remove();
					hideElement(mainCover);
				});
			});

			const delStudentForm = `
			<div id="delStudent" class="delStudent">
				<div class="delStudent__container">
					<span class="delStudent__container--title">Eliminar Estudiante</span>
					<span class="delStudent__container--context">¿Esta seguro de que sea eliminar al estudiante de esta clase?</span>
					<div class="delStudent__container--buttons">
						<button class="delStudent__buttons cancel">Cancelar</button>
						<button class="delStudent__buttons accept">Aceptar</button>
					</div>
				</div>
			</div>
			`;

			delStudButton.forEach(delBtn => {
				delBtn.addEventListener("click", e => {
					const { dataset: { usrid } } = e.currentTarget;

					showElement(mainCover);
					main.insertAdjacentHTML("afterbegin", delStudentForm);
					const delStudentNode = document.getElementById("delStudent");
					const delStudentBtns = document.querySelector(".delStudent__container--buttons");
					const [ cancel, accept ] = delStudentBtns.children;

					cancel.addEventListener("click", e => {
						delStudentNode.remove();
						hideElement(mainCover);
					});

					accept.addEventListener("click", e => {
						window.location.href = `/class${classId}/student/del/${usrid}`;
					});
				});
			});

			editGrButton.forEach(details => {
				const { dataset: { usrid } } = details;
				const boxContainerRow = details.parentElement;
				const boxContainerEditMode = details.parentElement.nextElementSibling;
				const studentRow = document.querySelector(`.content__fields--student[data-usrid="${usrid}"]`);
				const studentRowDetails = studentRow.querySelector(".content__student--details");
				const form = studentRowDetails.querySelector("form");
				const formParent = form.parentElement;
				const tests = [...form.children];
				const [ prev, next ] = [...studentRowDetails.querySelectorAll(".student__grades--button")];

				details.addEventListener("click", e => {
					boxContainerRow.classList.remove("active");
					boxContainerEditMode.classList.add("active");
					studentRowDetails.classList.remove("unshow");
					studentRow.scrollIntoView();

					const needSlide = formParent.offsetWidth < formParent.scrollWidth;

					if (needSlide) next.classList.remove("unshow");

					formParent.addEventListener("scroll", containerSlider(formParent, [prev, next], usrid));

					prev.addEventListener("click", containerSliderScroll(formParent, [prev, next], tests, usrid, "left"));
					next.addEventListener("click", containerSliderScroll(formParent, [prev, next], tests, usrid, "right"));
				});
			});

			submitGrButton.forEach(submit => {
				const { dataset: { usrid } } = submit;
				const studentRow = document.querySelector(`.content__fields--student[data-usrid="${usrid}"]`);
				const studentRowDetails = studentRow.querySelector(".content__student--details");
				const form = studentRowDetails.querySelector("form");
				const inputs = [...form.elements];
				const defaultGr = inputs.map(input => Number(input.value)).join(", ");


				inputs.forEach(input => {
					input.addEventListener("input", e => {
						const currentGr = inputs.map(input => Number(input.value)).join(", ");
						
						if (currentGr === defaultGr) {
							submit.setAttribute('title', 'No hay cambios para guardar')
							return submit.classList.add("disabled");
						};

						submit.setAttribute('title', 'Guardar cambios');
						return submit.classList.remove("disabled");
					});
				});

				submit.addEventListener("click", e => {
					const btn = e.currentTarget;
					if (btn.classList.contains("disabled")) return;

					form.submit();
				});
			});

			cancelGrButton.forEach(cancel => {
				const { dataset: { usrid } } = cancel;
				const studentRow = document.querySelector(`.content__fields--student[data-usrid="${usrid}"]`);
				const studentRowDetails = studentRow.querySelector(".content__student--details");
				const form = studentRowDetails.querySelector("form");
				const formParent = form.parentElement;
				const tests = [...form.elements];
				const testsInitialValues = tests.map(input => input.value);
				const [ prev, next ] = [...studentRowDetails.querySelectorAll(".student__grades--button")];
				const submitBtn = cancel.previousElementSibling;

				cancel.addEventListener("click", e => {
					const boxContainerEditMode = cancel.parentElement;
					const boxContainerRow = cancel.parentElement.previousElementSibling;

					tests.forEach((input, ind) => {
						input.value = testsInitialValues[ind];
					});

					submitBtn.setAttribute('title', 'No hay cambios para guardar')
					submitBtn.classList.add("disabled");

					formParent.removeEventListener("scroll", containerSlider(formParent, [prev, next], usrid));
					prev.removeEventListener("click", containerSliderScroll(formParent, [prev, next], tests, usrid, "left"));
					next.removeEventListener("click", containerSliderScroll(formParent, [prev, next], tests, usrid, "right"));

					prev.classList.add("unshow");
					next.classList.remove("unshow");
					formParent.scrollLeft = 0;

					studentRowDetails.classList.add("unshow");
					boxContainerRow.classList.add("active");
					boxContainerEditMode.classList.remove("active");
				});
			});
		};

		if (!students) {
			const cantSendNotiModal = `
			<div id="cantSendNoti" class="cantSendNoti">
				<div class="cantSendNoti__container">
					<span class="cantSendNoti__container--title">Enviar notificación</span>
					<span class="cantSendNoti__container--context">No hay estudiantes en esta clase para enviarles la notificación.</span>
					<div class="cantSendNoti__container--buttons">
						<button class="cantSendNoti__buttons accept">Aceptar</button>
					</div>
				</div>
			</div>
			`;

			sendNotiBtn.addEventListener("click", () => {
				showElement(mainCover);
				main.insertAdjacentHTML("afterbegin", cantSendNotiModal);
				const cantSendNoti = document.getElementById("cantSendNoti");
				const [ accept ] = document.querySelector(".cantSendNoti__container--buttons").children;
				
				accept.addEventListener("click", e => {
					e.preventDefault();
					cantSendNoti.remove();
					hideElement(mainCover);
				});
			});
		};

		delClassBtn.addEventListener('click', () => {
			const delClassModal = `
			<div id="delClass" class="delClass">
				<div class="delClass__container">
					<span class="delClass__container--title">Eliminar Clase</span>
					<span class="delClass__container--context">¿Esta seguro de que sea eliminar esta clase?</span>
					<div class="delClass__container--buttons">
						<button class="delClass__buttons cancel">Cancelar</button>
						<button class="delClass__buttons accept">Aceptar</button>
					</div>
				</div>
			</div>
			`;

			showElement(mainCover);
			main.insertAdjacentHTML("afterbegin", delClassModal);
			const delClass = document.getElementById("delClass");
			const [ cancel, accept ] = document.querySelector(".delClass__container--buttons").children;

			cancel.addEventListener("click", () => {
				delClass.remove();
				hideElement(mainCover);
			});

			accept.addEventListener("click", () => {
				window.location.href = `/class${classId}/del`;
			});
		});

		code.addEventListener("click", e => {
			const { innerText: classID } = e.currentTarget;

			copyToClipboard(classID);
		});

		codeShow.addEventListener("click", e => {
			e.currentTarget.classList.remove("active");
			codeUnShow.classList.add("active");
			dots.classList.remove("active");
			codeContainerClassID.classList.add("active");
		});

		codeUnShow.addEventListener("click", e => {
			e.currentTarget.classList.remove("active");
			codeShow.classList.add("active");
			dots.classList.add("active");
			codeContainerClassID.classList.remove("active");
		});
	};

	if (document.title === 'Clase') {
		const main = document.body.querySelector("main");
		const mainCover = main.querySelector(".main_cover");
		const classId = window.location.pathname.split("/class")[1];
		const exitClassBtn = document.querySelector(".classDetails__header--centralInfo > .classDetails__bottom > .classDetails__bottom--button.exit");
		const grades = document.querySelectorAll(".content__container--fields > .content__fields--student > .content__student--row > .content__field.grade");

		const exitClassModal = `
			<div id="exitClass" class="exitClass">
				<div class="exitClass__container">
					<span class="exitClass__container--title">Salir de la clase</span>
					<span class="exitClass__container--context">¿Esta seguro de que desea salir de esta clase?</span>
					<div class="exitClass__container--buttons">
						<button class="exitClass__buttons cancel">Cancelar</button>
						<button class="exitClass__buttons accept">Aceptar</button>
					</div>
				</div>
			</div>
		`;

		grades.forEach(grade => {
			const { dataset: { usrid } } = grade;
			const studentRow = document.querySelector(`.content__fields--student[data-usrid="${usrid}"]`);
			const studentRowDetails = studentRow.querySelector(".content__student--details");
			const gradeContainer = studentRowDetails.querySelector(".student__grades--selected");
			const tests = [...gradeContainer.children];
			const [ prev, next ] = [...studentRowDetails.querySelectorAll(".student__grades--button")];

			console.log(prev, next);

			grade.addEventListener("click", e => {
				if (grade.classList.contains("open")) {
					grade.classList.remove("open");
					studentRowDetails.classList.add("unshow");

					gradeContainer.removeEventListener("scroll", containerSlider(gradeContainer, [prev, next], usrid));
					prev.removeEventListener("click", containerSliderScroll(gradeContainer, [prev, next], tests, usrid, "left"));
					next.removeEventListener("click", containerSliderScroll(gradeContainer, [prev, next], tests, usrid, "right"));

					prev.classList.add("unshow");
					next.classList.add("unshow");
					gradeContainer.scrollLeft = 0;
					return;
				};

				grade.classList.add("open");

				studentRowDetails.classList.remove("unshow");
				studentRow.scrollIntoView();

				const needSlide = gradeContainer.offsetWidth < gradeContainer.scrollWidth;
				if (!needSlide) return;

				console.log(tests);

				next.classList.remove("unshow")
				gradeContainer.addEventListener("scroll", containerSlider(gradeContainer, [prev, next], usrid));
				prev.addEventListener("click", containerSliderScroll(gradeContainer, [prev, next], tests, usrid, "left"));
				next.addEventListener("click", containerSliderScroll(gradeContainer, [prev, next], tests, usrid, "right"));
			});
		});

		exitClassBtn.addEventListener('click', () => {
			showElement(mainCover);
			main.insertAdjacentHTML('afterbegin', exitClassModal);
			const exitClass = document.getElementById("exitClass");
			const [ cancel, accept ] = document.querySelector('.exitClass__container--buttons').children;

			cancel.addEventListener('click', () => {
				exitClass.remove();
				hideElement(mainCover);
			});

			accept.addEventListener('click', () => {
				window.location.href = `/class${classId}/student/exit`;
			});
		});
	};

	if (document.title === 'Iniciar Sesión') {
        checkForm();
	};

	if (document.title === 'Registrarse') {
        const registerForm = document.getElementById('signInUpForm');
        const formNavbar = document.getElementById('formNavbar');
        const formViews = document.getElementById('formViews');
        const nextBtn = document.getElementById('signInUpBtn');
        const register = new MultiForm(formViews, formNavbar, nextBtn, registerForm);

        register.activate();

        if (register.currentActiveForm().classList.contains('form1')) {
            Array.from(register.currentActiveForm().children[1].children).forEach(e => {
                if (e.classList.contains('type')) {
                    e.addEventListener('click', () => {
                        if (!e.classList.contains('active')) {
                            Array.from(register.currentActiveForm().children[1].children).forEach(e => {
                                if (e.classList.contains('active')) {
                                    e.classList.remove('active');
                                    e.classList.add('inactive');
                                };
                            });

                            if (e.classList.contains('inactive')) e.classList.remove('inactive');
                            e.classList.add('active');
                            
                            register.currentActiveForm().querySelector('input').value = e.children[1].innerText;
                        };

                        if (!register.currentActiveForm().classList.contains('valid')) {
                            register.currentActiveForm().classList.add('valid');
                            register.currentActiveForm().classList.add('ready');
                            register.triggerFormEvent(register.currentActiveForm(), true, false);
                        };

                        if (register.currentActiveForm().children[0].classList.contains('invalid')) register.currentActiveForm().children[0].classList.remove('invalid');
                    });
                };
            });
        };
	};
});