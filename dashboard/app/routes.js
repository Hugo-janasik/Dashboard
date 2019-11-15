var User = require('./models/user');
const request = require('request');
const bodyParser = require('body-parser');
const app = require('express');


const apiKey = 'aa36a377f65e957bda9498b5d3593ac9';
const googleKey = 'AIzaSyBR-Z9hzONEATbPRVpISUv59OI7Zfb3TWc';

global.weather = null;
global.distance = null;
global.duration = null;
global.info = null;

module.exports = function(app, passport){

    app.get('/', function(req, res){
        res.render('index.ejs');
    });

    app.get('/about.json', function(req, res) {
        var ipClient = req.connection.remoteAddress.substring(7)
        var Time = Date.now();

        console.log(ipClient)
        res.render('about', {IpClient: ipClient,
                             Time: Time})
    })

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
                            global.weather = null;
                            res.render('dashboard', {weather: global.weather, info: global.info, duration: global.duration, distance: global.distance, error: 'Error, please try again'});
                        } else {                            
                            let weather = JSON.parse(body)
                            
                            if (weather.main == undefined) {
                                global.weather = null;
                                res.render('dashboard', {weather: global.weather, info: global.info, duration: global.duration, distance: global.distance, error: 'Error, please try again'});
                            } else {
                                global.weatherId = `${weather.id}`;
                                res.render('dashboard', {weather: global.weatherId, info: global.info, duration: global.duration, distance: global.distance, error: null});
                            }
                        }
                    });
                })
        })
    app.post('/dashboard/destination', async function (req, res) {
        let _from = req.body.from
        let _to = req.body.to

        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${_from}&destination=${_to}&key=${googleKey}`
        return new Promise((resolve, reject) => {
            request (url, function (err, response, body) {
                if (err) {
                    global.distance = null;
                    global.duration = null;
                    res.render('dashboard', {weather: global.weather, info: global.info, duration: global.duration,distance: global.distance, error: 'Error, please try again'});
                } else {                            
                    let info = JSON.parse(body)
                    
                    if (info.status != "OK") {
                        global.distance = "Not found"
                        global.duration = "Not found"
                        res.render('dashbord', {weather: global.weather, info: global.info, duration: global.duration,distance: global.distance, error: null})
                    } else {
                        global.distance = info.routes[0].legs[0].distance.text
                        global.duration = info.routes[0].legs[0].duration.text
                        res.render('dashboard', {weather: global.weather, info: global.info, duration: global.duration,distance: global.distance, error: null});
                    }
                }
            });
        })
    })

    app.post('/dashboard/search', async function (req, res) {
        let tmp = req.body.place
        _place = tmp.split(' ').join('+')
        console.log(_place);
        
        let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query==${_place}&key=${googleKey}`
        
        return new Promise((resolve, reject) => {
            request (url, function (err, response, body) {
                if (err) {
                    res.render('dashboard', {info: null, error: 'Error, please try again'});
                } else {                            
                    let data = JSON.parse(body)
                    
                    if (data.status != "OK") {
                        res.render('dashbord', {info: "Not found", duration: "Not found",error: null})
                    } else {
                        console.log(data.results[0].formatted_address);
                        global.info = "Address: "
                        global.info += data.results[0].formatted_address
                        if (data.results[0].opening_hours != undefined) {
                            if (data.results[0].opening_hours.open_now == true)
                                global.info += " : open"
                            else
                                global.info += " : close"
                        }
                        res.render('dashboard', {weather: global.weather, info: global.info, duration: global.duration, distance: global.distance, error: null});
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