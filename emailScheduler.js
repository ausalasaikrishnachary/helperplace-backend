const nodemailer = require('nodemailer');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rajeshyanamadala2000@gmail.com',
    pass: 'thpr ipkp cubr hupw',
  },
});

const mailOptions = {
  from: '"Your Name" <rajeshyanamadala2000@gmail.com>',
  to: 'pavanimyana2000@gmail.com',
  subject: 'Scheduled Email at 1:48 PM',
  text: 'This email was sent automatically at 1:48 PM!',
};

cron.schedule('42 13 * * *', () => {
  console.log('⏰ Task triggered at 1:48 PM IST');

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('❌ Error sending email:', error);
    }
    console.log('✅ Email sent:', info.response);
  });
}, {
  timezone: 'Asia/Kolkata'
});

console.log('📅 Email scheduler is running...');
