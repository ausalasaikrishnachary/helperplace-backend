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
router.post('/agency', (req, res, next) => {
  upload(req, res, function (err) {
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
        role,
        password,
        agency_name,
        city,
        province,
        country,
        full_address,
        whatsapp_numbers,
        official_phone,
        email,
        website_url,
        owner_name,
        owner_nationality,
        owner_mobile,
        owner_email,
        manager_name,
        manager_nationality,
        manager_mobile,
        manager_email
      } = req.body;

      // Safely get file paths
      const files = req.files || {};
      const filePaths = {
        company_logo: files.company_logo?.[0]?.path || null,
        business_card: files.business_card?.[0]?.path || null,
        license_copy: files.license_copy?.[0]?.path || null,
        owner_photo: files.owner_photo?.[0]?.path || null,
        manager_photo: files.manager_photo?.[0]?.path || null
      };

      const agencyData = {
        ...req.body,
        ...filePaths,
        created_at: new Date(),
        updated_at: new Date()
      };

      const query = 'INSERT INTO agency_user SET ?';
      db.query(query, agencyData, (err, result) => {
        if (err) {
          console.error('Database error:', err);
          // Clean up uploaded files if DB operation fails
          Object.values(filePaths).forEach(filePath => {
            if (filePath && fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
          return res.status(500).json({ 
            success: false,
            error: 'Database operation failed',
            details: err.message 
          });
        }
        res.status(201).json({ 
          success: true,
          message: 'Agency created successfully',
          id: result.insertId 
        });
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  });
});


// GET - All agencies
router.get('/agency', (req, res) => {
  db.query('SELECT * FROM agency_user', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

// GET - Single agency by ID
router.get('/agency/:id', (req, res) => {
  db.query('SELECT * FROM agency_user WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Agency not found' });
    res.status(200).json(results[0]);
  });
});

// PUT - Update agency by ID
router.put('/agency/:id', (req, res) => {
  const data = req.body;
  db.query('UPDATE agency_user SET ? WHERE id = ?', [data, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Agency updated' });
  });
});

// DELETE - Delete agency by ID
router.delete('/agency/:id', (req, res) => {
  db.query('DELETE FROM agency_user WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Agency deleted' });
  });
});

module.exports = router;
