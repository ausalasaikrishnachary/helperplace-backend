const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendOnboardingEmails } = require('./emailService');
const crypto = require('crypto');
const { sendOtpEmail } = require('./emailService');
const { sendProfileRejectedEmail } = require('./emailService');
const razorpay = require("./razorpay");

// OTP storage (in production, use Redis or database)
const otpStore = new Map();

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

// Generate 4-digit OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates 4-digit OTP
}

// Send OTP for registration
router.post('/send-reg-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'This email already registered' });
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
// router.post("/", async (req, res) => {
//   const {
//     email,
//     mobile_number,
//     password,
//     first_name,
//     last_name,
//     role,
//     source,
//     location,
//     language_preference,
//     agency_uid,
//     agency_mail,
//     otp,
//   } = req.body;

//   try {
//     // ✅ Step 1: Verify OTP
//     const storedOtpData = otpStore.get(email);
//     if (!storedOtpData || !storedOtpData.verified) {
//       return res.status(400).json({ message: "Email not verified with OTP" });
//     }

//     // ✅ Step 2: Check if user already exists
//     const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
//     if (existingUser.length > 0) {
//       return res.status(400).json({ message: "This email already registered" });
//     }

//     let customer_id = null; // default null

//     // ✅ Step 3: Create Razorpay customer only for employer role
//     if (role?.toLowerCase() === "employer") {
//       const customerPayload = {
//         name: `${first_name || ""} ${last_name || ""}`.trim(),
//         email: email,
//         contact: mobile_number ? String(mobile_number) : undefined,
//       };

//       const razorpayCustomer = await razorpay.customers.create(customerPayload);
//       customer_id = razorpayCustomer.id;
//     }

//     // ✅ Step 4: Insert user into MySQL (include customer_id if any)
//     const query = `
//       INSERT INTO users (
//         email, mobile_number, password, first_name, last_name, 
//         role, source, location, language_preference, agency_uid, 
//         agency_mail, is_verified, customer_id
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const [result] = await db.query(query, [
//       email,
//       mobile_number,
//       password,
//       first_name,
//       last_name,
//       role,
//       source,
//       location,
//       language_preference,
//       agency_uid,
//       agency_mail,
//       1, // is_verified
//       customer_id,
//     ]);

//     // ✅ Step 5: Send onboarding email
//     await sendOnboardingEmails(email, first_name, last_name, role);

//     // ✅ Step 6: Clear OTP after success
//     otpStore.delete(email);

//     // ✅ Step 7: Send response
//     res.status(201).json({
//       message: "User registered successfully",
//       id: result.insertId,
//       email,
//       mobile_number,
//       first_name,
//       last_name,
//       role,
//       source,
//       location,
//       language_preference,
//       agency_uid,
//       agency_mail,
//       is_verified: true,
//       customer_id,
//     });
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).json({ error: err.error?.description || err.message });
//   }
// });

router.post("/", async (req, res) => {
  const {
    email,
    mobile_number,
    whatsapp_number,
    mobile_number_country_code,
    password,
    first_name,
    last_name,
    role,
    source,
    location,
    language_preference,
    agency_uid,
    agency_mail,
    country,
    uae_emirate,
    uae_city,
    otp,
  } = req.body;

  try {
    // ✅ Step 1: Verify OTP
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData || !storedOtpData.verified) {
      return res.status(400).json({ message: "Email not verified with OTP" });
    }

    // ✅ Step 2: Check if user already exists
    const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "This email already registered" });
    }

    // ✅ Step 4: Insert user into MySQL
    const query = `
      INSERT INTO users (
        email, mobile_number, whatsapp_number, mobile_number_country_code, password, first_name, last_name, 
        role, source, location, language_preference, agency_uid, 
        agency_mail, is_verified, country, uae_emirate, uae_city
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      email,
      mobile_number,
      whatsapp_number,
      mobile_number_country_code,
      password,
      first_name,
      last_name,
      role,
      source,
      location,
      language_preference,
      agency_uid,
      agency_mail,
      1,  // is_verified value
      country,
      uae_emirate,
      uae_city
    ]);

    // ✅ Step 5: Send onboarding email
    await sendOnboardingEmails(email, first_name, last_name, role);

    // ✅ Step 6: Clear OTP after success
    otpStore.delete(email);

    // ✅ Step 7: Send response
    res.status(201).json({
      message: "User registered successfully",
      id: result.insertId,
      email,
      mobile_number,
      whatsapp_number,
      first_name,
      last_name,
      role,
      source,
      location,
      language_preference,
      agency_uid,
      agency_mail,
      country,
      uae_emirate,
      uae_city,
      is_verified: true,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.error?.description || err.message });
  }
});


// Update user
// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    email,
    mobile_number,
    whatsapp_number,
    password,
    first_name,
    last_name,
    location,
    language_preference
  } = req.body;

  try {
    const query = `
      UPDATE users 
      SET 
        email = ?, 
        mobile_number = ?, 
        whatsapp_number = ?,
        password = ?, 
        first_name = ?, 
        last_name = ?, 
        location = ?, 
        language_preference = ?
      WHERE id = ?
    `;

    await db.query(query, [
      email,
      mobile_number,
      whatsapp_number,
      password,
      first_name,
      last_name,
      location,
      language_preference,
      id
    ]);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
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
          customer_id: user.customer_id,
          email: user.email,
          mobile_number: user.mobile_number,
          whatsapp_number: user.whatsapp_number,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          user_type: user.role,
          plan_name: user.plan_name,
          plan_startdate: user.plan_startdate,
          plan_enddate: user.plan_enddate
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
          customer_id: agencyUser.razorpay_customer_id,
          email: agencyUser.email,
          mobile_number: agencyUser.mobile_number,
          whatsapp_number: agencyUser.whatsapp_number,
          first_name: agencyUser.first_name,
          last_name: agencyUser.last_name,
          role: agencyUser.role,
          is_verified: agencyUser.is_verified,
          created_at: agencyUser.created_at,
          user_type: agencyUser.role,
          plan_name: agencyUser.plan_name,
          plan_startdate: agencyUser.plan_startdate,
          plan_enddate: agencyUser.plan_enddate
        }
      });
    }

    // If no match in both tables
    return res.status(401).json({ message: 'Invalid email or password' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/send-rejection-email', async (req, res) => {
  const { email, firstName } = req.body;

  // Validate required fields
  if (!email || !firstName) {
    return res.status(400).json({
      success: false,
      message: 'Both email and firstName are required'
    });
  }

  try {
    await sendProfileRejectedEmail(email, firstName);
    res.json({
      success: true,
      message: 'Rejection email sent successfully'
    });
  } catch (err) {
    console.error('Error sending rejection email:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to send rejection email'
    });
  }
});

// Google authentication endpoint
router.post('/google-auth', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName } = payload;

    // Check if user exists in either users or agency_user table
    const [userResults] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const [agencyResults] = await db.query('SELECT * FROM agency_user WHERE email = ?', [email]);

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
          whatsapp_number: user.whatsapp_number,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          user_type: 'general'
        }
      });
    } else if (agencyResults.length > 0) {
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
          whatsapp_number: agencyUser.whatsapp_number,
          first_name: agencyUser.first_name,
          last_name: agencyUser.last_name,
          role: agencyUser.role,
          is_verified: agencyUser.is_verified,
          created_at: agencyUser.created_at,
          user_type: 'agency'
        }
      });
    } else {
      // User doesn't exist - create new account
      const query = `
        INSERT INTO users (
          email, first_name, last_name, 
          role, is_verified, source
        ) VALUES (?, ?, ?, 'job seeker', 1, 'google')
      `;

      const [result] = await db.query(query, [
        email, firstName, lastName
      ]);

      // Send welcome email
      await sendOnboardingEmails(email, firstName, lastName, 'job seeker');

      return res.status(201).json({
        message: 'Account created and logged in successfully',
        user: {
          id: result.insertId,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'job seeker',
          is_verified: true,
          user_type: 'general'
        }
      });
    }
  } catch (err) {
    console.error('Google authentication error:', err);
    res.status(500).json({ error: err.message || 'Google authentication failed' });
  }
});

// GET API to fetch next_duedate column value from users table
router.get('/next-duedate/all', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        id,
        email,
        first_name,
        plan_name,
        next_duedate
      FROM users 
      WHERE next_duedate IS NOT NULL
      ORDER BY next_duedate ASC
    `);

    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (err) {
    console.error('Error fetching next_duedate data:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch next_duedate data'
    });
  }
});

