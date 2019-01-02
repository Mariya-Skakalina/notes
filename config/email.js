'use strict';
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    user:    "user", 
    password: "password", 
    host: 'localhost',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    tls:{
        rejectUnauthorized: false
    }
});

module.exports.transporter = transporter