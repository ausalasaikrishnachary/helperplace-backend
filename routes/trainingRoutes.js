const express = require('express');
const router = express.Router();
const db = require('../db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/trainings/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'training-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload image endpoint (optional - can be removed if not used elsewhere)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all trainings
router.get('/trainings/all', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM trainings ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get training by ID
router.get('/trainings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM trainings WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Training not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new training - handle multiple image uploads
router.post('/trainings', upload.fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'back_profile', maxCount: 1 }
]), async (req, res) => {
  const {
    training_title,
    location,
    rating,
    description, 
    our_services
  } = req.body;

  if (!training_title || !location) {
    return res.status(400).json({ error: 'Training title and location are required' });
  }

  try {
    let profile_image_url = null;
    let back_profile_url = null;
    
    // Process profile image
    if (req.files && req.files['profile_image']) {
      profile_image_url = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.files['profile_image'][0].filename}`;
    }
    
    // Process back profile image
    if (req.files && req.files['back_profile']) {
      back_profile_url = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.files['back_profile'][0].filename}`;
    }

    const query = `
      INSERT INTO trainings (
        training_title,
        location,
        rating,
        description,
        our_services,
        profile_image,
        back_profile
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      training_title,
      location,
      rating || 0.00,
      description,
      our_services,
      profile_image_url,
      back_profile_url
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Training created successfully'
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update training - handle multiple image uploads
router.put('/trainings/:id', upload.fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'back_profile', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const {
    training_title,
    location,
    rating,
    description,
    our_services
  } = req.body;

  try {
    const [checkResults] = await db.query('SELECT * FROM trainings WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }

    let profile_image_url = checkResults[0].profile_image;
    let back_profile_url = checkResults[0].back_profile;
    
    // Process profile image update
    if (req.files && req.files['profile_image']) {
      profile_image_url = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.files['profile_image'][0].filename}`;
      
      // Delete old profile image if exists
      if (checkResults[0].profile_image) {
        const oldImagePath = checkResults[0].profile_image.split('/uploads/trainings/')[1];
        if (oldImagePath) {
          fs.unlink(`uploads/trainings/${oldImagePath}`, (err) => {
            if (err) console.error('Error deleting old profile image:', err);
          });
        }
      }
    }
    
    // Process back profile image update
    if (req.files && req.files['back_profile']) {
      back_profile_url = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.files['back_profile'][0].filename}`;
      
      // Delete old back profile image if exists
      if (checkResults[0].back_profile) {
        const oldImagePath = checkResults[0].back_profile.split('/uploads/trainings/')[1];
        if (oldImagePath) {
          fs.unlink(`uploads/trainings/${oldImagePath}`, (err) => {
            if (err) console.error('Error deleting old back profile image:', err);
          });
        }
      }
    }

    const query = `
      UPDATE trainings SET 
        training_title = ?,
        location = ?,
        rating = ?,
        description = ?,
        our_services = ?,
        profile_image = ?,
        back_profile = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      training_title,
      location,
      rating,
      description,
      our_services,
      profile_image_url,
      back_profile_url,
      id
    ]);

    res.json({ message: 'Training updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete training
router.delete('/trainings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [checkResults] = await db.query('SELECT * FROM trainings WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }

    // Delete associated profile image file if exists
    if (checkResults[0].profile_image) {
      const imagePath = checkResults[0].profile_image.split('/uploads/trainings/')[1];
      if (imagePath) {
        fs.unlink(`uploads/trainings/${imagePath}`, (err) => {
          if (err) console.error('Error deleting profile image:', err);
        });
      }
    }
    
    // Delete associated back profile image file if exists
    if (checkResults[0].back_profile) {
      const imagePath = checkResults[0].back_profile.split('/uploads/trainings/')[1];
      if (imagePath) {
        fs.unlink(`uploads/trainings/${imagePath}`, (err) => {
          if (err) console.error('Error deleting back profile image:', err);
        });
      }
    }

    await db.query('DELETE FROM trainings WHERE id = ?', [id]);
    res.json({ message: 'Training deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trainings by rating (example of filtered query)
router.get('/trainings/rating/:minRating', async (req, res) => {
  const { minRating } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM trainings WHERE rating >= ? ORDER BY rating DESC', 
      [minRating]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;