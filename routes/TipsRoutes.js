const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tips
router.get('/tips', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM tips ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tip by ID
router.get('/tips/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM tips WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Tip not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tips by section
router.get('/tips/section/:section', async (req, res) => {
  const { section } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM tips WHERE section = ? AND status = "published" ORDER BY created_at DESC', 
      [section]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tips by category
router.get('/tips/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM tips WHERE category = ? AND status = "published" ORDER BY created_at DESC', 
      [category]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new tip
router.post('/tips', async (req, res) => {
  const {
    title,
    category,
    content,
    excerpt,
    section,
    status,
    slug,
    meta_description,
    tags
  } = req.body;

  // Basic validation
  if (!title || !category || !content || !section) {
    return res.status(400).json({ error: 'Missing required fields: title, category, content, and section are required' });
  }

  try {
    const query = `
      INSERT INTO tips (
        title,
        category,
        content,
        excerpt,
        section,
        status,
        slug,
        meta_description,
        tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      title,
      category,
      content,
      excerpt,
      section,
      status || 'draft',
      slug,
      meta_description,
      tags
    ]);

    res.status(201).json({
      id: result.insertId,
      message: 'Tip created successfully',
      tip: {
        id: result.insertId,
        title,
        category,
        content,
        excerpt,
        section,
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

// Update tip
router.put('/tips/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    content,
    excerpt,
    section,
    status,
    slug,
    meta_description,
    tags
  } = req.body;

  try {
    // First check if the tip exists
    const [checkResults] = await db.query('SELECT * FROM tips WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    const query = `
      UPDATE tips SET 
        title = ?,
        category = ?,
        content = ?,
        excerpt = ?,
        section = ?,
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
      content,
      excerpt,
      section,
      status,
      slug,
      meta_description,
      tags,
      id
    ]);

    res.json({ message: 'Tip updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete tip
router.delete('/tips/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // First check if the tip exists
    const [checkResults] = await db.query('SELECT * FROM tips WHERE id = ?', [id]);
    if (checkResults.length === 0) {
      return res.status(404).json({ message: 'Tip not found' });
    }

    await db.query('DELETE FROM tips WHERE id = ?', [id]);
    res.json({ message: 'Tip deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get published tips only
router.get('/tips/published/all', async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT * FROM tips WHERE status = "published" ORDER BY created_at DESC'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;