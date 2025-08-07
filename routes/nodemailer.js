// nodemailer.js
const nodemailer = require('nodemailer');

// Admin email credentials
// const ADMIN_EMAIL = 'rajeshyanamadala2000@gmail.com';
// const ADMIN_APP_PASSWORD = 'thpr ipkp cubr hupw'; 
const ADMIN_EMAIL = 'iiiqbets01@gmail.com';
const ADMIN_APP_PASSWORD = 'rava xoel gzai rkgx'; 

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ADMIN_EMAIL,
        pass: ADMIN_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = {
    transporter,
    ADMIN_EMAIL
};
