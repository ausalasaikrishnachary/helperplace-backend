// nodemailer.js
const nodemailer = require('nodemailer');

// Admin email credentials
const ADMIN_EMAIL = 'iiiqbets01@gmail.com';
const ADMIN_APP_PASSWORD = 'rava xoel gzai rkgx';

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ADMIN_EMAIL,
        pass: ADMIN_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    // Add connection timeout
    connectionTimeout: 10000,
    // Add socket timeout
    socketTimeout: 10000,
    // Add greeting timeout
    greetingTimeout: 10000
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('Nodemailer transporter verification failed:', error);
    } else {
        console.log('Nodemailer transporter is ready to send emails');
    }
});

module.exports = {
    transporter,
    ADMIN_EMAIL
};