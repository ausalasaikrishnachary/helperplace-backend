// routes/TrainingRoutes.js
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
    fileSize: 5 * 1024 * 1024
  }
});

// Upload image endpoint
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

// Create a new training
router.post('/trainings', upload.single('profile_image'), async (req, res) => {
  const {
    training_title,
    location,
    rating,
    description,
    our_services,
    back_profile
  } = req.body;

  if (!training_title || !location) {
    return res.status(400).json({ error: 'Training title and location are required' });
  }

  try {
    let profile_image_url = null;
    if (req.file) {
      profile_image_url = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.file.filename}`;
    }

    const query = `
      INSERT INTO trainings (
        training_title,
        location,
        rating,
        description,
        our_services,
        back_profile,
        profile_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      training_title,
      location,
      rating || 0.00,
      description,
      our_services,
      back_profile,
      profile_image_url
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

// Update training
router.put('/trainings/:id', upload.single('profile_image'), async (req, res) => {
  const { id } = req.params;
  const {
    training_title,
    location,
    rating,
    description,
    our_services,
    back_profile
  } = req.body;

  try {
    const [checkResults] = await db.query('SELECT * FROM trainings WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }

    let profile_image_url = checkResults[0].profile_image;
    if (req.file) {
      profile_image_url = `${req.protocol}://${req.get('host')}/uploads/trainings/${req.file.filename}`;
      
      // Delete old image if exists
      if (checkResults[0].profile_image) {
        const oldImagePath = checkResults[0].profile_image.split('/uploads/trainings/')[1];
        if (oldImagePath) {
          fs.unlink(`uploads/trainings/${oldImagePath}`, (err) => {
            if (err) console.error('Error deleting old image:', err);
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
        back_profile = ?,
        profile_image = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      training_title,
      location,
      rating,
      description,
      our_services,
      back_profile,
      profile_image_url,
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

    // Delete associated image file if exists
    if (checkResults[0].profile_image) {
      const imagePath = checkResults[0].profile_image.split('/uploads/trainings/')[1];
      if (imagePath) {
        fs.unlink(`uploads/trainings/${imagePath}`, (err) => {
          if (err) console.error('Error deleting image:', err);
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