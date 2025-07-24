// userRoute.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendOnboardingEmails } = require('./emailService');

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
  const {
    email, mobile_number, password, first_name, last_name,
    role, source, location, language_preference, agency_uid
  } = req.body;

  try {
    const query = `
      INSERT INTO users (email, mobile_number, password, first_name, last_name, role, source, location, language_preference, agency_uid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      email, mobile_number, password, first_name, last_name,
      role, source, location, language_preference, agency_uid
    ]);

    // Send welcome email
    await sendOnboardingEmails(email, first_name, last_name, role);

    res.status(201).json({
      id: result.insertId,
      email,
      mobile_number,
      first_name,
      last_name,
      role,
      source,
      location,
      language_preference,
      agency_uid
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, mobile_number, password, first_name, last_name, location, language_preference } = req.body;
  try {
    const query = `
      UPDATE users SET email = ?, mobile_number = ?, password = ?, first_name = ?, last_name = ?,  location = ?,
      language_preference = ?
      WHERE id = ?
    `;
    await db.query(query, [email, mobile_number, password, first_name, last_name, location,
      language_preference, id]);
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
    // First, try to find the user in the 'users' table
    const [userResults] = await db.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (userResults.length > 0) {
      const user = userResults[0];
      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          mobile_number: user.mobile_number,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          user_type: 'general' // you can optionally differentiate users
        }
      });
    }

    // If not found in 'users', try 'agency_user' table
    const [agencyResults] = await db.query(
      'SELECT * FROM agency_user WHERE email = ? AND password = ?',
      [email, password]
    );

    if (agencyResults.length > 0) {
      const agencyUser = agencyResults[0];
      return res.json({
        message: 'Login successful',
        user: {
          id: agencyUser.id,
          email: agencyUser.email,
          mobile_number: agencyUser.mobile_number,
          first_name: agencyUser.first_name,
          last_name: agencyUser.last_name,
          role: agencyUser.role,
          is_verified: agencyUser.is_verified,
          created_at: agencyUser.created_at,
          user_type: 'agency' // differentiate if needed
        }
      });
    }

    // If no match in both tables
    return res.status(401).json({ message: 'Invalid email or password' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
