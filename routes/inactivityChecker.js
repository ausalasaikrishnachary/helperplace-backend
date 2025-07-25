const db = require('../db'); // your database connection
const { sendInactivityNotification } = require('./emailService');
const cron = require('node-cron');

// Check for inactive users and send notifications
const checkInactiveUsers = async () => {
    try {
        const currentDate = new Date();
        
        // Check users who haven't logged in for at least 7 days
        const [users] = await db.query(`
            SELECT * FROM users 
            WHERE last_login_date <= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        
        const [agencyUsers] = await db.query(`
            SELECT * FROM agency_user 
            WHERE last_login_date <= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        
        const allUsers = [...users, ...agencyUsers];
        
        for (const user of allUsers) {
            const lastLogin = new Date(user.last_login_date);
            const daysInactive = Math.floor((currentDate - lastLogin) / (1000 * 60 * 60 * 24));
            
            // Send email only on exactly 7th or 30th day
            if (daysInactive === 7 || daysInactive === 30) {
                try {
                    await sendInactivityNotification(user.email, user.first_name, daysInactive);
                    console.log(`Sent email to ${user.email} (inactive for ${daysInactive} days)`);
                    
                    // Update last notification time (optional)
                    await db.query(
                        `UPDATE ${user.user_type === 'agency' ? 'agency_user' : 'users'} 
                         SET last_notification_sent = NOW() 
                         WHERE id = ?`,
                        [user.id]
                    );
                } catch (emailError) {
                    console.error(`Failed to send email to ${user.email}:`, emailError.message);
                }
            }
        }
        
        return {
            totalChecked: allUsers.length,
            emailsSent: allUsers.filter(u => {
                const days = Math.floor((currentDate - new Date(u.last_login_date)) / (1000 * 60 * 60 * 24));
                return days === 7 || days === 30;
            }).length
        };
    } catch (err) {
        console.error('Error checking inactive users:', err);
        throw err;
    }
};

// Schedule to run daily at 10 AM
cron.schedule('16 19 * * *', () => {
    console.log('Running inactivity check...');
    checkInactiveUsers()
        .then(result => console.log('Inactivity check completed:', result))
        .catch(err => console.error('Error in inactivity check:', err));
});

module.exports = { checkInactiveUsers };