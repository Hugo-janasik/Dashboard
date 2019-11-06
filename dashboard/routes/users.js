const express = require('express');
const router = express.Router();
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');

/* ROUTER GET METHOD */

/* ** /REGISTER ** */
router.get('/register', function(req, res) {
  res.render('register');
});

/* ** /LOGIN ** */
router.get('/login', function(req, res) {
  res.render('login');
});


/* ** /AUTH/FACEBOOK ** */
/*router.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});*/

/* ROUTER POST METHOD */
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2; 

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors) {
        res.render('register',{
            errors:errors
        });
    } else {
        var newUser = new User({
            name: name,
            email:email,
            username: username,
            password: password
        });
        User.createUser(newUser, function(err, user){
        if (err)
            throw err;
        console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
  }
});

router.post('/login',
    passport.authenticate( 'local', {
            successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: true
    }),
    function(req, res) {
        res.redirect('/');
    }
);

/* PASSPORT USING */

// FaceBook Strategy
/*passport.use(new FacebookStrategy({
    clientID: "577128116366065",
    clientSecret: "b6130d2cf6a901dbdb8b69c7b8ff17a6",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallBack: true
    },
    function (accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));
*/
// LocalStrategy
passport.use (new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err)
                throw err;
            if (!user) {
                return done(null, false, {message: 'Unknown User'});
            }

        User.comparePassword(password, user.password, function(err, isMatch) {
            if (err)
                throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password'});
            }
        });
    });
}));

// seriallize User
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// deserialize User
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

module.exports = router;