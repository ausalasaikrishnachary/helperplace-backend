const express = require('express');
const userRoutes = require('./../routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/', userRoutes);

// 👇 This is the key line for Vercel
module.exports = app;
