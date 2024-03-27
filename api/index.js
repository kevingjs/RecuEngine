import express from 'express';
import expHbs from 'express-handlebars';
import morgan from 'morgan';
import path from 'path';
import flash from 'connect-flash';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import passport from 'passport';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initializations
const app = express();
import dotenv from 'dotenv'
dotenv.config();
import './lib/passport.js';

// database
import { database } from './keys.js';

// settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expHbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
	helpers: {
		inc: (value, options) => parseInt(value) + 1
	}
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(session({
    secret: 'al81nj',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.error = req.flash('error');
    app.locals.user = req.user;
    next();
});

import rIndex from './routes/index.js';
import rAuth from './routes/authentication.js';
import rLinks from './routes/links.js';

// Routes
app.use(rIndex);
app.use(rAuth);
app.use('/', rLinks);

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});

export default app;