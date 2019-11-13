var User = require('./models/user');
const request = require('request');
const bodyParser = require('body-parser');
const app = require('express');


const apiKey = 'aa36a377f65e957bda9498b5d3593ac9';

module.exports = function(app, passport){

    app.get('/', function(req, res){
        res.render('index.ejs');
    });

    app.get('/login', function(req, res){
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup', function(req, res){
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    app.get('/dashboard', isLoggedIn, function(req, res){
        res.render('dashboard.ejs', { user: req.user });
    });

    app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/dashboard', failureRedirect: '/' }));

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    })

    app.post('/dashboard/weatherMap', async function (req, res) {
            let city = req.body.city;

            let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
            
                return new Promise((resolve, reject) => {
                    request (url, function (err, response, body) {
                        if (err) {
                            res.render('dashboard', {weather: null, error: 'Error, please try again'});
                        } else {                            
                            let weather = JSON.parse(body)
                            console.log(weather);
                            
                            if (weather.main == undefined) {
                                res.render('dashboard', {weather: null, error: 'Error, please try again'});
                            } else {
                                //                                let weatherTemperature = (weather.main.temp - 32) * (5/9);
                                global.weatherId = `${weather.id}`;
                                console.log(global.weatherId);
//                                console.log(global.weatherText)
                                res.render('dashboard', {weather: global.weatherId, error: null});
                            }
                        }
                    });
                })
        })

};

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/login');
}