const express = require('express');
const router = express.Router();
const db = require('../db'); // ✅ Correct if you're exporting directly
const { transporter, ADMIN_EMAIL } = require('./nodemailer');

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


router.post('/store-otp', async (req, res) => {
  const { email, otp } = req.body;
  const createdAt = new Date();

  try {
    await db.execute(
      'REPLACE INTO otp_verification (email, otp, created_at) VALUES (?, ?, ?)',
      [email, otp, createdAt]
    );

    return res.status(200).json({ success: true, message: 'OTP stored' });
  } catch (err) {
    console.error('Error storing OTP:', err);
    return res.status(500).json({ success: false, message: 'Error storing OTP' });
  }
});

router.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const mailOptions = {
      from: `${ADMIN_EMAIL}`,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP" });
  }
});


module.exports = router;