// GET API to fetch next_duedate and send payment reminders
router.get('/payment-reminders/send', async (req, res) => {
  try {
    const { sendPaymentDueDateReminder } = require('./emailService');

    // Fetch users with next_duedate values
    const [users] = await db.query(`
      SELECT 
        id,
        email,
        first_name,
        plan_name,
        next_duedate
      FROM users 
      WHERE next_duedate IS NOT NULL
    `);

    console.log(`Found ${users.length} users with next_duedate values`);

    let paymentRemindersSent = 0;
    const today = new Date();
    const twoDaysBefore = new Date();
    twoDaysBefore.setDate(today.getDate() + 2);

    // Format date for comparison
    const twoDaysBeforeStr = twoDaysBefore.toISOString().split('T')[0];

    // Send payment due reminders for users with next_duedate exactly 2 days from today
    for (const user of users) {
      const userDueDateStr = new Date(user.next_duedate).toISOString().split('T')[0];

      if (userDueDateStr === twoDaysBeforeStr) {
        const sent = await sendPaymentDueDateReminder(
          user.email,
          user.first_name,
          user.plan_name || 'Silver', // Default plan name if null
          10.00, // Default amount
          user.next_duedate
        );

        if (sent) {
          paymentRemindersSent++;
          console.log(`Sent payment due reminder to user ${user.email}`);
        }
      }
    }

    res.json({
      success: true,
      message: 'Payment due date reminders processed successfully',
      data: {
        paymentRemindersSent,
        totalUsersChecked: users.length,
        dueDateChecked: twoDaysBeforeStr
      }
    });
  } catch (err) {
    console.error('Error in payment reminders API:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to process payment reminders'
    });
  }
});

