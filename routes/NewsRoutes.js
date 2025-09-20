const express = require('express');
const router = express.Router();
const db = require('../db');

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