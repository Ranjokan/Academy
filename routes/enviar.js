/************************************************************
*
*  Company: Handytecmobi S.A.
*  Author: Diego Montúfar
*  Editor: Andrés Caiza
*  Last Update: 2018/11/13
*  Class Name: enviar.js
*  Dependencies: fs, express, nodemailer, bodyparser, request
*  Description: This class is used for sending mail messages to clients that send his personal data through contact form
*
************************************************************/

var fs = require('fs');
var express = require('express');
var nodemailer = require('nodemailer');
const moment = require('moment');
//var data = require('../data/data');
//captcha
var bodyParser = require('body-parser');
var request = require('request');

var router = express.Router();

var admin = require("firebase-admin");

var serviceAccount = require("../youth-academy-firebase-adminsdk-oapuz-e07a4ef11f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://youth-academy.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("handytec_youth_academy/client_data");
var brochure_ref = db.ref("handytec_brochure_downloads/client_data");


//Setup transporter object with noreply credentials
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'noreply@handytec.mobi',
        pass: 'handytecNOREPLY2016'
    }
    ,
    tls: {//Roberto: Desactivar self signed certificate
        rejectUnauthorized: false
    }//===========Comentar en producción
});

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}
/* Method called when post contact form  */
router.post('/', function (req, res, next) {
    var status = 1;
    if (req.body.lang === 'es') status = 1;
    if (req.body.lang === 'en') status = 2;

    //CAPTCHA
    var secretKey = "6Lc6KHAUAAAAAAbCAci998R-hRDxegKPNp7_mmzx";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        //verificar de que form viene la peticion, SERVICES no usa verificación
        var verificar = false;
        console.log("BODY SUCCESS: ", body.success);
        if (req.body.section == 'CONTACT' && body.success) verificar = true;
        else if (req.body.section == 'SERVICES') verificar = true;
        if (!verificar) {
            //if(body.success) {//Roberto: Desactivar captcha
            console.log("Invalid captcha");

            if (req.body.lang === 'es') {
                status = 3;
                res.redirect('/es/?status=' + status);
            }
            if (req.body.lang === 'en') {
                status = 4;
                res.redirect('/en/?status=' + status);
            }
        } else {

            //Name + Last Name
            var complete_name = req.body.client_name + ' ' + req.body.client_lastname;

            var reqText = "";
            var reqType = "";

            //Option text based on option list selection
            switch (req.body.request) {
                case 'DIA':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Discovery Sprint"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Discovery Sprint"; };
                    break;
                case 'SPT':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Soporte"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Support"; };
                    break;
                case 'CON':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Consultoría"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Consulting"; };
                    break;
                case 'WEB':
                    reqText = "Sitio Web";
                    reqType = "";
                    break;
                case 'INF':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Infraestructura o servicios en la nube"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Infrastructure or cloud services"; };
                    break;
                case 'ITS':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Servicios Informáticos"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Computer Services"; };
                    break;
                case 'MOB':
                    reqText = "Aplicación Móvil";
                    reqType = "";
                    break;
                case 'OTH':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Otros"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Others"; };
                    break;
                case 'TRA':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Capacitación"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Training"; };
                    break;
                case 'WRK':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Trabajar con nosotros"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Working with us"; };
                    break;
                case 'C3V':
                    reqText = "handytec Academy";
                    reqType = "un programa especializado de ";
                    if (req.body.lang === 'en') { reqText = "a handytec Academy program"; reqType = ""; };
                    break;
                case 'DTF':
                    reqText = "Analítica Avanzada";
                    reqType = "la presentación de ";
                    if (req.body.lang === 'en') { reqText = "the Advanced Analytics debrief"; reqType = ""; };
                    break;
                case 'CST':
                    reqText = "de helio.geo";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "the helio.geo demo"; reqType = ""; };
                    break;
                case 'CTA':
                    reqText = "Content Analytics";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Content Analytics demo"; reqType = ""; };
                    break;
                case 'CSA':
                    reqText = "Digital Analytics";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "the Digital Analytics demo"; reqType = ""; };
                    break;
                case 'LGA':
                    reqText = "Log Analytics";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Log Analytics demo"; reqType = ""; };
                    break;
                case 'SMA':
                    reqText = "Smart Promotions";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Smart Promotions demo"; reqType = ""; };
                    break;
                case 'DTC':
                    reqText = "Estrategia DOT8®";
                    reqType = "la presentación de ";
                    if (req.body.lang === 'en') { reqText = "the DOT8® Strategy debrief"; reqType = ""; };
                    break;
                case 'BDI':
                    reqText = "Big Data Integration";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Big Data Integration demo"; reqType = ""; };
                    break;
                case 'NGB':
                    reqText = "New Generation Business Intelligence";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "the New Generation Business Intelligence demo"; reqType = ""; };
                    break;
            }
            var reqAll = reqType + reqText;
            var to_email = 'contact@handytec.mobi';
            if (req.body.section == 'SERVICES') to_email = 'ventas@handytec.mobi';

            //HTML template to be sent to contact@handytec
            var mensaje = "";
            if (req.body.section == 'SERVICES') mensaje = 'Nueva solicitud de servicio';
            else mensaje = req.body.client_message;
            var html_body = '<div style="width:98%; margin:0 auto;"> <div style="text-align:left;vertical-align: middle;"> <div> <img src="https://www.handytec.mobi/images/email/header-enviar.png" style="max-width: 100%; background-color: transparent;"/> </div> </div> <div style="margin-top:3px; "> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <label style="color: #2C86C7;"><b>Nombre:&nbsp;</b></label>' + complete_name + '<br> <label style="color: #2C86C7;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br> <label style="color: #2C86C7;"><b>Llegó vía:&nbsp;</b></label>' + req.body.found_by + '<br> <label style="color: #2C86C7;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br> <label style="color: #2C86C7;"><b>Empresa:&nbsp;</b></label>' + req.body.company + '<br> <label style="color: #2C86C7;"><b>Requerimiento para &nbsp;</b></label>' + reqAll + '<br> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <label style="color: #2C86C7;font-size:16px;"><b>Descripción del Requerimiento:</b></label><br><br>' + mensaje + ' <div style="text-align:right; margin-top: 20px; margin-bottom: 15px; margin-right: 10px;"> <a href="mailto:' + req.body.email + '" style="font-family: Tahoma; color: #2C86C7; font-size: 16px; padding: 10px 20px 10px 20px; text-decoration: none; border-style: solid; border-width: 1.5px;">Contestar</a> </div> </div> </div>';

            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: complete_name + ' <' + req.body.email + '>', // sender address
                to: to_email, // list of receivers
                subject: 'Cliente Requiere: ' + reqText, // Subject line
                html: html_body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    //res.render('error',{message: "Error al enviar mensaje"});
                    status = 0;
                    if (req.body.lang === 'es') res.redirect('/es/?status=' + status);
                    if (req.body.lang === 'en') res.redirect('/en/?status=' + status);
                    //return console.log(error);

                } else {
                    //status = 1;
                    console.log('Lang: ' + req.body.lang + ' status: ' + status);
                    if (req.body.lang === 'es') res.redirect('/es/?status=' + status);
                    if (req.body.lang === 'en') res.redirect('/en/?status=' + status);

                }
                console.log('Message sent to contact@handytec: ' + info.response);

            });

            transporter.close();

            /* Store in DB new client */
            function getFormattedDate() {
                var date = new Date();
                var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                return str;
            }

            var current_date = getFormattedDate();

            var dev = false;
            var device = 'WEB';

            console.log("enviar.js: Este es el device: " + req.body.device);

            if (req.body.device == "true") {
                device = 'MOB';
            }

            //Setup customer object
            var customer = {
                DATE: current_date,
                NAME: req.body.client_name,
                LAST_NAME: req.body.client_lastname,
                EMAIL: req.body.email,
                PHONE: req.body.phone,
                COMPANY: req.body.company,
                REQUIREMENT: req.body.request,
                ORIGIN: device,
                SUSCRIBED: 1,
                SECTION: req.body.section,
                FOUND_BY: req.body.found_by
            };

            //Send email to customer
            //Call to ata layer in order to insert new Client
            var result = data.newCustomer(customer);
            if (result == 1) {
                console.log('New customer successfully inserted');
            }

            var html_body_response = '';
            if (req.body.lang === 'es') { html_body_response = '<div style="width:85%; margin:0 auto;"> <div style="border-collapse: collapse; padding: 15px 10px; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:32px;"> <div style="float:left; width:50%;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://www.handytec.mobi/images/logos/logo-handytec.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="160" > </a> </div> <div style="float:left; width:50%; text-align: right; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 10px;"> Thinking <span style="color:#D11010;">Big</span>. Powering <span style="color:#D11010;">Data</span> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:350px; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p>Hola ' + req.body.client_name + ',</p> <p></p> <p>Hemos recibido tu correo a través de la página web de handytec. Estamos analizando tu requerimiento y pronto nos pondremos en contacto contigo.</p> <p></p> <p>Solicitud realizada para ' + reqAll + '.</p> <br> <p>Atentamente,</p> <p>El equipo de handytec</p> <p></p><br><br> </div> <div style="text-align:left; vertical-align: middle; background-color:transparent; height: 80px; padding: 0px 0px; margin-top: 0px;"> <img src="https://www.handytec.mobi/images/logos/footer.png" style="position: relative; height: 80px; width: 100%; top:-13px;"/> <div style="float:left; width: 100%;" align="right"> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:132px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:rgb(151,151,151);"> <p>© 2018 Handytecmobi S.A. Todos los derechos reservados.</p> <p></p> <p> <a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color: rgb(4, 137, 177); text-decoration: none; display: inline;"> www.handytec.mobi </a> </p> <p></p> <p> <p style="font-family: Tahoma; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 10px;"> <span style="font-weight: bold; color: rgb(151, 151, 151); display: inline;" class="txt signature_name-target sig-hide">Handytecmobi S.A.</span><br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_jobtitle-target sig-hide">Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a class="link email signature_email-target sig-hide" href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(151,151,151); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide">(02) 224-3559</span> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide"></span> </p> </p> <p></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Tahoma; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://github.com/handytecmobi" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="32" height="32" style="top: 100px;" data-filename="github.png" src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" alt="GitHub"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> </div> </div> </div>'; }
            if (req.body.lang === 'en') { html_body_response = '<div style="width:85%; margin:0 auto;"> <div style="border-collapse: collapse; padding: 15px 10px; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:32px;"> <div style="float:left; width:50%;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://www.handytec.mobi/images/logos/logo-handytec.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="160" > </a> </div> <div style="float:left; width:50%; text-align: right; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 10px;"> Thinking <span style="color:#D11010;">Big</span>. Powering <span style="color:#D11010;">Data</span> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:350px; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p>Hello ' + req.body.client_name + ',</p> <p></p> <p>We have received your email through the handytec website. We are analyzing your request and we will contact you soon.</p> <p></p> <p>Request made for ' + reqAll + '.</p> <br> <p>Sincerely,</p> <p>The handytec team</p> <p></p><br><br> </div> <div style="text-align:left; vertical-align: middle; background-color:transparent; height: 80px; padding: 0px 0px; margin-top: 0px;"> <img src="https://www.handytec.mobi/images/logos/footer.png" style="position: relative; height: 80px; width: 100%; top:-13px;"/> <div style="float:left; width: 100%;" align="right"> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:132px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:rgb(151,151,151);"> <p>© 2018 Handytecmobi S.A. All rights reserved.</p> <p></p> <p> <a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color: rgb(4, 137, 177); text-decoration: none; display: inline;"> www.handytec.mobi </a> </p> <p></p> <p> <p style="font-family: Tahoma; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 10px;"> <span style="font-weight: bold; color: rgb(151, 151, 151); display: inline;" class="txt signature_name-target sig-hide">Handytecmobi S.A.</span><br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_jobtitle-target sig-hide">Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a class="link email signature_email-target sig-hide" href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(151,151,151); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide">(02) 224-3559</span> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide"></span> </p> </p> <p></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Tahoma; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://github.com/handytecmobi" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="32" height="32" style="top: 100px;" data-filename="github.png" src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" alt="GitHub"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> </div> </div> </div>'; }

            // setup e-mail data with unicode symbols
            var mailOptionsResponse = {};
            if (req.body.lang === 'es') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: '(No contestar) Estamos analizando tu requerimiento', // Subject line
                    html: html_body_response
                };
            }
            if (req.body.lang === 'en') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: '(Do not reply) We are reviewing your request', // Subject line
                    html: html_body_response
                };
            }

            transporter.sendMail(mailOptionsResponse, function (error, info) {
                if (error) {
                    // res.render('error',{message: "Error al enviar mensaje"});
                    return console.log(error);
                }
                console.log('Message sent to Client: ' + info.response);
            });

            transporter.close();

        }   //final: ELSE of captcha
    });  //final request varification (captcha)

    next();

    //Send email to customer
}, function (req, res, next) {

});
router.post('/brochure', function (req, res) {
    console.log("request route   ", req.body);
    var mensaje_res = { captcha: false, contact_email: false, client_email: false, save_db: false, lang: "" };
    /*Start*/
    var status = 1;
    if (req.body.lang === 'es') mensaje_res.lang = "es";
    if (req.body.lang === 'en') mensaje_res.lang = "en";

    //CAPTCHA
    var secretKey = "6Lc6KHAUAAAAAAbCAci998R-hRDxegKPNp7_mmzx";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        if (!body.success) {
            console.log("Invalid captcha");
        } else {
            mensaje_res.captcha = true;
            //Name + Last Name
            var complete_name = req.body.name + ' ' + req.body.lastname;
            //Option text based on option list selection
            var to_email = 'ventas@handytec.mobi';

            //HTML template to be sent to contact@handytec
            var html_body;

            if (req.body.lang === 'es')
                html_body = '<div style="width:98%; margin:0 auto;"><div style="text-align:left;vertical-align: middle;"><div><img src="https://www.handytec.mobi/images/email/header-enviar.png" style="max-width: 100%; background-color: transparent;"></div></div><div style="margin-top:3px; "></div><div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"><label style="color: #2C86C7;"><b>Nombre:&nbsp;</b></label>' + complete_name + '<br><label style="color: #2C86C7;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br><label style="color: #2C86C7;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br><label style="color: #2C86C7;"><b>Empresa:&nbsp;</b></label>' + req.body.company + '<br><label style="color: #2C86C7;"><b>Requerimiento para Descargar Brochure</b></label><br></div></div>';

            if (req.body.lang === 'en')
                html_body = '<div style="width:98%; margin:0 auto;"><div style="text-align:left;vertical-align: middle;"><div><img src="https://www.handytec.mobi/images/email/header-enviar.png" style="max-width: 100%; background-color: transparent;"></div></div><div style="margin-top:3px; "></div><div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"><label style="color: #2C86C7;"><b>Name:&nbsp;</b></label>' + complete_name + '<br><label style="color: #2C86C7;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br><label style="color: #2C86C7;"><b>Phone:&nbsp;</b></label>' + req.body.phone + '<br><label style="color: #2C86C7;"><b>Company:&nbsp;</b></label>' + req.body.company + '<br><label style="color: #2C86C7;"><b>Requirement to download brochure</b></label><br></div></div>';

            // setup e-mail data with unicode symbols

            var subject;

            if (req.body.lang === 'es')
                subject = 'Descarga de Brochure';

            if (req.body.lang === 'en')
                subject = 'Brochure Download';

            var mailOptions = {
                from: complete_name + ' <' + req.body.email + '>', // sender address
                to: to_email, // list of receivers
                subject: subject, // Subject line
                html: html_body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {

                } else {
                    console.log(' status: ' + status);
                    mensaje_res.contact_email = true;

                }
                console.log('Message sent to ventas@handytec: ' + info.response);
            });
            transporter.close();
        }//final: ELSE of captcha
        res.json(mensaje_res);
    });  //final request varification (captcha)
    /*End*/

});

