const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const razorpay = require("./razorpay");
const otpStore = new Map();
const { sendAgencyVerificationEmail } = require('./emailService'); // Adjust path as needed

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).fields([
  { name: 'company_logo', maxCount: 1 },
  { name: 'business_card', maxCount: 1 },
  { name: 'license_copy', maxCount: 1 },
  { name: 'owner_photo', maxCount: 1 },
  { name: 'manager_photo', maxCount: 1 }
]);


// Generate OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP endpoint
router.post('/send-reg-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = generateOTP();

    // Store OTP with timestamp and verified flag
    otpStore.set(email, {
      otp,
      createdAt: Date.now(),
      verified: false
    });

    // TODO: Implement actual email sending here
    console.log(`OTP for ${email}: ${otp}`); // Remove this in production

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    // Check if OTP is expired (10 minutes)
    if (Date.now() - storedData.createdAt > 10 * 60 * 1000) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark OTP as verified
    storedData.verified = true;
    otpStore.set(email, storedData);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/check-otp-status', (req, res) => {
  const { email } = req.body;
  const storedData = otpStore.get(email);

  res.json({
    email,
    storedData,
    otpStoreSize: otpStore.size,
    allEntries: Array.from(otpStore.entries())
  });
});

// POST - Create new agency with file uploads
// router.post('/agency', (req, res, next) => {
//   upload(req, res, function (err) {
//     if (err) {
//       console.error('Upload error:', err);
//       return res.status(400).json({ 
//         success: false,
//         error: 'File upload failed',
//         details: err.message 
//       });
//     }

//     try {
//       // Safely get file paths and convert to relative paths
//       const files = req.files || {};
//       const filePaths = {
//         company_logo: files.company_logo?.[0] ? path.join('uploads', path.basename(files.company_logo[0].path)) : null,
//         business_card: files.business_card?.[0] ? path.join('uploads', path.basename(files.business_card[0].path)) : null,
//         license_copy: files.license_copy?.[0] ? path.join('uploads', path.basename(files.license_copy[0].path)) : null,
//         owner_photo: files.owner_photo?.[0] ? path.join('uploads', path.basename(files.owner_photo[0].path)) : null,
//         manager_photo: files.manager_photo?.[0] ? path.join('uploads', path.basename(files.manager_photo[0].path)) : null
//       };

//       const agencyData = {
//         ...req.body,
//         ...filePaths,
//         created_at: new Date(),
//         updated_at: new Date()
//       };

//       const query = 'INSERT INTO agency_user SET ?';
//       db.query(query, agencyData, (err, result) => {
//         if (err) {
//           console.error('Database error:', err);
//           // Clean up uploaded files if DB operation fails
//           Object.values(files).forEach(fileArray => {
//             if (fileArray && fileArray[0] && fs.existsSync(fileArray[0].path)) {
//               fs.unlinkSync(fileArray[0].path);
//             }
//           });
//           return res.status(500).json({ 
//             success: false,
//             error: 'Database operation failed',
//             details: err.message 
//           });
//         }
//         res.status(201).json({ 
//           success: true,
//           message: 'Agency created successfully',
//           id: result.insertId 
//         });
//       });
//     } catch (error) {
//       console.error('Server error:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error',
//         details: error.message
//       });
//     }
//   });
// });


// Agency registration endpoint
// Agency registration endpoint with file uploads
// router.post('/agency', (req, res) => {
//   upload(req, res, async function (err) {

//     if (err) {
//       console.error('Upload error:', err);
//       return res.status(400).json({
//         success: false,
//         error: 'File upload failed',
//         details: err.message
//       });
//     }

//     try {

//       const {
//         agency_name, city, province, country, full_address,
//         whatsapp_number_1, whatsapp_number_2, whatsapp_number_3, whatsapp_number_4,
//         official_phone, email, website_url, owner_name, owner_nationality,
//         owner_mobile, owner_email, manager_name, manager_nationality,
//         manager_mobile, manager_email, password, role
//       } = req.body;

//       if (!agency_name || !email || !password) {
//         return res.status(400).json({ error: 'Required fields are missing' });
//       }

//       // Check if email exists
//       const [existingAgency] = await db.query(
//         'SELECT id FROM agency_user WHERE email = ?',
//         [email]
//       );

//       if (existingAgency.length > 0) {
//         return res.status(400).json({ error: 'This email already registered' });
//       }

//       // ---------- STEP 1: CREATE RAZORPAY CUSTOMER ----------
//       let razorpayCustomer;

//       try {
//         razorpayCustomer = await razorpay.customers.create({
//           name: agency_name,
//           email: email,
//           contact: official_phone || owner_mobile || "",
//           fail_existing: false
//         });
//       } catch (err) {
//         console.error("Razorpay Customer Error:", err);
//         return res.status(400).json({ error: "Failed to create Razorpay customer" });
//       }

