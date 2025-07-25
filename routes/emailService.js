// emailService.js
const fs = require('fs');
const path = require('path');
const { transporter, ADMIN_EMAIL } = require('./nodemailer');

// 1️⃣ Thanks for joining email
const sendThanksEmail = async (to, firstName) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Thanks for joining Gudnet!',
        html: `
      <p>Hi ${firstName},</p>
      <p>Thank you for registering with <strong>Gudnet</strong>. We're glad to have you onboard!</p>
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
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Welcome to Gudnet!',
        html: htmlContent
    };

    return transporter.sendMail(mailOptions);
};

// 3️⃣ Subscription Expiry Reminder (1 week before)
const sendSubscriptionExpiryReminder = async (to, firstName, endDate) => {
    const formattedDate = new Date(endDate).toLocaleDateString();
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Subscription is About to Expire',
        html: `
      <p>Hi ${firstName},</p>
      <p>Your Gudnet subscription will expire in one week (on ${formattedDate}).</p>
      <p>To continue enjoying uninterrupted service, please renew your subscription.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// 4️⃣ Subscription Expired Notification
const sendSubscriptionExpiredNotification = async (to, firstName) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Subscription Has Expired',
        html: `
      <p>Hi ${firstName},</p>
      <p>Your Gudnet subscription has now expired.</p>
      <p>To continue using our services, please renew your subscription at your earliest convenience.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// Combine both onboarding emails
const sendOnboardingEmails = async (to, firstName, lastName, role) => {
    await sendThanksEmail(to, firstName);
    await sendWelcomeEmail(to, firstName, lastName, role);
};

// Check and send subscription reminders
const checkAndSendSubscriptionReminders = async (db) => {
    try {
        const today = new Date();
        const oneWeekLater = new Date();
        oneWeekLater.setDate(today.getDate() + 7);

        // Format dates for SQL query
        const todayStr = today.toISOString().split('T')[0];
        const oneWeekLaterStr = oneWeekLater.toISOString().split('T')[0];

        // Find subscriptions expiring in exactly 7 days
        const [expiringSoon] = await db.execute(
            `SELECT e.user_id, e.name, e.email_id, e.plan_enddate 
             FROM employer e
             WHERE e.plan_enddate = ?`,
            [oneWeekLaterStr]
        );

        // Find subscriptions expiring today
        const [expiringToday] = await db.execute(
            `SELECT e.user_id, e.name, e.email_id, e.plan_enddate 
             FROM employer e
             WHERE e.plan_enddate = ?`,
            [todayStr]
        );

        // Send reminders
        for (const employer of expiringSoon) {
            await sendSubscriptionExpiryReminder(
                employer.email_id,
                employer.name,
                employer.plan_enddate
            );
            console.log(`Sent expiry reminder to ${employer.email_id}`);
        }

        // Send expired notifications
        for (const employer of expiringToday) {
            await sendSubscriptionExpiredNotification(
                employer.email_id,
                employer.name
            );
            console.log(`Sent expiry notification to ${employer.email_id}`);
        }

        return {
            expiringSoonCount: expiringSoon.length,
            expiringTodayCount: expiringToday.length
        };
    } catch (err) {
        console.error('Error in subscription reminders:', err);
        throw err;
    }
};

module.exports = {
    sendThanksEmail,
    sendWelcomeEmail,
    sendOnboardingEmails,
    sendSubscriptionExpiryReminder,
    sendSubscriptionExpiredNotification,
    checkAndSendSubscriptionReminders
};