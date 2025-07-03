// userRoute.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust the path as needed

// Get all users
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const { email, mobile_number, password, first_name, last_name, role } = req.body;
  try {
    const query = `
      INSERT INTO users (email, mobile_number, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [email, mobile_number, password, first_name, last_name, role]);
    res.status(201).json({
      id: result.insertId,
      email,
      mobile_number,
      first_name,
      last_name,
      role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, mobile_number, password, first_name, last_name} = req.body;
  try {
    const query = `
      UPDATE users SET email = ?, mobile_number = ?, password = ?, first_name = ?, last_name = ?
      WHERE id = ?
    `;
    await db.query(query, [email, mobile_number, password, first_name, last_name, id]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        mobile_number: user.mobile_number,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
