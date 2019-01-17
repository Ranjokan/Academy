/************************************************************
*
*  Company: Handytecmobi S.A.
*  Author: Diego Montúfar
*  Editor: Andrés Caiza
*  Last Update: 2019/January/15
*  Class Name: enviar.js
*  Dependencies: fs, express, nodemailer, bodyparser, request
*  Description: This class is used for sending mail messages to clients that send his personal data through contact form
*
************************************************************/

var express = require('express');
var nodemailer = require('nodemailer');
var request = require('request');

var router = express.Router();


//Setup transporter object with noreply credentials
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'noreply@handytec.mobi',
        pass: 'handytecNOREPLY2016'
    }
    ,
    tls: {
        rejectUnauthorized: false
    }
});

/*-------------------------This route is used on e-Academy contact page-------------------------------*/
router.post('/request', function (req, res) {
    console.log(req.body);
    var mensaje_res = { captcha: false, contact_email: false, client_email: false, save_db: false, lang: "" };
    
    var status = 1;
    if (req.body.lang === 'es') mensaje_res.lang = "es";
    if (req.body.lang === 'en') mensaje_res.lang = "en";

    //Captcha Verification
    var secretKey = "6Lc6KHAUAAAAAAbCAci998R-hRDxegKPNp7_mmzx";
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

    request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        if (!body.success) {
            console.log("Invalid captcha verification");
        } else {
            mensaje_res.captcha = true;
            //Concat Complete Name
            var complete_name = req.body.client_name + ' ' + req.body.client_lastname;
            var reqText = "handytec e-Academy";
            var reqType = "información sobre ";
            //Concat Request and set receiver
            var reqAll = reqType + reqText;
            var to_email = 'academy@handytec.mobi';

            //HTML template to be sent to academy@handytec.mobi
            var mensaje = "";
            mensaje = req.body.client_message;
            var html_body = '<div style="width:98%; margin:0 auto;"> <div style="text-align:left;vertical-align: middle;"> <div> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/header-enviar.png?alt=media&token=4e10fd7b-6c54-4625-93ff-4a21ab371ec2" style="max-width: 100%; background-color: transparent;"/> </div> </div> <div style="margin-top:3px; "> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: lightgray; font-family:Arial"> <label style="color: #2C2C2C;"><b>Nombre:&nbsp;</b></label>' + complete_name + '<br> <label style="color: #2C2C2C;"><b>Email:&nbsp;</b></label>' + req.body.email + '<br> <label style="color: #2C2C2C;"><b>Llegó vía:&nbsp;</b></label>' + req.body.found_by + '<br> <label style="color: #2C2C2C;"><b>Telefono:&nbsp;</b></label>' + req.body.phone + '<br><label style="color: #2C2C2C;"><b>Requerimiento para &nbsp;</b></label>' + reqAll + '<br> </div> <div style="text-align: left; padding: 10px 10px 10px 10px; line-height: 23px; margin-top:3px; background-color: lightgray;font-family:Arial"> <label style="color: #2C2C2C;font-size:16px;"><b>Descripción del Requerimiento:</b></label><br><br>' + mensaje + ' <div style="text-align:right; margin-top: 20px; margin-bottom: 15px; margin-right: 10px;"> <a href="mailto:' + req.body.email + '" style="color: #2C2C2C; font-size: 16px; padding: 10px 20px 10px 20px; text-decoration: none; border-style: solid; border-width: 1.5px;font-family:Arial">Contestar</a> </div> </div> </div>';

            // Setup e-mail options
            var mailOptions = {
                from: complete_name + ' <' + req.body.email + '>', // sender address
                to: to_email, // list of receivers
                subject: 'Cliente Requiere: ' + reqText, // Subject line
                html: html_body
            };
            // Send Mail with transporter options
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                   return console.log (error)
                } else {
                    console.log('Lang: ' + req.body.lang + ' status: ' + status);
                    mensaje_res.contact_email = true;
                }
                console.log('Message sent to: ' + to_email + ' ' + info.response);
            });
            transporter.close();


            var device = 'WEB';
            console.log("False si es Web, True si es dispositivo móvil: " + req.body.device);
            if (req.body.device == "true") {
                device = 'MOB';
            }
            function getFormattedDate() {
                var date = new Date();
                var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                return str;
            }

            var current_date = getFormattedDate();

            //Setup customer object
            var customer = {
                DATE: current_date,
                NAME: req.body.client_name,
                LAST_NAME: req.body.client_lastname,
                EMAIL: req.body.email,
                PHONE: req.body.phone,
                ORIGIN: device,
                SUSCRIBED: 1,
                SECTION: req.body.section,
                FOUND_BY: req.body.found_by
            };
            console.log("Data CUSTOMER: ", customer);
            
            //Send email to customer
            var html_body_response = '';
            if (req.body.lang === 'es') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:auto;"> <div style=" text-align: center; width:100%;padding-left: 10px;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/header-cliente.png?alt=media&token=6f02dc5a-f6b9-4be7-89f9-bdb0ded11c03" alt="handytec - Big Data Analytics" border="0" class="sig-logo" height="200px" width="auto"> </a> </div> <div style="float:left; width:50%; text-align: right; font-family:Arial; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px 5px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family:Arial; font-size: 16px; line-height: 1.6; color:#313131; background-color:lightgray;"> <span>Hola</span><span style="font-weight: bold;"> ' + req.body.client_name + ',</span> <p></p> <p>Hemos recibido tu correo a través de la página web de handytec e-Academy. Estamos analizando tu requerimiento y pronto nos pondremos en contacto contigo.</p> <p></p> <span>Solicitud realizada para</span> <span style="font-weight: bold;">' + reqAll + '.</span> <p>Atentamente,</p> <span>El equipo de </span><span style="font-weight: bold;">handytec</span> <p></p> </div> <div style="border-collapse: collapse; padding: 10px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:80px;"> <div style="float:left; width:100%; text-align: center; font-family:Arial; font-size: 10px; line-height: 1.6; color:rgb(50,50,50);margin-bottom: 0px"><p><a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color:rgb(50,50,50);font-size:13px; font-weight: bold; text-decoration: none; display: inline;"> <u>www.handytec.mobi</u> </a> </p> <p></p> <p style="font-family: Arial; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 0px;"> <span style="font-weight: bold; color:rgb(50,50,50); display: inline;" >Handytecmobi S.A.</span><br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;" >Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(50,50,50); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;">(02) 224-3559</span></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: Arial; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Arial; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> <p style="font-size: 11px;">© 2019 Handytecmobi S.A. Todos los derechos reservados.</p> </div></div> </div>'; }
            if (req.body.lang === 'en') { html_body_response = '<div style="width:100%; margin:0 auto;"> <div style="border-collapse: collapse; border-width: 1px; border-color: rgb(230,230,230); border-style: solid solid none solid; height:auto;"> <div style=" text-align: center; width:100%;padding-left: 10px;"> <a style="text-decoration:none" href="https://www.handytec.mobi" class="clink logo-container"> <img src="https://firebasestorage.googleapis.com/v0/b/krypton-handytec.appspot.com/o/header-cliente_en.png?alt=media&token=e802f34f-4c1a-4746-8c73-26af0d8b0960" alt="handytec - Big Data Analytics" border="0" class="sig-logo" height="200px" width="auto"> </a> </div> <div style="float:left; width:50%; text-align: right; font-family:Arial; font-size: 10px; line-height: 1.6; color:#313131; padding-top: 0px;position:relative;bottom: 5px;"> </div> </div> <div style="border-collapse: collapse; padding: 35px 35px 5px; border-width: 1px; border-color: rgb(230,230,230);border-style: solid; height:auto; font-family:Arial; font-size: 16px; line-height: 1.6; color:#313131; background-color:lightgray;"> <span>Hello</span><span style="font-weight: bold;"> ' + req.body.client_name + ',</span> <p></p> <p>We have received your mail through the handytec e-Academy website. We are analyzing your request and we will contact you soon.</p> <p></p> <span>Request made for</span> <span style="font-weight: bold;">' + reqAll + '.</span> <p>Sincerely,</p><span>The </span><span style="font-weight: bold;">handytec</span> <span>team</span> <p></p> </div> <div style="border-collapse: collapse; padding: 10px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:80px;"> <div style="float:left; width:100%; text-align: center; font-family:Arial; font-size: 10px; line-height: 1.6; color:rgb(50,50,50);margin-bottom: 0px"><p><a class="link signature_website-target sig-hide" href="https://www.handytec.mobi" style="color:rgb(50,50,50);font-size:13px; font-weight: bold; text-decoration: none; display: inline;"> <u>www.handytec.mobi</u> </a> </p> <p></p> <p style="font-family: Arial; font-size: 13px; line-height: 12px; color: rgb(151, 151, 151); margin-bottom: 0px;"> <span style="font-weight: bold; color:rgb(50,50,50); display: inline;" >Handytecmobi S.A.</span><br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;" >Data Innovation</span> <span class="email-sep break" style="display: inline; font-size: 10px;"><br></span> <a href="mailto:contact@handytec.mobi" style="font-size: 10px; color: rgb(50,50,50); text-decoration: none; display: inline;">contact@handytec.mobi</a> <br> <span style="color: rgb(50,50,50); display: inline; font-size: 10px;">(02) 224-3559</span></p> </div> </div> <div style="border-collapse: collapse; padding: 15px 65px; border-width: 1px; border-color: rgb(230,230,230);border-style: none; height:60px;"> <div style="float:left; width:100%; text-align: center; font-family: Arial; font-size: 14px; line-height: 1.6; color:#313131"> <p style="font-family: Arial; font-size: 10px; line-height: 12px;"> <a href="https://www.facebook.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="facebook.png" src="https://s3.amazonaws.com/htmlsig-assets/round/facebook.png" alt="Facebook"> </a> <a href="https://twitter.com/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="twitter.png" src="https://s3.amazonaws.com/htmlsig-assets/round/twitter.png" alt="Twitter"> </a> <a href="https://www.linkedin.com/company/handytec" target="_blank" style="display: inline; text-decoration: none; padding: 0px 6px;"> <img width="30" height="30" data-filename="linkedin.png" src="https://s3.amazonaws.com/htmlsig-assets/round/linkedin.png" alt="Linkedin"> </a> </p> <p style="font-size: 11px;">© 2019 Handytecmobi S.A. All rights reserved.</p> </div></div> </div>'; }

            // Setup e-mail settings
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
                    return console.log(error);
                }
                console.log('Message sent to Client: ' + info.response);
                mensaje_res.client_email = true;
            });
            transporter.close();
        }
        res.json(mensaje_res);
    }); 
});

module.exports = router;
