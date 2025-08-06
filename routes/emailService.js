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

// 3️⃣ OTP Verification Email
const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Verification Code',
        html: `
      <p>Hello,</p>
      <p>Your verification code for Gudnet is:</p>
      <h2 style="margin: 20px 0; color: #2563eb; font-size: 28px;">${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p>Best regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// 4️⃣ Subscription Expiry Reminder (1 week before)
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

// 5️⃣ Subscription Expired Notification
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

// 6️⃣ Job Posting Expired Notification (sent when subscription expires)
const sendJobpostingexpiredNotification = async (to, firstName) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Job Postings Have Been Deactivated',
        html: `
      <p>Hi ${firstName},</p>
      <p>Due to your subscription expiration, all your active job postings have been temporarily deactivated.</p>
      <p>To reactivate your job postings and continue receiving applications, please renew your subscription.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// 7️⃣ Free Trial Ending Reminder (1 day before)
const sendFreeTrialEndingReminder = async (to, firstName, endDate) => {
    const formattedDate = new Date(endDate).toLocaleDateString();
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Free Trial is Ending Soon',
        html: `
      <p>Hi ${firstName},</p>
      <p>Your Gudnet free trial will end tomorrow (on ${formattedDate}).</p>
      <p>Upgrade to a premium plan to continue posting jobs and accessing all features.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// 8️⃣ Subscription Renewal Confirmation
const sendSubscriptionRenewalConfirmation = async (to, firstName, planName, endDate) => {
    const formattedDate = new Date(endDate).toLocaleDateString();
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Subscription Renewal Confirmation',
        html: `
      <p>Hi ${firstName},</p>
      <p>Your Gudnet subscription (${planName}) has been successfully renewed!</p>
      <p>Your new subscription end date is ${formattedDate}.</p>
      <p>Thank you for continuing with us.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// 9️⃣ Plan Upgrade Suggestion (1 day before expiry)
const sendPlanUpgradeSuggestion = async (to, firstName, currentPlan, endDate) => {
    const formattedDate = new Date(endDate).toLocaleDateString('en-IN');

    let suggestedPlan = '';
    let benefits = [];

    const plan = currentPlan.toLowerCase();

    if (plan === 'free posting') {
        suggestedPlan = 'Silver';
        benefits = [
            'Post unlimited jobs',
            'Access to premium candidate search',
            'Priority customer support'
        ];
    } else if (plan === 'silver') {
        suggestedPlan = 'Gold';
        benefits = [
            'All Silver benefits plus',
            'Featured job listings',
            'Advanced analytics dashboard',
            'Dedicated account manager'
        ];
    } else {
        // Optionally skip or customize other plans
        return;
    }

    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: `Upgrade to ${suggestedPlan} Plan - More Power to You!`,
        html: `
            <p>Hi ${firstName},</p>
            <p>Your current <strong>${currentPlan}</strong> plan is expiring tomorrow (on ${formattedDate}).</p>
            <p>We recommend upgrading to our <strong>${suggestedPlan} Plan</strong> to enjoy these benefits:</p>
            <ul>
                ${benefits.map(b => `<li>${b}</li>`).join('')}
            </ul>
            <p>Upgrade now to keep your hiring uninterrupted and effective!</p>
            <p>Best Regards,<br/>Gudnet Team</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

// 🔟 Low Views Reminder
const sendLowViewsReminder = async (to, firstName, jobTitle, viewCount) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: `Boost Your Job Post: "${jobTitle}" Only Has ${viewCount} Views`,
        html: `
      <p>Hi ${firstName},</p>
      <p>We noticed your job posting <strong>"${jobTitle}"</strong> has only received ${viewCount} views so far.</p>
      <p>Here are some tips to improve visibility:</p>
      <ul>
        <li><strong>Optimize your title:</strong> Make it specific and include key terms job seekers might search for</li>
        <li><strong>Enhance the description:</strong> Add more details about responsibilities and benefits</li>
        <li><strong>Consider reposting:</strong> Sometimes timing can affect visibility</li>
        <li><strong>Check requirements:</strong> Ensure your requirements aren't too restrictive</li>
      </ul>
      <p>You can edit your posting anytime to improve its performance.</p>
      <p>Need help? Reply to this email and our team will assist you.</p>
      <p>Best regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

const sendProfileRejectedEmail = async (to, firstName) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Profile Has Been Rejected',
        html: `
      <p>Hi ${firstName},</p>
      <p>We regret to inform you that your profile on Gudnet has been rejected and removed from our platform.</p>
      <p>This decision was made after careful review by our team.</p>
      <p>If you believe this was a mistake or would like more information, please reply to this email.</p>
      <p>Best regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

const sendIncompleteProfileReminder = async (to, firstName, completionPercentage) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Complete Your Profile to Get More Visibility',
        html: `
      <p>Hi ${firstName},</p>
      <p>We noticed your profile is only ${completionPercentage}% complete!</p>
      <p>Complete your profile to:</p>
      <ul>
        <li>Increase your visibility to potential candidates</li>
        <li>Get better matches for your job requirements</li>
        <li>Access all platform features</li>
      </ul>
      <p>Log in now to complete the remaining sections and get the most out of Gudnet.</p>
      <p>Best regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// Combine both onboarding emails
const sendOnboardingEmails = async (to, firstName, lastName, role) => {
    await sendThanksEmail(to, firstName);
    await sendWelcomeEmail(to, firstName, lastName, role);
};

// Check and send low views reminders
const checkAndSendLowViewsReminders = async (db) => {
    try {
        // Find employers with view_count <= 5 that haven't been notified yet
        const [lowViewEmployers] = await db.execute(`
            SELECT id, name, email_id, view_count
            FROM employer
            WHERE view_count <= 5 
            
        `);

        // Send reminders for low view counts
        for (const employer of lowViewEmployers) {
            await sendLowViewsReminder(
                employer.email_id,
                employer.name,
                "Your Profile/Post", // Generic title since we don't have job titles
                employer.view_count
            );
            console.log(`Sent low views reminder to ${employer.email_id}`);

            // Mark as notified
            // await db.execute(
            //     `UPDATE employer SET low_views_notified = 1 WHERE id = ?`,
            //     [employer.id]
            // );
        }

        return {
            lowViewRemindersSent: lowViewEmployers.length
        };
    } catch (err) {
        console.error('Error in low views reminders:', err);
        throw err;
    }
};

// Check and send subscription reminders
const checkAndSendSubscriptionReminders = async (db) => {
    try {
        const today = new Date();
        const oneWeekLater = new Date();
        oneWeekLater.setDate(today.getDate() + 7);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        // Format dates for SQL query
        const todayStr = today.toISOString().split('T')[0];
        const oneWeekLaterStr = oneWeekLater.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Find incomplete profiles (columns_percentage < 100)
        const [incompleteProfiles] = await db.execute(
            `SELECT id, name, email_id, columns_percentage 
             FROM employer 
             WHERE columns_percentage < 100`
        );

        // Send reminders for incomplete profiles
        for (const employer of incompleteProfiles) {
            await sendIncompleteProfileReminder(
                employer.email_id,
                employer.name,
                employer.columns_percentage
            );
            console.log(`Sent incomplete profile reminder to ${employer.email_id}`);
        }

        // Find incomplete profiles (columns_percentage < 100)
        const [incompleteProfile] = await db.execute(
            `SELECT user_id, first_name, email_id, columns_percentage 
             FROM job_seekers 
             WHERE columns_percentage < 100`
        );

        // Send reminders for incomplete profiles
        for (const job_seeker of incompleteProfile) {
            await sendIncompleteProfileReminder(
                job_seeker.email_id,
                job_seeker.name,
                job_seeker.columns_percentage
            );
            console.log(`Sent incomplete profile reminder to ${job_seeker.email_id}`);
        }

        // Find subscriptions expiring in exactly 7 days
        const [expiringSoon] = await db.execute(
            `SELECT e.user_id, e.name, e.email_id, e.plan_enddate, e.plan_name 
             FROM employer e
             WHERE e.plan_enddate = ?`,
            [oneWeekLaterStr]
        );

        // Find subscriptions expiring today
        const [expiringToday] = await db.execute(
            `SELECT e.user_id, e.name, e.email_id, e.plan_enddate, e.plan_name 
             FROM employer e
             WHERE e.plan_enddate = ?`,
            [todayStr]
        );

        // Find free trials ending tomorrow (only for 'free posting' plans)
        const [freeTrialsEnding] = await db.execute(
            `SELECT e.user_id, e.name, e.email_id, e.plan_enddate, e.plan_name 
             FROM employer e
             WHERE e.plan_enddate = ? AND e.plan_name = 'free posting'`,
            [tomorrowStr]
        );

        // Find all plans ending tomorrow (for upgrade suggestions)
        const [plansEndingTomorrow] = await db.execute(
            `SELECT e.user_id, e.name, e.email_id, e.plan_enddate, e.plan_name 
             FROM employer e
             WHERE e.plan_enddate = ?`,
            [tomorrowStr]
        );

        // Send reminders for subscriptions expiring in 7 days
        for (const employer of expiringSoon) {
            await sendSubscriptionExpiryReminder(
                employer.email_id,
                employer.name,
                employer.plan_enddate
            );
            console.log(`Sent expiry reminder to ${employer.email_id}`);
        }

        // Send notifications for subscriptions expiring today
        for (const employer of expiringToday) {
            // Send subscription expired notification
            await sendSubscriptionExpiredNotification(
                employer.email_id,
                employer.name
            );

            console.log(`Sent expiry notifications to ${employer.email_id}`);
        }

        for (const employer of expiringToday) {
            // Send job postings expired notification
            await sendJobpostingexpiredNotification(
                employer.email_id,
                employer.name
            );

            console.log(`Sent expiry notifications to ${employer.email_id}`);
        }

        // Send free trial ending reminders
        for (const employer of freeTrialsEnding) {
            await sendFreeTrialEndingReminder(
                employer.email_id,
                employer.name,
                employer.plan_enddate
            );
            console.log(`Sent free trial ending reminder to ${employer.email_id}`);
        }

        // Send plan upgrade suggestions
        for (const employer of plansEndingTomorrow) {
            const plan = employer.plan_name.toLowerCase();

            if (plan === 'free posting' || plan === 'silver') {
                await sendPlanUpgradeSuggestion(
                    employer.email_id,
                    employer.name,
                    employer.plan_name,
                    employer.plan_enddate
                );
                console.log(`📧 Sent plan upgrade suggestion to ${employer.email_id}`);
            }
        }

        // Check for low views
        const lowViewsResult = await checkAndSendLowViewsReminders(db);

        return {
            incompleteProfileRemindersSent: incompleteProfiles.length,
            incompleteProfileReminderSent: incompleteProfile.length,
            expiringSoonCount: expiringSoon.length,
            expiringTodayCount: expiringToday.length,
            freeTrialsEndingCount: freeTrialsEnding.length,
            upgradeSuggestionsSent: plansEndingTomorrow.length - freeTrialsEnding.length,
            lowViewRemindersSent: lowViewsResult.lowViewRemindersSent
        };
    } catch (err) {
        console.error('Error in subscription reminders:', err);
        throw err;
    }
};

const sendInactivityNotification = async (to, firstName, daysInactive) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: `We Miss You! It's Been ${daysInactive} Days`,
        html: `
      <p>Hi ${firstName},</p>
      <p>We noticed you haven't logged in to Gudnet for ${daysInactive} days.</p>
      <p>We miss having you around! Log in now to check out new updates and opportunities.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

const sendProfileVerifiedEmail = async (to, firstName) => {
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Your Profile Has Been Verified!',
        html: `
      <p>Hi ${firstName},</p>
      <p>We're pleased to inform you that your profile on Gudnet has been verified by our team!</p>
      <p>This verification badge will make your profile more visible to employers and increase your chances of getting hired.</p>
      <p>Log in to your account to see your verified status and explore new job opportunities.</p>
      <p>Best regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

// Add this new function to your email services
const sendSubscriptionPlanChangeEmail = async (to, firstName, oldPlan, newPlan, endDate) => {
    const formattedDate = new Date(endDate).toLocaleDateString();
    const mailOptions = {
        from: `"Gudnet Team" <${ADMIN_EMAIL}>`,
        to,
        subject: 'Subscription Plan Change Confirmation',
        html: `
      <p>Hi ${firstName},</p>
      <p>Your Gudnet subscription has been successfully changed from <strong>${oldPlan}</strong> to <strong>${newPlan}</strong>!</p>
      <p>Your new subscription end date is ${formattedDate}.</p>
      <p>Thank you for choosing a higher plan with us.</p>
      <p>Warm regards,<br/>Gudnet Team</p>
    `
    };
    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendThanksEmail,
    sendWelcomeEmail,
    sendOtpEmail,
    sendOnboardingEmails,
    sendSubscriptionExpiryReminder,
    sendSubscriptionExpiredNotification,
    sendJobpostingexpiredNotification,
    sendFreeTrialEndingReminder,
    sendSubscriptionRenewalConfirmation,
    sendPlanUpgradeSuggestion,
    sendLowViewsReminder,
    checkAndSendSubscriptionReminders,
    checkAndSendLowViewsReminders,
    sendInactivityNotification,
    sendProfileRejectedEmail,
    sendProfileVerifiedEmail,
    sendIncompleteProfileReminder,
    sendSubscriptionPlanChangeEmail
};