// Create a new user by agency (without OTP verification)
router.post("/agency-user-register", async (req, res) => {
  const {
    email,
    mobile_number,
    whatsapp_number,
    mobile_number_country_code,
    password,
    first_name,
    last_name,
    role,
    source,
    location,
    language_preference,
    agency_uid,
    agency_email
  } = req.body;

  try {
    // ✅ Step 1: Check if user already exists
    const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // ✅ Step 2: Validate agency_uid if provided
    if (agency_uid) {
      const [agencyExists] = await db.query("SELECT id FROM agency_user WHERE id = ?", [agency_uid]);
      if (agencyExists.length === 0) {
        return res.status(400).json({ message: "Invalid agency user ID" });
      }
    }

    // ✅ Step 3: Insert user into MySQL without OTP verification
    const query = `
      INSERT INTO users (
        email, 
        mobile_number, 
        whatsapp_number, 
        mobile_number_country_code, 
        password, 
        first_name, 
        last_name, 
        role, 
        source, 
        location, 
        language_preference, 
        agency_uid, 
        agency_mail, 
        is_verified,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(query, [
      email,
      mobile_number || null,
      whatsapp_number || null,
      mobile_number_country_code || "+91",
      password || "Jobseeker@123", // Default password if not provided
      first_name,
      last_name || first_name, // Use first name as last name if not provided
      role || "job seeker",
      source || "agency",
      location || null,
      language_preference || "en",
      agency_uid || null,
      agency_email || null,
      1  // is_verified set to true for agency registrations
    ]);

    // ✅ Step 4: Send onboarding email (optional)
    if (email && first_name) {
      try {
        await sendOnboardingEmails(email, first_name, last_name || first_name, role || "job seeker");
      } catch (emailError) {
        console.warn("Failed to send onboarding email:", emailError);
        // Continue even if email fails
      }
    }

    // ✅ Step 5: Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully by agency",
      data: {
        id: result.insertId,
        email,
        mobile_number: mobile_number || null,
        whatsapp_number: whatsapp_number || null,
        first_name,
        last_name: last_name || first_name,
        role: role || "job seeker",
        source: source || "agency",
        agency_uid: agency_uid || null,
        agency_email: agency_email || null,
        is_verified: true
      }
    });
  } catch (err) {
    console.error("Error in agency registration:", err);
    
    // Handle duplicate email error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "This email is already registered" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Internal server error" 
    });
  }
});

module.exports = router;