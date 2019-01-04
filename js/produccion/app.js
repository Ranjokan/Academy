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
const helmet = require('helmet');
const path = require('path');
//const favicon = require('serve-favicon');
//const logger = require('morgan');
//const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8082;
const app = express();

var enviar = require('./routes/enviar');

//Helmet to redirect http to https
app.disable('x-powered-by');
app.enable('trust proxy');
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
  setIf: function (req, res) {
    return req.secure;
  }
}));

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
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});

//ES Routes
app.get('/es', function (req, res) {
  res.sendFile(__dirname + '/views/es/index.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/academy', function (req, res) {
  res.sendFile(__dirname + '/views/es/academy.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/aliados', function (req, res) {
  res.sendFile(__dirname + '/views/es/aliados.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/buscar', function (req, res) {
  res.sendFile(__dirname + '/views/es/busqueda.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/contacto', function (req, res) {
  res.sendFile(__dirname + '/views/es/contacto.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/helio', function (req, res) {
  res.sendFile(__dirname + '/views/es/heliogeo.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/krypton', function (req, res) {
  res.sendFile(__dirname + '/views/es/krypton.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/nosotros', function (req, res) {
  res.sendFile(__dirname + '/views/es/nosotros.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/productos', function (req, res) {
  res.sendFile(__dirname + '/views/es/productos.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/es/servicios', function (req, res) {
  res.sendFile(__dirname + '/views/es/servicios.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});

//EN Routes
app.get('/en', function (req, res) {
  res.sendFile(__dirname + '/views/en/index.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/academy', function (req, res) {
  res.sendFile(__dirname + '/views/en/academy.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/partners', function (req, res) {
  res.sendFile(__dirname + '/views/en/partners.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/search', function (req, res) {
  res.sendFile(__dirname + '/views/en/search.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/contact', function (req, res) {
  res.sendFile(__dirname + '/views/en/contact.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/helio', function (req, res) {
  res.sendFile(__dirname + '/views/en/heliogeo.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/krypton', function (req, res) {
  res.sendFile(__dirname + '/views/en/krypton.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/about', function (req, res) {
  res.sendFile(__dirname + '/views/en/about.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/products', function (req, res) {
  res.sendFile(__dirname + '/views/en/products.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});
app.get('/en/services', function (req, res) {
  res.sendFile(__dirname + '/views/en/services.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
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
app.use(function (req, res, next) {
  res.status(404);
  res.sendFile(__dirname + '/views/404.html');
  if (!req.secure) {
    res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
});

//Error to Develop Environment
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Error to Production Environment
app.use(function (err, req, res, next) {
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
