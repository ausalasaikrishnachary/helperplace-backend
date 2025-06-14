const express = require('express');
const app = express();
const port = 5000;

// Middleware
app.use(express.json());

// Routes
const userRoutes = require('./../routes/userRoutes');


app.use('/', userRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});