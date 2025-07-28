const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendOnboardingEmails } = require('./emailService');
const crypto = require('crypto');
const { sendOtpEmail } = require('./emailService'); // You'll need to implement this

// OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

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

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate and store OTP (valid for 10 minutes)
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    otpStore.set(email, { otp, expiresAt });

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ 
      message: 'OTP sent successfully',
      expiresAt: expiresAt.toISOString()
    });

  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP for registration
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (new Date() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid - mark email as verified in our temporary store
    otpStore.set(email, { ...storedOtpData, verified: true });

    res.json({ 
      message: 'OTP verified successfully',
      verified: true
    });

  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new user (with OTP verification)
router.post('/', async (req, res) => {
  const {
    email, mobile_number, password, first_name, last_name,
    role, source, location, language_preference, agency_uid,
    otp // OTP from client
  } = req.body;

  try {
    // Check if OTP was verified for this email
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData || !storedOtpData.verified) {
      return res.status(400).json({ message: 'Email not verified with OTP' });
    }

    // Check if email already exists (double check)
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const query = `
      INSERT INTO users (
        email, mobile_number, password, first_name, last_name, 
        role, source, location, language_preference, agency_uid, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      email, mobile_number, password, first_name, last_name,
      role, source, location, language_preference, agency_uid,
      1 // is_verified set to true since we verified with OTP
    ]);

    // Send welcome email
    await sendOnboardingEmails(email, first_name, last_name, role);

    // Clear OTP data after successful registration
    otpStore.delete(email);

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
      agency_uid,
      is_verified: true
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
      UPDATE users SET email = ?, mobile_number = ?, password = ?, first_name = ?, last_name = ?,  
      location = ?, language_preference = ?
      WHERE id = ?
    `;
    await db.query(query, [
      email, mobile_number, password, first_name, last_name, 
      location, language_preference, id
    ]);
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
      
      // Update login activity for the user
      await db.query(
        'UPDATE users SET last_login_date = NOW() WHERE id = ?',
        [user.id]
      );
      
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
          user_type: 'general' 
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
      
      // Update login activity for agency user
      await db.query(
        'UPDATE agency_user SET last_login_date = NOW() WHERE id = ?',
        [agencyUser.id]
      );
      
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
          user_type: 'agency'
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