/*---------------------------Send handytec Brochure download link to email on form ---------------------------*/
router.post('/request-brochure', function (req, res) {
    console.log(req.body);
    const { client_name, email, empresa, cargo } = req.body;
    var actualTime = moment().utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss');
    console.log(actualTime);

    var html_body_response = '';
    html_body_response = '<div style="width:100%; margin:0 auto"> <div style="border-collapse: collapse; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:auto"> <div style=" text-align: center;background-color:#dddfdf"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/banner_brochure.png?alt=media&token=bf6d46e6-af73-4f13-96d9-7855d61668fb" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="auto" height="180px"> </a> </div> <div style="float:left; width:50%; text-align: right; font-family:Arial; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px 5px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family:Arial; font-size: 16px; line-height: 1.6; color:#313131; background-color:lightgray;"> <span>Hola</span><span style="font-weight: bold;"> ' + req.body.client_name + ',</span> <p></p> <p>Usa el siguiente link y descarga nuestro brochure</p> <a href="https://www.handytec.mobi/brochure-handytec">Descargar</a> <p></p><p>Atentamente,</p> <span>Equipo </span><span style="font-weight: bold;">handytec</span> <p></p> </div> <div style="border-collapse: collapse; padding: 10px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:80px;"> <div style="float:left; width:100%; text-align: center; font-family:Arial; font-size: 10px; line-height: 1.6; color:rgb(50,50,50);margin-bottom: 0px"><p><a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color:rgb(50,50,50);font-size:13px; font-weight: bold; text-decoration: none; display: inline;"> <u>www.handytec.mobi</u> </a> </p> <p></p> <p style="font-family: Arial; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 0px;"> <span style="font-weight: bold; color:rgb(50,50,50); display: inline;" >Handytecmobi S.A.</span><br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;" >Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(50,50,50); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;">(02) 224-3559</span></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: Arial; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Arial; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> <p style="font-size: 11px;">© 2018 Handytecmobi S.A. Todos los derechos reservados.</p> </div></div> </div>';
    
    // setup e-mail data with unicode symbols
    var mailOptionsResponse = {};
    if (req.body.lang === 'es') {
        mailOptionsResponse = {
            from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
            to: req.body.email, // list of receivers
            subject: '(No contestar) Descarga brochure handytec', // Subject line
            html: html_body_response
        };
    }

    transporter.sendMail(mailOptionsResponse, function (error, info) {
        if (error) {
            // res.render('error',{message: "Error al enviar mensaje"});
            res.status(500).send('Ha ocurrido un error');
            return console.log(error);
            
        }
        console.log('Message sent to Client: ' + info.response);
        res.status(200).send("El link de descarga del brochure ha sido enviado a: "+email);
        brochure_ref.push().set({
            nombre_cliente: client_name,
            correo_electrónico: email,
            empresa: empresa,
            cargo: cargo,
            fecha_solicitud: actualTime
        });
    });
    transporter.close();

});

