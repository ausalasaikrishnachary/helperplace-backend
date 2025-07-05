const express = require('express');
const cors = require('cors'); // ✅ Import CORS
const app = express();
const port = 5000;

// ✅ Use CORS Middleware (allows requests from any origin)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());


app.use('/images', express.static('images'));
app.use('/videos', express.static('videos'));


// Routes
const userRoutes = require('./routes/userRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const employerRoutes = require('./routes/employerRoutes');
const applyRoutes = require('./routes/applyRoutes');


app.use('/', userRoutes);
app.use('/api', jobSeekerRoutes);
app.use('/api', agencyRoutes);
app.use("/api/employer", employerRoutes);
app.use("/", applyRoutes);


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
