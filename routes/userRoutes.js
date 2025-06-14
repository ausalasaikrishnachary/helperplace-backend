// userRoute.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust the path if needed

// Get all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
});

// Create a new user
router.post('/', (req, res) => {
  const { email, password, first_name, last_name, role } = req.body;
  const query = 'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [email, password, first_name, last_name, role], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, email, first_name, last_name, role });
  });
});

// Update user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { email, password, first_name, last_name, role, is_verified } = req.body;
  const query = `
    UPDATE users SET email = ?, password = ?, first_name = ?, last_name = ?, role = ?, is_verified = ?
    WHERE id = ?
  `;
  db.query(query, [email, password, first_name, last_name, role, is_verified, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
