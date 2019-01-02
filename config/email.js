'use strict';
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 587,
    secure: false, // upgrade later with STARTTLS
});

module.exports.transporter = transporter