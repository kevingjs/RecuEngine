import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import pool from '../database.js';
import helpers from '../lib/helpers.js';

passport.use('local.ingresar', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const query = await pool.query('SELECT * from teachers WHERE email = ? UNION select * from students WHERE email = ?', [username, username]);
    if (query.length > 0) {
        const user = query[0];
        const validPass = await helpers.matchPass(password, user.password);

        if (validPass === true) {
            done(null, user, req.flash('success', '¡Inicio de sesión exitoso!'));
        } else {
            done(null, false, req.flash('error', 'Contraseña incorrecta'));
        };
    } else {
        return done(null, false, req.flash('error', 'El correo electrónico no existe'));
    };
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'pass',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { type, firstname, lastname, ci, cpass } = req.body;
    const query = await pool.query('SELECT * from teachers WHERE ci = ? OR email = ? UNION select * from students WHERE ci = ? OR email = ?', [ci, email = username, ci, email = username]);
    
    const result = query => {
        let sql = query;
        if (sql.length === 0) {
            sql = {
                ci: false,
                username: false,
                email: false
            };
        } else {
            sql = sql[0];
        };
        return sql;
    };

    if (password === cpass) {
        if (ci !== result(query).ci) {
            if (!email == result(query).email) {
                const newUser = {
                    firstname: firstname.trim(),
                    lastname: lastname.trim(),
                    ci,
                    email: username,
                    password
                };
                newUser.password = await helpers.encryptPass(password);

				const table = type === 'Docente' ? 'teachers' : 'students';

                const result = await pool.query(`INSERT INTO ${table} SET ?`, [newUser]);
                newUser.id = result.insertId;
                return done(null, newUser, req.flash('success', '¡Cuenta creada exitosamente!'));
            } else {
                return done(null, false, req.flash('error', 'El correo electrónico ya existe'));
            };
        } else {
            return done(null, false, req.flash('error', 'La cédula ya existe'));
        };
    } else {
        return done(null, false, req.flash('error', 'Las contraseñas deben ser iguales'));
    };
}));

passport.serializeUser((user, done) => {
    done(null, user.ci);
});

passport.deserializeUser(async (ci, done) => {
    const rows = await pool.query('SELECT * from teachers WHERE ci = ? UNION select * from students WHERE ci = ?', [ci, ci]);
    done(null, rows[0]);
});

export default passport;