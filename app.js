/************************************************************
*
*  Company: Handytecmobi S.A.
*  Author: Andrés Caiza
*  Editor: Andrés Caiza
*  Last Update: 2019/January/16
*  Class Name: app.js
*  Dependencies: express, path, bodyparser
*  Description: This is the main class for the nodeJS project
*
************************************************************/

//Core of NodeJS App
const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
//const logger = require('morgan');
//const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8082;
const app = express();

var enviar = require('./routes/enviar');

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/enviar', enviar);


//Main Route
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/es/index.html');
});

app.get('/es/contacto-academy', function (req, res) {
  res.sendFile(__dirname + '/views/es/contacto-academy.html');
});

// 404 Error and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.sendFile(__dirname + '/views/404.html');
});

//Error to Develop Environment
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Error to Production Environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// Port for listening requests
var listener = app.listen(PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
