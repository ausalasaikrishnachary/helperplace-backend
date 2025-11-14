const express = require('express');
const cors = require('cors');
const app = express();

const path = require('path');
const cron = require('node-cron');
const emailService = require('./routes/emailService');
const crypto = require("crypto");
require("dotenv").config();
const db = require("./db");

const port = 5001;

app.use(
  "/webhook/razorpay",
  express.raw({ type: "*/*" })   // captures raw body only for this route
);

// Middleware
app.use(cors());
app.use(express.json());

// Static file routes
app.use('/images', express.static('images'));
app.use('/videos', express.static('videos'));
app.use('/templates', express.static(path.join(__dirname, 'templates')));

app.use('/uploads', express.static('uploads'));

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
const paynowroutes = require('./routes/paymentRoutes');
const SupportRoutes = require('./routes/SupportRoutes');
const Tips = require('./routes/TipsRoutes');
const News = require('./routes/NewsRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const shortListRoutes = require('./routes/shortListRoutes');
const webhookRoutes = require("./routes/webhook");

app.use('/', userRoutes);
app.use('/api', jobSeekerRoutes);
app.use('/api', agencyRoutes);
app.use("/api/", employerRoutes);
app.use("/", applyRoutes);
app.use("/", mailRoutes);
app.use("/", SupportRoutes);
app.use("/api", Tips);
app.use("/api", News);
app.use("/api/", job_reportRoutes);
app.use("/api/", candidate_reportRoutes);
app.use("/api/", Jobpositionroutes);
app.use("/api/", Subscriptionplanroutes);
app.use("/api/", AgencySubscriptionplansRoutes);
app.use('/', forgotpassword);
app.use('/api', paynowroutes);
app.use("/", trainingRoutes);
app.use("/", shortListRoutes);
app.use("/", webhookRoutes);

require('./routes/inactivityChecker');

// ✅ Schedule daily subscription reminder at 1:30 PM IST
// cron.schedule('52 16 * * *', async () => {
// cron.schedule('30 13 * * *', async () => {
//   console.log('⏰ [IST] Running scheduled subscription reminders at 1:30 PM');
//   try {
//     const result = await emailService.checkAndSendSubscriptionReminders(db);
//     console.log('✅ Subscription reminders processed:', result);
//   } catch (err) {
//     console.error('❌ Error in scheduled subscription reminders:', err); 
//   }
// }, {
//   timezone: 'Asia/Kolkata'
// });


// ✅ Schedule daily payment due date reminder at 10:00 AM IST
cron.schedule('05 08 * * *', async () => {
  console.log('⏰ [IST] Running scheduled payment due date reminders at 10:00 AM');
  try {
    const result = await emailService.checkAndSendPaymentDueDateReminders(db);
    console.log('✅ Payment due date reminders processed:', result);
  } catch (err) {
    console.error('❌ Error in scheduled payment due date reminders:', err); 
  }
}, {
  timezone: 'Asia/Kolkata'
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});