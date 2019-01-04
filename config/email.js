'use strict';
const nodemailer = require('nodemailer'); //подлюсчени е библиотеки для работы с почтой
let transporter = nodemailer.createTransport({
    user:    "user", 
    password: "password", 
    host: 'localhost',
    port: 587,
    secure: false, // 
    tls:{
        rejectUnauthorized: false
    }
});

module.exports.transporter = transporter