//       const razorpay_customer_id = razorpayCustomer.id; // Eg: cust_ABC123

//       // ---------- FILE PATHS ----------
//       const files = req.files || {};
//       const filePaths = {
//         company_logo: files.company_logo?.[0] ? path.join('uploads', path.basename(files.company_logo[0].path)) : null,
//         business_card: files.business_card?.[0] ? path.join('uploads', path.basename(files.business_card[0].path)) : null,
//         license_copy: files.license_copy?.[0] ? path.join('uploads', path.basename(files.license_copy[0].path)) : null,
//         owner_photo: files.owner_photo?.[0] ? path.join('uploads', path.basename(files.owner_photo[0].path)) : null,
//         manager_photo: files.manager_photo?.[0] ? path.join('uploads', path.basename(files.manager_photo[0].path)) : null
//       };

//       // ---------- STEP 2: INSERT IN DB WITH customer_id ----------
//       const query = `
//         INSERT INTO agency_user (
//           agency_name, city, province, country, full_address,
//           whatsapp_number_1, whatsapp_number_2, whatsapp_number_3, whatsapp_number_4,
//           official_phone, email, website_url, owner_name, owner_nationality,
//           owner_mobile, owner_email, manager_name, manager_nationality,
//           manager_mobile, manager_email, password, role, is_verified,
//           company_logo, business_card, license_copy, owner_photo, manager_photo,
//           razorpay_customer_id, created_at, updated_at
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//       `;

//       const [result] = await db.query(query, [
//         agency_name, city, province, country, full_address,
//         whatsapp_number_1, whatsapp_number_2 || '', whatsapp_number_3 || '', whatsapp_number_4 || '',
//         official_phone, email, website_url || '', owner_name, owner_nationality,
//         owner_mobile, owner_email, manager_name, manager_nationality,
//         manager_mobile, manager_email, password, role || 'agency_admin', 1,
//         filePaths.company_logo, filePaths.business_card, filePaths.license_copy,
//         filePaths.owner_photo, filePaths.manager_photo,
//         razorpay_customer_id // ⭐ STORE RAZORPAY CUSTOMER ID
//       ]);

//       // otpStore.delete(email);

//       res.status(201).json({
//         id: result.insertId,
//         message: 'Agency registered successfully',
//         razorpay_customer_id,
//         agency: {
//           id: result.insertId,
//           agency_name,
//           email,
//           role: 'agency_admin',
//           is_verified: true
//         }
//       });

//     } catch (err) {
//       console.error('Error registering agency:', err);

//       if (req.files) {
//         Object.values(req.files).forEach(fileArray => {
//           if (fileArray && fileArray[0] && fs.existsSync(fileArray[0].path)) {
//             fs.unlinkSync(fileArray[0].path);
//           }
//         });
//       }

//       res.status(500).json({ error: err.message || 'Registration failed' });
//     }
//   });
// });

