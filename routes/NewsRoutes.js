const express = require('express');
const router = express.Router();
const db = require('../db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check if file is an image
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

// Add this route to your existing routes
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Construct the URL for the uploaded image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all news articles
router.get('/news/all', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM news');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get news article by ID
router.get('/news/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'News article not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get news by category
router.get('/news/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM news WHERE category = ? AND status = "published" ORDER BY publish_date DESC', 
      [category]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new news article
router.post('/news', async (req, res) => {
  const {
    title,
    category,
    publish_date,
    read_time,
    excerpt,
    content,
    image_url,
    status,
    slug,
    meta_description,
    tags
  } = req.body;

  // Basic validation
  if (!title || !category || !publish_date || !excerpt || !content) {
    return res.status(400).json({ error: 'Missing required fields: title, category, publish_date, excerpt, and content are required' });
  }

  try {
    const query = `
      INSERT INTO news (
        title,
        category,
        publish_date,
        read_time,
        excerpt,
        content,
        image_url,
        status,
        slug,
        meta_description,
        tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      title,
      category,
      publish_date,
      read_time || '5 min read',
      excerpt,
      content,
      image_url,
      status || 'draft',
      slug,
      meta_description,
      tags
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'News article created successfully',
      article: {
        id: result.insertId,
        title,
        category,
        publish_date,
        read_time: read_time || '5 min read',
        excerpt,
        content,
        image_url,
        status: status || 'draft',
        slug,
        meta_description,
        tags
      }
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update news article
router.put('/news/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    publish_date,
    read_time,
    excerpt,
    content,
    image_url,
    status,
    slug,
    meta_description,
    tags
  } = req.body;

  try {
    // First check if the news article exists
    const [checkResults] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }

    const query = `
      UPDATE news SET 
        title = ?,
        category = ?,
        publish_date = ?,
        read_time = ?,
        excerpt = ?,
        content = ?,
        image_url = ?,
        status = ?,
        slug = ?,
        meta_description = ?,
        tags = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      title,
      category,
      publish_date,
      read_time,
      excerpt,
      content,
      image_url,
      status,
      slug,
      meta_description,
      tags,
      id
    ]);

    res.json({ message: 'News article updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete news article
router.delete('/news/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First check if the news article exists
    const [checkResults] = await db.query('SELECT * FROM news WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'News article not found' });
    }

    await db.query('DELETE FROM news WHERE id = ?', [id]);
    res.json({ message: 'News article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get published news only
router.get('/news/published/all', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM news WHERE status = "published" ORDER BY publish_date DESC, created_at DESC'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;