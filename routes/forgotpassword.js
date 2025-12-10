const express = require('express');
const router = express.Router();
const db = require('../db');
const { transporter, ADMIN_EMAIL } = require('./nodemailer');

// OTP storage (in-memory for forgot password)
const forgotOtpStore = new Map();

// Generate 4-digit OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

router.put('/api/users/:userId/password', async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required.' });
  }

  try {
    const [results] = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully in MySQL.' });
  } catch (err) {
    console.error('MySQL error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update password.', error: err.message });
  }
});

router.get('/users/get-userId', async (req, res) => {
  const { email } = req.query;

  try {
    const [results] = await db.execute(
      'SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))',
      [email]
    );

    if (results.length === 0) {
      console.log("❌ No user found for email:", email);
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    return res.status(200).json({ success: true, id: results[0].id });
  } catch (err) {
    console.error('🔥 MySQL error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer ID.', error: err.message });
  }
});

// Send OTP for forgot password
router.post('/send-forgot-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email is required.' 
    });
  }

  try {
    // Check if email exists in users table
    const [results] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not found.' 
      });
    }

    // Generate and store OTP (valid for 10 minutes)
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    forgotOtpStore.set(email, { 
      otp, 
      expiresAt,
      verified: false 
    });

    // Send OTP email
    const mailOptions = {
      from: `${ADMIN_EMAIL}`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      expiresAt: expiresAt.toISOString()
    });
  } catch (err) {
    console.error('Error sending OTP:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending OTP' 
    });
  }
});

// Verify OTP for forgot password
router.post('/verify-forgot-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and OTP are required.' 
    });
  }

  try {
    const storedOtpData = forgotOtpStore.get(email);

    if (!storedOtpData) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP not found or expired. Please request a new one.' 
      });
    }

    // Check if OTP is expired (10 minutes)
    if (new Date() > storedOtpData.expiresAt) {
      forgotOtpStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please try again.' 
      });
    }

    // Mark OTP as verified
    forgotOtpStore.set(email, { 
      ...storedOtpData, 
      verified: true 
    });

    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully.',
      verified: true
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying OTP' 
    });
  }
});


module.exports = router;