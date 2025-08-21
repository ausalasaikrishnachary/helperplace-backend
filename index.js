const express = require('express');
const cors = require('cors');
const app = express();

const path = require('path');
const cron = require('node-cron');
const emailService = require('./routes/emailService');
const db = require('./db');


const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file routes
app.use('/images', express.static('images'));
app.use('/videos', express.static('videos'));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

// Routes
const userRoutes = require('./routes/userRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const employerRoutes = require('./routes/employerRoutes');
const applyRoutes = require('./routes/applyRoutes');
const job_reportRoutes = require('./routes/job_reportRoutes');
const candidate_reportRoutes = require('./routes/candidate_reportRoutes');
const forgotpassword = require('./routes/forgotpassword');
const Jobpositionroutes = require('./routes/Jobpositionroutes');
const Subscriptionplanroutes = require('./routes/Subscriptionplanroutes');
const AgencySubscriptionplansRoutes = require('./routes/AgencySubscriptionplansRoutes');
const mailRoutes = require('./routes/mailRoutes');

app.use('/', userRoutes);
app.use('/api', jobSeekerRoutes);
app.use('/api', agencyRoutes);
app.use("/api/employer", employerRoutes);
app.use("/", applyRoutes);
app.use("/message", mailRoutes);
app.use("/api/jobreport", job_reportRoutes);
app.use("/api/candidatereport", candidate_reportRoutes);
app.use("/api/jobposition", Jobpositionroutes);
app.use("/api/subscriptionplans", Subscriptionplanroutes);
app.use("/api/agencysubscriptionplans", AgencySubscriptionplansRoutes);
app.use('/', forgotpassword);
require('./routes/inactivityChecker');

// Schedule daily subscription reminder at 1:30 PM IST (08:00 AM UTC)
// ✅ Schedule daily subscription reminder at 1:30 PM IST
cron.schedule('33 13 * * *', async () => {
  console.log('⏰ [IST] Running scheduled subscription reminders at 1:30 PM');
  try {
    const result = await emailService.checkAndSendSubscriptionReminders(db);
    console.log('✅ Subscription reminders processed:', result);
  } catch (err) {
    console.error('❌ Error in scheduled subscription reminders:', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});