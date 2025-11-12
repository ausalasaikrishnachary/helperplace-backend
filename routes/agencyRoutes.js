const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
      // Now req.body should contain all the form fields
      const {
        agency_name, city, province, country, full_address,
        whatsapp_number_1, whatsapp_number_2, whatsapp_number_3, whatsapp_number_4,
        official_phone, email, website_url, owner_name, owner_nationality,
        owner_mobile, owner_email, manager_name, manager_nationality,
        manager_mobile, manager_email, password, role
      } = req.body;

      // Validate required fields
      if (!agency_name || !email || !password) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Check if email already exists in agency_user table
      const [existingAgency] = await db.query('SELECT id FROM agency_user WHERE email = ?', [email]);
      if (existingAgency.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Check if OTP was verified for this email
      const storedOtpData = otpStore.get(email);
      if (!storedOtpData || !storedOtpData.verified) {
        return res.status(400).json({ error: 'Email not verified with OTP' });
      }

      // Get file paths
      const files = req.files || {};
      const filePaths = {
        company_logo: files.company_logo?.[0] ? path.join('uploads', path.basename(files.company_logo[0].path)) : null,
        business_card: files.business_card?.[0] ? path.join('uploads', path.basename(files.business_card[0].path)) : null,
        license_copy: files.license_copy?.[0] ? path.join('uploads', path.basename(files.license_copy[0].path)) : null,
        owner_photo: files.owner_photo?.[0] ? path.join('uploads', path.basename(files.owner_photo[0].path)) : null,
        manager_photo: files.manager_photo?.[0] ? path.join('uploads', path.basename(files.manager_photo[0].path)) : null
      };

      // Insert into agency_user table with file paths
      const query = `
        INSERT INTO agency_user (
          agency_name, city, province, country, full_address,
          whatsapp_number_1, whatsapp_number_2, whatsapp_number_3, whatsapp_number_4,
          official_phone, email, website_url, owner_name, owner_nationality,
          owner_mobile, owner_email, manager_name, manager_nationality,
          manager_mobile, manager_email, password, role, is_verified,
          company_logo, business_card, license_copy, owner_photo, manager_photo,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.query(query, [
        agency_name, city, province, country, full_address,
        whatsapp_number_1, whatsapp_number_2 || '', whatsapp_number_3 || '', whatsapp_number_4 || '',
        official_phone, email, website_url || '', owner_name, owner_nationality,
        owner_mobile, owner_email, manager_name, manager_nationality,
        manager_mobile, manager_email, password, role || 'agency_admin', 1,
        filePaths.company_logo, filePaths.business_card, filePaths.license_copy, 
        filePaths.owner_photo, filePaths.manager_photo
      ]);

      // Send welcome email
      await sendOnboardingEmails(email, owner_name, '', 'agency_admin');

      // Clear OTP data after successful registration
      otpStore.delete(email);

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
      
      // Clean up uploaded files if there was an error
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          if (fileArray && fileArray[0] && fs.existsSync(fileArray[0].path)) {
            fs.unlinkSync(fileArray[0].path);
          }
        });
      }
      
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });
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