// Agency registration endpoint with file uploads and country codes
router.post('/agency', (req, res) => {
  upload(req, res, async function (err) {

    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: 'File upload failed',
        details: err.message
      });
    }

    try {

      const {
        agency_name, city, province, country, full_address,
        whatsapp_number_1, whatsapp_number_1_country_code,
        whatsapp_number_2, whatsapp_number_2_country_code,
        whatsapp_number_3, whatsapp_number_3_country_code,
        whatsapp_number_4, whatsapp_number_4_country_code,
        official_phone, official_phone_country_code,
        email, website_url, owner_name, owner_nationality,
        owner_mobile, owner_mobile_country_code, owner_email,
        manager_name, manager_nationality, manager_mobile,
        manager_mobile_country_code, manager_email, password, role
      } = req.body;

      if (!agency_name || !email || !password) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Check if email exists
      const [existingAgency] = await db.query(
        'SELECT id FROM agency_user WHERE email = ?',
        [email]
      );

      if (existingAgency.length > 0) {
        return res.status(400).json({ error: 'This email already registered' });
      }

      // ---------- FILE PATHS ----------
      const files = req.files || {};
      const filePaths = {
        company_logo: files.company_logo?.[0] ? path.join('uploads', path.basename(files.company_logo[0].path)) : null,
        business_card: files.business_card?.[0] ? path.join('uploads', path.basename(files.business_card[0].path)) : null,
        license_copy: files.license_copy?.[0] ? path.join('uploads', path.basename(files.license_copy[0].path)) : null,
        owner_photo: files.owner_photo?.[0] ? path.join('uploads', path.basename(files.owner_photo[0].path)) : null,
        manager_photo: files.manager_photo?.[0] ? path.join('uploads', path.basename(files.manager_photo[0].path)) : null
      };

      // ---------- STEP 2: INSERT IN DB WITH COUNTRY CODES ----------
      const query = `
        INSERT INTO agency_user (
          agency_name, city, province, country, full_address,
          whatsapp_number_1, whatsapp_number_1_country_code,
          whatsapp_number_2, whatsapp_number_2_country_code,
          whatsapp_number_3, whatsapp_number_3_country_code,
          whatsapp_number_4, whatsapp_number_4_country_code,
          official_phone, official_phone_country_code,
          email, website_url, owner_name, owner_nationality,
          owner_mobile, owner_mobile_country_code, owner_email,
          manager_name, manager_nationality, manager_mobile,
          manager_mobile_country_code, manager_email, password, role, is_verified,
          company_logo, business_card, license_copy, owner_photo, manager_photo,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result] = await db.query(query, [
        agency_name,
        city,
        province,
        country,
        full_address,
        whatsapp_number_1,
        whatsapp_number_1_country_code, // No default - use what user selected
        whatsapp_number_2 || '',
        whatsapp_number_2_country_code, // No default - use what user selected
        whatsapp_number_3 || '',
        whatsapp_number_3_country_code, // No default - use what user selected
        whatsapp_number_4 || '',
        whatsapp_number_4_country_code, // No default - use what user selected
        official_phone,
        official_phone_country_code, // No default - use what user selected
        email,
        website_url || '',
        owner_name,
        owner_nationality,
        owner_mobile,
        owner_mobile_country_code, // No default - use what user selected
        owner_email,
        manager_name,
        manager_nationality,
        manager_mobile,
        manager_mobile_country_code, // No default - use what user selected
        manager_email,
        password,
        role || 'agency_admin',
        1, // is_verified
        filePaths.company_logo,
        filePaths.business_card,
        filePaths.license_copy,
        filePaths.owner_photo,
        filePaths.manager_photo
      ]);

      res.status(201).json({
        id: result.insertId,
        message: 'Agency registered successfully',
        agency: {
          id: result.insertId,
          agency_name,
          email,
          role: 'agency_admin',
          is_verified: true
        }
      });

    } catch (err) {
      console.error('Error registering agency:', err);

      // Clean up uploaded files if registration fails
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          if (fileArray && fileArray[0] && fs.existsSync(fileArray[0].path)) {
            fs.unlinkSync(fileArray[0].path);
          }
        });
      }

      res.status(500).json({
        error: err.message || 'Registration failed',
        details: 'Please try again later.'
      });
    }
  });
});

// New route for sending agency verification email
router.post('/send-agency-verification-email', async (req, res) => {
  try {
    const { to, firstName, agencyName } = req.body;

    if (!to || !firstName || !agencyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendAgencyVerificationEmail(to, firstName, agencyName);

    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Error sending agency verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});


// GET - All agencies
router.get('/agency', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM agency_user');
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Single agency by ID
router.get('/agency/:id', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM agency_user WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update agency by ID
router.put('/agency/:id', async (req, res) => {
  try {
    const fields = req.body;
    const keys = Object.keys(fields);

    if (keys.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    // Build dynamic SET clause
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => fields[key]);
    values.push(req.params.id); // Add id for the WHERE clause

    const sql = `UPDATE agency_user SET ${setClause} WHERE id = ?`;

    const [result] = await db.execute(sql, values);

    res.status(200).json({ message: 'Agency updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE - Delete agency by ID
router.delete('/agency/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM agency_user WHERE id = ?', [req.params.id]);
    res.status(200).json({ message: 'Agency deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/candidatesubscription/agency_user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      candidate_subscription_plan_id,
      candidate_subscription,
      candidate_plan_name,
      candidate_plan_days,
      candidate_plan_startdate,
      candidate_plan_enddate,
      candidate_payment_status,
      candidate_payment_amount,
      candidate_posting,
      candidate_contact
    } = req.body;

    // ✅ Update query for candidate-specific fields
    const [result] = await db.query(
      `UPDATE agency_user 
       SET 
         candidate_subscription_plan_id = ?, 
         candidate_subscription = ?, 
         candidate_plan_name = ?, 
         candidate_plan_days = ?, 
         candidate_plan_startdate = ?, 
         candidate_plan_enddate = ?, 
         candidate_payment_status = ?, 
         candidate_payment_amount = ?, 
         candidate_posting = ?, 
         candidate_contact = ?
       WHERE id = ?`,
      [
        candidate_subscription_plan_id,
        candidate_subscription,
        candidate_plan_name,
        candidate_plan_days,
        candidate_plan_startdate,
        candidate_plan_enddate,
        candidate_payment_status,
        candidate_payment_amount,
        candidate_posting,
        candidate_contact,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Candidate subscription details updated successfully" });
  } catch (error) {
    console.error("Error updating candidate subscription:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



module.exports = router;