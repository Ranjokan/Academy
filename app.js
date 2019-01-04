/************************************************************
*
*  Company: Handytecmobi S.A.
*  Author: Andrés Caiza
*  Editor: Andrés Caiza
*  Last Update: 2018/28/11
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

//ES Routes
app.get('/es', function (req, res) {
  res.sendFile(__dirname + '/views/es/index.html');
});
app.get('/es/academy', function(req, res) {
  res.sendFile(__dirname + '/views/es/academy.html');
});
app.get('/es/aliados', function(req, res) {
  res.sendFile(__dirname + '/views/es/aliados.html');
});
app.get('/es/buscar', function(req, res) {
  res.sendFile(__dirname + '/views/es/busqueda.html');
});
app.get('/es/contacto', function(req, res) {
  res.sendFile(__dirname + '/views/es/contacto.html');
});
app.get('/es/helio', function(req, res) {
  res.sendFile(__dirname + '/views/es/heliogeo.html');
});
app.get('/es/krypton', function(req, res) {
  res.sendFile(__dirname + '/views/es/krypton.html');
});
app.get('/es/nosotros', function(req, res) {
  res.sendFile(__dirname + '/views/es/nosotros.html');
});
app.get('/es/productos', function(req, res) {
  res.sendFile(__dirname + '/views/es/productos.html');
});

app.get('/es/servicios', function(req, res) {
  res.sendFile(__dirname + '/views/es/servicios.html');
});

app.get('/es/eAcademy', function(req, res) {
  res.sendFile(__dirname + '/views/es/eAcademy.html');
});

//EN Routes
app.get('/en', function (req, res) {
  res.sendFile(__dirname + '/views/en/index.html');
});
app.get('/en/academy', function(req, res) {
  res.sendFile(__dirname + '/views/en/academy.html');
});
app.get('/en/partners', function(req, res) {
  res.sendFile(__dirname + '/views/en/partners.html');
});
app.get('/en/search', function(req, res) {
  res.sendFile(__dirname + '/views/en/search.html');
});
app.get('/en/contact', function(req, res) {
  res.sendFile(__dirname + '/views/en/contact.html');
});
app.get('/en/helio', function(req, res) {
  res.sendFile(__dirname + '/views/en/heliogeo.html');
});
app.get('/en/krypton', function(req, res) {
  res.sendFile(__dirname + '/views/en/krypton.html');
});
app.get('/en/about', function(req, res) {
  res.sendFile(__dirname + '/views/en/about.html');
});
app.get('/en/products', function(req, res) {
  res.sendFile(__dirname + '/views/en/products.html');
});

app.get('/en/services', function(req, res) {
  res.sendFile(__dirname + '/views/en/services.html');
});

//Download Brochure Youth Academy PDF
app.get('/download-brochure', function (req, res) {
  var file = path.join(__dirname, 'public/pdf/Brochure_Youth_Academy.pdf');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Content-Disposition', 'attachment; filename=Brochure_Youth_Academy.pdf');
  res.download(file, function (err) {
      if (err) {
          console.log(err);
      }
  });
});

//Download Brochure Helio PDF
app.get('/brochure-helio', function (req, res) {
  var file = path.join(__dirname, 'public/pdf/Brochure_helio.pdf');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Content-Disposition', 'attachment; filename=Brochure_helio.pdf');
  res.download(file, function (err) {
      if (err) {
          console.log(err);
      }
  });
});

//Download Brochure Handytec PDF
app.get('/brochure-handytec', function (req, res) {
  var file = path.join(__dirname, 'public/pdf/Brochure_handytec.pdf');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Content-Disposition', 'attachment; filename=Brochure_handytec.pdf');
  res.download(file, function (err) {
      if (err) {
          console.log(err);
      }
  });
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