/*-------------------------This route is used on contact page-------------------------------*/
router.post('/request', function (req, res) {
    console.log("request route   ", req.body);
    var mensaje_res = { captcha: false, contact_email: false, client_email: false, save_db: false, lang: "" };
    /*Start*/
    var status = 1;
    if (req.body.lang === 'es') mensaje_res.lang = "es";
    if (req.body.lang === 'en') mensaje_res.lang = "en";

    //CAPTCHA
    var secretKey = "6Lc6KHAUAAAAAAbCAci998R-hRDxegKPNp7_mmzx";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        if (!body.success) {
            console.log("Invalid captcha");
        } else {
            mensaje_res.captcha = true;
            //Name + Last Name
            var complete_name = req.body.client_name + ' ' + req.body.client_lastname;
            var reqText = "";
            var reqType = "";
            //Option text based on option list selection
            switch (req.body.request) {
                case 'MEMSQL':
                    if (req.body.lang === 'es') { reqType = "confirmación de asistencia a "; reqText = "Evento MemSQL"; };
                    if (req.body.lang === 'en') { reqType = "confirmation of attendance at "; reqText = "MemSQL Event"; };
                    break;
                case 'DIA':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Discovery Sprint"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Discovery Sprint"; };
                    break;
                case 'SPT':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Soporte"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Support"; };
                    break;
                case 'CON':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Consultoría"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Consulting"; };
                    break;
                case 'WEB':
                    reqText = "Sitio Web";
                    reqType = "";
                    break;
                case 'INF':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Infraestructura o servicios en la nube"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Infrastructure or cloud services"; };
                    break;
                case 'ITS':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Servicios Informáticos"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Computer Services"; };
                    break;
                case 'MOB':
                    reqText = "Aplicación Móvil";
                    reqType = "";
                    break;
                case 'OTH':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Otros"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Others"; };
                    break;
                case 'TRA':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Capacitación"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Training"; };
                    break;
                case 'WRK':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "Trabajar con nosotros"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "Working with us"; };
                    break;
                case 'HGEO':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "helio.geo"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "helio.geo"; };
                    break;
                case 'KRYPT':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "krypton.data"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "krypton.data"; };
                    break;
                case 'ACADEMY':
                    if (req.body.lang === 'es') { reqType = "información sobre "; reqText = "handytec Academy"; };
                    if (req.body.lang === 'en') { reqType = "information about "; reqText = "handytec Academy"; };
                    break;
                case 'C3V':
                    reqText = "handytec Academy";
                    reqType = "un programa especializado de ";
                    if (req.body.lang === 'en') { reqText = "a handytec Academy program"; reqType = ""; };
                    break;
                case 'DTF':
                    reqText = "Analítica Avanzada";
                    reqType = "la presentación de ";
                    if (req.body.lang === 'en') { reqText = "the Advanced Analytics debrief"; reqType = ""; };
                    break;
                case 'CST':
                    reqText = "de helio.geo";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "helio.geo demo"; reqType = ""; };
                    break;
                case 'CTA':
                    reqText = "Content Analytics";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Content Analytics demo"; reqType = ""; };
                    break;
                case 'CSA':
                    reqText = "Digital Analytics";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "the Digital Analytics demo"; reqType = ""; };
                    break;
                case 'LGA':
                    reqText = "Log Analytics";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Log Analytics demo"; reqType = ""; };
                    break;
                case 'SMA':
                    reqText = "Smart Promotions";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Smart Promotions demo"; reqType = ""; };
                    break;
                case 'DTC':
                    reqText = "Estrategia DOT8®";
                    reqType = "la presentación de ";
                    if (req.body.lang === 'en') { reqText = "the DOT8® Strategy debrief"; reqType = ""; };
                    break;
                case 'BDI':
                    reqText = "Big Data Integration";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "Big Data Integration demo"; reqType = ""; };
                    break;
                case 'NGB':
                    reqText = "New Generation Business Intelligence";
                    reqType = "el demo ";
                    if (req.body.lang === 'en') { reqText = "the New Generation Business Intelligence demo"; reqType = ""; };
                    break;
            }
            var reqAll = reqType + reqText;
            if (req.body.request == 'ACADEMY') {
                var to_email = 'academy@handytec.mobi';
            } else {
                var to_email = 'contact@handytec.mobi';
            }
            if (req.body.section == 'SERVICES') to_email = 'ventas@handytec.mobi';

            //HTML template to be sent to contact@handytec
            var mensaje = "";
            if (req.body.section == 'SERVICES') mensaje = 'Nueva solicitud de servicio';
            else mensaje = req.body.client_message;
            var html_body = '<div style="width:98%; margin:0 auto;"> <div style="text-align:left;vertical-align: middle;"> <div> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/header-enviar.png?alt=media&token=4e10fd7b-6c54-4625-93ff-4a21ab371ec2" style="max-width: 100%; background-color: transparent;"/> </div> </div> <div style="margin-top:3px; "> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: lightgray; font-family:Arial"> <label style="color: #2C2C2C;"><b>Nombre:&nbsp;</b></label>' + complete_name + '<br> <label style="color: #2C2C2C;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br> <label style="color: #2C2C2C;"><b>Llegó vía:&nbsp;</b></label>' + req.body.found_by + '<br> <label style="color: #2C2C2C;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br> <label style="color: #2C2C2C;"><b>Empresa:&nbsp;</b></label>' + req.body.company + '<br> <label style="color: #2C2C2C;"><b>Cargo:&nbsp;</b></label>' + req.body.role + '<br> <label style="color: #2C2C2C;"><b>Requerimiento para &nbsp;</b></label>' + reqAll + '<br> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: lightgray;font-family:Arial"> <label style="color: #2C2C2C;font-size:16px;"><b>Descripción del Requerimiento:</b></label><br><br>' + mensaje + ' <div style="text-align:right; margin-top: 20px; margin-bottom: 15px; margin-right: 10px;"> <a href="mailto:' + req.body.email + '" style="color: #2C2C2C; font-size: 16px; padding: 10px 20px 10px 20px; text-decoration: none; border-style: solid; border-width: 1.5px;font-family:Arial">Contestar</a> </div> </div> </div>';

            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: complete_name + ' <' + req.body.email + '>', // sender address
                to: to_email, // list of receivers
                subject: 'Cliente Requiere: ' + reqText, // Subject line
                html: html_body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {

                } else {
                    console.log('Lang: ' + req.body.lang + ' status: ' + status);
                    mensaje_res.contact_email = true;

                }
                console.log('Message sent to: ' + to_email + ' ' + info.response);
            });
            transporter.close();

            /* Store in DB new client */
            function getFormattedDate() {
                var date = new Date();
                var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                return str;
            }

            var current_date = getFormattedDate();

            var dev = false;
            var device = 'WEB';

            console.log("enviar.js: Este es el device: " + req.body.device);

            if (req.body.device == "true") {
                device = 'MOB';
            }

            //Setup customer object
            var customer = {
                DATE: current_date,
                NAME: req.body.client_name,
                LAST_NAME: req.body.client_lastname,
                EMAIL: req.body.email,
                PHONE: req.body.phone,
                COMPANY: req.body.company,
                JOB_TITLE: req.body.role,
                REQUIREMENT: req.body.request,
                ORIGIN: device,
                SUSCRIBED: 1,
                SECTION: req.body.section,
                FOUND_BY: req.body.found_by
            };
            console.log("Data CUSTOMER: ", customer);
            //Send email to customer
            //Call to ata layer in order to insert new Client
            /*var result = data.newCustomer(customer);
            if (result == 1){
                console.log('New customer successfully inserted');
				mensaje_res.save_db=true;
            }*/

            var html_body_response = '';
            if (req.body.lang === 'es') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:auto;"> <div style=" text-align: center; width:100%;padding-left: 10px;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/header-cliente.png?alt=media&token=6f02dc5a-f6b9-4be7-89f9-bdb0ded11c03" alt="handytec - Big Data Analytics" border="0" class="sig-logo" height="200px" width="auto"> </a> </div> <div style="float:left; width:50%; text-align: right; font-family:Arial; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px 5px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family:Arial; font-size: 16px; line-height: 1.6; color:#313131; background-color:lightgray;"> <span>Hola</span><span style="font-weight: bold;"> ' + req.body.client_name + ',</span> <p></p> <p>Hemos recibido tu correo a través de la página web de handytec. Estamos analizando tu requerimiento y pronto nos pondremos en contacto contigo.</p> <p></p> <span>Solicitud realizada para</span> <span style="font-weight: bold;">' + reqAll + '.</span> <p>Atentamente,</p> <span>El equipo de </span><span style="font-weight: bold;">handytec</span> <p></p> </div> <div style="border-collapse: collapse; padding: 10px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:80px;"> <div style="float:left; width:100%; text-align: center; font-family:Arial; font-size: 10px; line-height: 1.6; color:rgb(50,50,50);margin-bottom: 0px"><p><a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color:rgb(50,50,50);font-size:13px; font-weight: bold; text-decoration: none; display: inline;"> <u>www.handytec.mobi</u> </a> </p> <p></p> <p style="font-family: Arial; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 0px;"> <span style="font-weight: bold; color:rgb(50,50,50); display: inline;" >Handytecmobi S.A.</span><br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;" >Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(50,50,50); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;">(02) 224-3559</span></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: Arial; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Arial; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> <p style="font-size: 11px;">© 2018 Handytecmobi S.A. Todos los derechos reservados.</p> </div></div> </div>'; }
            if (req.body.lang === 'en') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:auto;"> <div style=" text-align: center; width:100%;padding-left: 10px;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/header-cliente_en.png?alt=media&token=e802f34f-4c1a-4746-8c73-26af0d8b0960" alt="handytec - Big Data Analytics" border="0" class="sig-logo" height="200px" width="auto"> </a> </div> <div style="float:left; width:50%; text-align: right; font-family:Arial; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px 5px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family:Arial; font-size: 16px; line-height: 1.6; color:#313131; background-color:lightgray;"> <span>Hello</span><span style="font-weight: bold;"> ' + req.body.client_name + ',</span> <p></p> <p>We have received your mail through the handytec website. We are analyzing your request and we will contact you soon.</p> <p></p> <span>Request made for</span> <span style="font-weight: bold;">' + reqAll + '.</span> <p>Sincerely,</p><span>The </span><span style="font-weight: bold;">handytec</span> <span>team</span> <p></p> </div> <div style="border-collapse: collapse; padding: 10px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:80px;"> <div style="float:left; width:100%; text-align: center; font-family:Arial; font-size: 10px; line-height: 1.6; color:rgb(50,50,50);margin-bottom: 0px"><p><a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color:rgb(50,50,50);font-size:13px; font-weight: bold; text-decoration: none; display: inline;"> <u>www.handytec.mobi</u> </a> </p> <p></p> <p style="font-family: Arial; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 0px;"> <span style="font-weight: bold; color:rgb(50,50,50); display: inline;" >Handytecmobi S.A.</span><br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;" >Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(50,50,50); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;">(02) 224-3559</span></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: Arial; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Arial; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> <p style="font-size: 11px;">© 2018 Handytecmobi S.A. All rights reserved.</p> </div></div> </div>'; }

            // setup e-mail data with unicode symbols
            var mailOptionsResponse = {};
            if (req.body.lang === 'es') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: '(No contestar) Estamos analizando tu requerimiento', // Subject line
                    html: html_body_response
                };
            }
            if (req.body.lang === 'en') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: '(Do not reply) We are reviewing your request', // Subject line
                    html: html_body_response
                };
            }

            transporter.sendMail(mailOptionsResponse, function (error, info) {
                if (error) {
                    // res.render('error',{message: "Error al enviar mensaje"});
                    return console.log(error);
                }
                console.log('Message sent to Client: ' + info.response);
                mensaje_res.client_email = true;
            });
            transporter.close();

        }//final: ELSE of captcha
        res.json(mensaje_res);
    });  //final request varification (captcha)
    /*End*/

});
/*---------------------------------------------------------------------------------*/

