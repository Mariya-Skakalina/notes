'use strict';
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: "admin", // generated ethereal user
        pass: "12345" // generated ethereal password
    }
});

module.exports.transporter = transporter