const express = require('express');
const cors = require('cors'); // ✅ Import CORS
const app = express();
const path = require('path'); // ✅ Add this line
const port = 5000;

// ✅ Use CORS Middleware (allows requests from any origin)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());


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

app.use('/', userRoutes);
app.use('/api', jobSeekerRoutes);
app.use('/api', agencyRoutes);
app.use("/api/employer", employerRoutes);
app.use("/", applyRoutes);
app.use("/api/jobreport", job_reportRoutes);
app.use("/api/candidatereport", candidate_reportRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