/*Formulario de DevTools*/
router.post('/request_dev', function (req, res) {
    console.log("request route   ", req.body);
    var mensaje_res = { captcha: false, contact_email: false, client_email: false, save_db: false, lang: "" };
    /*Start*/
    var status = 1;
    if (req.body.lang === 'es') mensaje_res.lang = "es";
    if (req.body.lang === 'en') mensaje_res.lang = "en";

    //CAPTCHA
    var secretKey = "6Lc6KHAUAAAAAAbCAci998R-hRDxegKPNp7_mmzx";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        if (!body.success) {
            console.log("Invalid captcha");
        } else {
            mensaje_res.captcha = true;
            //Name + Last Name
            var complete_name = req.body.client_name + ' ' + req.body.client_lastname;
            var reqText = "";
            var reqType;
            var fpago = "";
            var api_name = "";
            //Option text based on option list selection
            switch (req.body.fpago) {
                case 'tcred':
                    if (req.body.lang === 'es') { fpago = "Tarjeta de Crédito" };
                    if (req.body.lang === 'en') { fpago = "Credit Card" };
                    break;
                case 'efect':
                    if (req.body.lang === 'es') { fpago = "Efectivo" };
                    if (req.body.lang === 'en') { fpago = "Cash" };
                    break;
                case 'debit':
                    if (req.body.lang === 'es') { fpago = "Débito Bancario" };
                    if (req.body.lang === 'en') { fpago = "Bank Debit" };
                    break;
            }
            //Option text based on option list selection
            switch (req.body.api_name) {
                case 'geo':
                    api_name = 'Geocoder';
                    break;
                case 'gen':
                    api_name = 'Gender-Decoder';
                    break;
                case 'sent':
                    api_name = 'Sentiment-Analysis';
                    break;
            }

            if (req.body.lang === 'es')
                reqType = "Información sobre";

            if (req.body.lang === 'en')
                reqType = "Information about";

            var reqAll = reqType + ' ' + api_name;
            var to_email = 'contact@handytec.mobi';
            if (req.body.section == 'CONTACTAPI') to_email = 'ventas@handytec.mobi';

            //HTML template to be sent to contact@handytec
            var mensaje = "";
            if (req.body.section == 'CONTACTAPI') mensaje = 'Nueva solicitud de información sobre APIs';
            //else mensaje=req.body.client_message;
            var html_body;

            if (req.body.lang === 'es')
                html_body = '<div style="width:98%; margin:0 auto;"> <div style="text-align:left;vertical-align: middle;"> <div> <img src="https://www.handytec.mobi/images/email/header-enviar.png" style="max-width: 100%; background-color: transparent;"/> </div> </div> <div style="margin-top:3px; "> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <label style="color: #2C86C7;"><b>Nombre:&nbsp;</b></label>' + complete_name + '<br> <label style="color: #2C86C7;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br> <label style="color: #2C86C7;"><b>Llegó vía:&nbsp;</b></label>' + req.body.found_by + '<br> <label style="color: #2C86C7;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br> <label style="color: #2C86C7;"><b>Empresa:&nbsp;</b></label>' + req.body.company + '<br> <label style="color: #2C86C7;"><b>Requerimiento para &nbsp;</b></label>' + reqAll + '<br> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <label style="color: #2C86C7;font-size:16px;"><b>Descripción del Requerimiento:</b></label><br><br>' + mensaje + ' <div style="text-align:right; margin-top: 20px; margin-bottom: 15px; margin-right: 10px;"> <a href="mailto:' + req.body.email + '" style="font-family: Tahoma; color: #2C86C7; font-size: 16px; padding: 10px 20px 10px 20px; text-decoration: none; border-style: solid; border-width: 1.5px;">Contestar</a> </div> </div> </div>';

            if (req.body.lang === 'en')
                html_body = '<div style="width:98%; margin:0 auto;"><div style="text-align:left;vertical-align: middle;"><div><img src="https://www.handytec.mobi/images/email/header-enviar.png" style="max-width: 100%; background-color: transparent;"/></div></div><div style="margin-top:3px; "> </div><div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"><label style="color: #2C86C7;"><b>Name:&nbsp;</b></label>' + complete_name + '<br><label style="color: #2C86C7;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br> <label style="color: #2C86C7;"><b>Came through:&nbsp;</b></label>' + req.body.found_by + '<br><label style="color: #2C86C7;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br><label style="color: #2C86C7;"><b>Company:&nbsp;</b></label>' + req.body.company + '<br><label style="color: #2C86C7;"><b>Requires &nbsp;</b></label>' + reqAll + '<br></div><div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"><label style="color: #2C86C7;font-size:16px;"><b>Requirement Description:</b></label><br><br>' + mensaje + '<div style="text-align:right; margin-top: 20px; margin-bottom: 15px; margin-right: 10px;"><a href="mailto:' + req.body.email + '" style="font-family: Tahoma; color: #2C86C7; font-size: 16px; padding: 10px 20px 10px 20px; text-decoration: none; border-style: solid; border-width: 1.5px;">Ansert</a></div></div></div>';

            // setup e-mail data with unicode symbols

            var subject;
            if (req.body.lang === 'es')
                subject = 'Cliente Requiere: ' + reqAll;

            if (req.body.lang === 'en')
                subject = 'Client Requires: ' + reqAll;

            var mailOptions = {
                from: complete_name + ' <' + req.body.email + '>', // sender address
                to: to_email, // list of receivers
                subject: subject, // Subject line
                html: html_body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {

                } else {
                    console.log('Lang: ' + req.body.lang + ' status: ' + status);
                    mensaje_res.contact_email = true;

                }
                //Sconsole.log('Message sent to contact@handytec: ' + info.response);
            });
            transporter.close();

            /* Store in DB new client */
            function getFormattedDate() {
                var date = new Date();
                var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                return str;
            }

            var current_date = getFormattedDate();

            var dev = false;
            var device = 'WEB';

            console.log("enviar.js: Este es el device: " + req.body.device);

            if (req.body.device == "true") {
                device = 'MOB';
            }

            //Setup customer object
            var customer = {
                DATE: current_date,
                NAME: req.body.client_name,
                LAST_NAME: req.body.client_lastname,
                EMAIL: req.body.email,
                PHONE: req.body.phone,
                COMPANY: req.body.company,
                REQUIREMENT: reqAll + ' con forma de pago deseada: ' + fpago,
                ORIGIN: device,
                SUSCRIBED: 1,
                SECTION: req.body.section,
                FOUND_BY: req.body.found_by,
            };
            console.log("Data CUSTOMER: ", customer);
            //Send email to customer
            //Call to ata layer in order to insert new Client
            /* var result = data.newCustomer(customer);
             if (result == 1){
                 console.log('New customer successfully inserted');
                 mensaje_res.save_db=true;
             }*/

            var html_body_response = '';
            if (req.body.lang === 'es') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; padding: 15px 10px; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:32px;"> <div style="float:left; width:50%;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://www.handytec.mobi/images/logos/logo-handytec.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="160" > </a> </div> <div style="float:left; width:50%; text-align: right; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> <a style="text-decoration:none" href="https://www.handytec.mobi/es" class="clink logo-container"> <img src="http://www.handytec.mobi/images/Web.png" alt="handytec" border="0" class="sig-logo" width="160" style="width:40px;border-radius: 5px;"></a> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p>Hola ' + req.body.client_name + ',</p> <p></p> <p>Hemos recibido tu correo a través de la página web de handytec.</p> <p></p> <p>En breve nos pondremos en contacto contigo para entender tus necesidades y qué oportunidades quieres explotar con nuestro API de ' + api_name + '.</p> <br> <p>Atentamente,</p> <p>El equipo de handytec</p> <p></p> <br><br> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:132px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:rgb(151,151,151);"> <p>© 2018 Handytecmobi S.A. Todos los derechos reservados.</p> <p></p> <p> <a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color: rgb(4, 137, 177); text-decoration: none; display: inline;"> www.handytec.mobi </a> </p> <p></p> <p style="font-family: Tahoma; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 10px;"> <span style="font-weight: bold; color: rgb(151, 151, 151); display: inline;" class="txt signature_name-target sig-hide">Handytecmobi S.A.</span><br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_jobtitle-target sig-hide">Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br> </span> <a class="link email signature_email-target sig-hide" href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(151,151,151); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide">(02) 224-3559</span> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide"></span> </p><p></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Tahoma; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://github.com/handytecmobi" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="32" height="32" style="top: 100px;" data-filename="github.png" src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" alt="GitHub"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> </div> </div> </div>'; }
            if (req.body.lang === 'en') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; padding: 15px 10px; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:32px;"> <div style="float:left; width:50%;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://www.handytec.mobi/images/logos/logo-handytec.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="160" > </a> </div> <div style="float:left; width:50%; text-align: right; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> <a style="text-decoration:none" href="https://www.handytec.mobi/en" class="clink logo-container"> <img src="http://www.handytec.mobi/images/Web.png" alt="handytec" border="0" class="sig-logo" width="160" style="width:40px;border-radius: 5px;"> </a> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p>Hello ' + req.body.client_name + ',</p> <p></p> <p>We have received your email through the handytec website.</p> <p></p> <p>Soon we will contact you to understand your needs and what you want with your API ' + api_name + '.</p> <br> <p>Sincerely,</p> <p>The handytec team</p> <p></p> <br><br> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:132px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:rgb(151,151,151);"> <p>© 2018 Handytecmobi S.A. All rights reserved.</p> <p></p> <p> <a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color: rgb(4, 137, 177); text-decoration: none; display: inline;"> www.handytec.mobi </a> </p> <p></p> <p style="font-family: Tahoma; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 10px;"> <span style="font-weight: bold; color: rgb(151, 151, 151); display: inline;" class="txt signature_name-target sig-hide">Handytecmobi S.A.</span><br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_jobtitle-target sig-hide">Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a class="link email signature_email-target sig-hide" href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(151,151,151); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide">(02) 224-3559</span> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide"></span> </p> <p></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Tahoma; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://github.com/handytecmobi" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="32" height="32" style="top: 100px;" data-filename="github.png" src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" alt="GitHub"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> </div> </div> </div>'; }

            // setup e-mail data with unicode symbols
            var mailOptionsResponse = {};
            if (req.body.lang === 'es') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: '(No contestar) Estamos analizando tu requerimiento', // Subject line
                    html: html_body_response
                };
            }
            if (req.body.lang === 'en') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: '(Do not reply) We are reviewing your request', // Subject line
                    html: html_body_response
                };
            }

            transporter.sendMail(mailOptionsResponse, function (error, info) {
                if (error) {
                    // res.render('error',{message: "Error al enviar mensaje"});
                    return console.log(error);
                }
                //console.log('Message sent to Client: ' + info.response);
                mensaje_res.client_email = true;
            });
            transporter.close();

        }//final: ELSE of captcha
        res.json(mensaje_res);
    });  //final request varification (captcha)
    /*End*/

});
router.post('/request/inscription/none', function (req, res) {
    console.log("request route inscription ", req.body);
    var event_name = "DATA SCIENCE BOOTCAMP";
    var mensaje_res = { captcha: false, contact_email: false, client_email: false, save_db: false, lang: "" };
    /*Start*/
    var status = 1;
    if (req.body.lang === 'es') mensaje_res.lang = "es";
    if (req.body.lang === 'en') mensaje_res.lang = "en";

    //CAPTCHA
    var secretKey = "6Lc6KHAUAAAAAAbCAci998R-hRDxegKPNp7_mmzx";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        if (!body.success) {
            console.log("Invalid captcha");
        } else {
            mensaje_res.captcha = true;
            var complete_name = req.body.client_name + ' ' + req.body.client_lastname;
            var html_body = '<div style="width:98%; margin:0 auto;"> <div style="text-align:left;vertical-align: middle;"> <div> <img src="https://www.handytec.mobi/images/email/header-enviar.png" style="max-width: 100%; background-color: transparent;"/> </div> </div> <div style="margin-top:3px; "> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <h3>Inscripción para ' + event_name + '</h3> <label style="color: #2C86C7;"><b>Nombre:&nbsp;</b></label>' + complete_name + '<br> <label style="color: #2C86C7;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br> <label style="color: #2C86C7;"><b>Llegó vía:&nbsp;</b></label>' + req.body.found_by + '<br> <label style="color: #2C86C7;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br> <label style="color: #2C86C7;"><b>Organización:&nbsp;</b></label>' + req.body.company + '<br> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <label style="color: #2C86C7;font-size:16px;"><b>Conocimiento en lenguaje de programación científico:</b></label><br><br>' + req.body.request + ' </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: aliceblue;"> <label style="color: #2C86C7;font-size:16px;"><b>Proyecto a desarrollar:</b></label><br><br>' + req.body.client_message + ' <div style="text-align:right; margin-top: 20px; margin-bottom: 15px; margin-right: 10px;"> <a href="mailto:' + req.body.email + '" style="font-family: Tahoma; color: #2C86C7; font-size: 16px; padding: 10px 20px 10px 20px; text-decoration: none; border-style: solid; border-width: 1.5px;">Contestar</a> </div> </div> </div>';

            var to_email = 'contact@handytec.mobi';
            //var to_email='roberto.prado@handytec.mobi';//test
            // setup e-mail data with unicode symbols
            var mailOptions = {
                from: complete_name + ' <' + req.body.email + '>', // sender address
                to: to_email, // list of receivers
                subject: 'Nueva Inscripción para ' + event_name, // Subject line
                html: html_body
            };
            // send mail with defined transport object
            //            transporter.sendMail(mailOptions, function(error, info){
            //                if(error){
            //
            //                }else{
            //                    console.log('Lang: '+req.body.lang+' status: '+status);
            //                    mensaje_res.contact_email=true;
            //
            //                }
            //                console.log('Message sent to: ' + info.response,to_email);
            //            });
            //            transporter.close();

            /* Store in DB new client */
            function getFormattedDate() {
                var date = new Date();
                var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                return str;
            }

            var current_date = getFormattedDate();

            var dev = false;
            var device = 'WEB';

            console.log("enviar.js: Este es el device: " + req.body.device);

            if (req.body.device == "true") {
                device = 'MOB';
            }

            //Setup customer object
            //            console.log('name',req.body.client_name.length);
            //                console.log('lastname',req.body.client_lastname.length);
            //                console.log('email',req.body.email.length);
            //                console.log('phone',req.body.phone.length);
            //                console.log('company',req.body.company.length);
            //                console.log('request',req.body.request.length);
            //                console.log('message',req.body.client_message.length);
            //                console.log('found',req.body.found_by.length);
            var flag_check_fields = false;
            if (
                req.body.client_name.length < 30 &&
                req.body.client_lastname.length < 30 &&
                req.body.email.length < 50 &&
                req.body.phone.length < 11 &&
                req.body.company.length < 45 &&
                req.body.request.length < 500 &&
                req.body.client_message.length < 500 &&
                req.body.found_by.length < 45
            ) {
                flag_check_fields = true;
            }

            var customer = {
                DATE: current_date,
                NAME: req.body.client_name,
                LAST_NAME: req.body.client_lastname,
                EMAIL: req.body.email,
                PHONE: req.body.phone,
                COMPANY: req.body.company,
                REQUIREMENT: req.body.request,
                MESSAGE: req.body.client_message,
                ORIGIN: device,
                SUSCRIBED: 1,
                SECTION: event_name,
                FOUND_BY: req.body.found_by
            };
            console.log("Data Inscription: ", flag_check_fields);
            //Send email to customer
            //Call to ata layer in order to insert new Client
            /* if(flag_check_fields){
                 var result = data.newInscription(customer);
                 if (result == 1){
                     console.log('New customer successfully inserted');
                     mensaje_res.save_db=true;
                 }
             }*/

            var html_body_response = '';
            if (req.body.lang === 'es') { html_body_response = '<!DOCTYPE html> <html lang="en"> <head> <title>Bootstrap Example</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> </head> <body> <div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; padding: 15px 10px; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:32px;"> <div style="float:left; width:50%;"> <a style="text-decoration:none" href="https://www.handytec.mobi/es" class="clink logo-container"> <img src="http://www.handytec.mobi/images/logos/logo-handytec.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" style="width:160px;"> </a> </div> <div style="float:left; width:50%; text-align: right; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> <a style="text-decoration:none" href="https://www.handytec.mobi/es" class="clink logo-container"> <img src="http://www.handytec.mobi/images/Web.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="160" style="width:40px;border-radius: 5px;"> </a> </div> </div> <div class="content" style="border-collapse: collapse; padding: 35px 35px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p>Hola ' + req.body.client_name + ',</p> <p>¡Gracias por inscribirte!</p><br> <p>Nuestro Data Science Bootcamp es un trabajo conjunto entre handytec e IBM Ecuador para impulsar a la comunidad local de Científicos de Datos.</p> <p></p> <p>En breve nos pondremos en contacto directo contigo.</p> <br> <p>Atentamente,</p> <p>El equipo de handytec</p> <p></p><br> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:132px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:rgb(151,151,151);"> <p>© 2018 Handytecmobi S.A. Todos los derechos reservados.</p> <p></p> <p> <a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color: rgb(4, 137, 177); text-decoration: none; display: inline;"> www.handytec.mobi </a> </p> <p></p> <p style="font-family: Tahoma; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 10px;"> <span style="font-weight: bold; color: rgb(151, 151, 151); display: inline;" class="txt signature_name-target sig-hide">Handytecmobi S.A.</span><br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_jobtitle-target sig-hide">Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a class="link email signature_email-target sig-hide" href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(151,151,151); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide">(02) 224-3559</span> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide"></span> </p> <p></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Tahoma; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://github.com/handytecmobi" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="32" height="32" style="top: 100px;" data-filename="github.png" src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" alt="GitHub"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> </div> </div> </div> <style type="text/css"> @media only screen and (min-device-width: 601px) { } </style> </body> </html>'; }
            if (req.body.lang === 'en') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; padding: 15px 10px; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:32px;"> <div style="float:left; width:50%;"> <a style="text-decoration:none" href="https://www.handytec.mobi/en" class="clink logo-container"> <img src="https://www.handytec.mobi/images/logos/logo-handytec.png" alt="handytec - Big Data Analytics" border="0" class="sig-logo" width="160" > </a> </div> <div style="float:left; width:50%; text-align: right; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> <a style="text-decoration:none" href="https://www.handytec.mobi/en" class="clink logo-container"> <img src="http://www.handytec.mobi/images/Web.png" alt="handytec" border="0" class="sig-logo" width="160" style="width:40px;border-radius: 5px;"> </a> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p>Hi ' + req.body.client_name + ',</p> <p>Thanks for signing up!</p><br> <p>Our Data Science Bootcamp is a joint effort between handytec and IBM Ecuador to promote the local community of Data Scientists.</p> <p></p> <p>We will contact you shortly.</p><br> <p>Sincerely,</p> <p>The handytec team</p> <p></p><br> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:132px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 10px; line-height: 1.6; color:rgb(151,151,151);"> <p>© 2018 Handytecmobi S.A. All rights reserved.</p> <p></p> <p> <a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color: rgb(4, 137, 177); text-decoration: none; display: inline;"> www.handytec.mobi </a> </p> <p></p> <p style="font-family: Tahoma; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 10px;"> <span style="font-weight: bold; color: rgb(151, 151, 151); display: inline;" class="txt signature_name-target sig-hide">Handytecmobi S.A.</span><br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_jobtitle-target sig-hide">Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a class="link email signature_email-target sig-hide" href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(151,151,151); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide">(02) 224-3559</span> <br> <span style="color: rgb(151,151,151); display: inline; font-size: 10px;" class="txt signature_mobilephone-target sig-hide"></span> </p> <p></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: \'Open Sans\',Arial,sans-serif; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Tahoma; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://github.com/handytecmobi" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="32" height="32" style="top: 100px;" data-filename="github.png" src="https://cdn0.iconfinder.com/data/icons/octicons/1024/mark-github-256.png" alt="GitHub"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> </div> </div> </div>'; }

            // setup e-mail data with unicode symbols
            var mailOptionsResponse = {};
            if (req.body.lang === 'es') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Gracias por inscribirte a nuestro Data Science Bootcamp', // Subject line
                    html: html_body_response
                };
            }
            if (req.body.lang === 'en') {
                mailOptionsResponse = {
                    from: 'Contacto handytec <noreply@handytec.mobi>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Thank you for your registration to our Data Science Bootcamp', // Subject line
                    html: html_body_response
                };
            }

            //            transporter.sendMail(mailOptionsResponse, function(error, info){
            //                if(error){
            //                    // res.render('error',{message: "Error al enviar mensaje"});
            //                    return console.log(error);
            //                }
            //                console.log('Message sent to Client: ' + info.response);
            //				mensaje_res.client_email=true;
            //            });
            //	       transporter.close();

        }//final: ELSE of captcha
        res.json(mensaje_res);
    });  //final request varification (captcha)
    /*End*/

});

/*Save data to firebase from users that download the brochure*/
router.post('/academy', function (req, res) {
    const { client_name, phone, email } = req.body;
    //console.log(req.body);
    ref.push().set({
        nombre_apellido: client_name,
        celular: phone,
        correo: email
    });
});


module.exports = router;
