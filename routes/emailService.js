// emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Gmail transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rajeshyanamadala2000@gmail.com',
        pass: 'thpr ipkp cubr hupw' // Gmail App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// 1️⃣ Thanks for joining email
const sendThanksEmail = async (to, firstName) => {
    const mailOptions = {
        from: '"Gudnet Team" <rajeshyanamadala2000@gmail.com>',
        to,
        subject: 'Thanks for joining Gudnet!',
        html: `
      <p>Hi ${firstName},</p>
      <p>Thank you for registering with <strong>Gudnet</strong>. We’re glad to have you onboard!</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// 2️⃣ Welcome email using template
const sendWelcomeEmail = async (to, firstName, lastName, role = 'employer') => {
    const templatePath = path.join(__dirname, '../templates', 'welcomeEmail.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    htmlContent = htmlContent
        .replace('{{name}}', `${firstName}`)
        .replace('{{email}}', to);

    // Inject dynamic role-based content
    if (role === 'job seeker') {
        htmlContent = htmlContent.replace(
            /<p style="max-width:600px; margin: 0 auto;">([\s\S]*?)<\/p>/,
            `<p style="max-width:600px; margin: 0 auto;">
        Welcome to the Gudnet community! Start by updating your resume to stand out to employers.
        Browse job offers and connect with families and agencies looking for someone like you.
      </p>`
        );

        htmlContent = htmlContent.replace(
            /<a href="[^"]+" style="([\s\S]*?)">[\s\S]*?<\/a>/,
            `<a href="http://69.62.81.122:85/alljobs" style="$1">Find Jobs</a>`
        );
    }

    const mailOptions = {
        from: '"Gudnet Team" <rajeshyanamadala2000@gmail.com>',
        to,
        subject: 'Welcome to Gudnet!',
        html: htmlContent
    };

    return transporter.sendMail(mailOptions);
};


// Combine both
const sendOnboardingEmails = async (to, firstName, lastName, role) => {
  await sendThanksEmail(to, firstName);
  await sendWelcomeEmail(to, firstName, lastName, role); // ✅ now role is passed properly
};


module.exports = {
    sendThanksEmail,
    sendWelcomeEmail,
    sendOnboardingEmails
};
