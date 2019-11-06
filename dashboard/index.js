const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');


mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB, {
});

var db = mongoose.connection;

const routes = require('./routes/index');
const users = require('./routes/users');
const app = express();

/* APP SET */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.set('port', (3000));

/* APP ENGINE */
app.engine('handlebars', exphbs({defaultLayout:'layout'}));

/* APP USE */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.use(session({ secret: 'dashboard', saveUninitialized: true, resave: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root        = namespace.shift()
        , formParam   = root;

    while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
    }
    return {
        param : formParam,
        msg   : msg,
        value : value
    };
  }
}));

app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/users', users);
app.use('/', routes);


/* APP GET */
app.get('/auth/facebook/callback', (req, res) => {
    passport.authenticate('facebook', { successRedirect : "/", failureRedirect: '/login' }),
    console.log('dashboard connection');
    res.redirect('/');
//    res.render('index');
});


/* APP LISTEN */
app.listen(app.get('port'), function() {
    console.log('Server started on port '+app.get('port'));
});