const express = require('express');
const app = express();
const port = 5000;

// Middleware
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const jobSeekerRoutes = require('./routes/jobSeekerRoutes');


app.use('/', userRoutes);
app.use('/api', jobSeekerRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});