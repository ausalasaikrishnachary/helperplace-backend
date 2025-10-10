const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all job positions
router.get('/jobposition', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM job_position');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get job position by ID
// Create a new job position
router.post('/jobposition', async (req, res) => {
  const { position, category, description } = req.body;

  if (!position || !category) {
    return res.status(400).json({ message: 'Position and category are required' });
  }

  try {
    const query = `
      INSERT INTO job_position (position, category, description)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [position, category, description || null]);

    res.status(201).json({
      id: result.insertId,
      position,
      category,
      description: description || null
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update job position
router.put('/jobposition/:id', async (req, res) => {
  const { id } = req.params;
  const { position, category, description } = req.body;
  
  if (!position || !category) {
    return res.status(400).json({ message: 'Position and category are required' });
  }

  try {
    const query = `
      UPDATE job_position SET position = ?, category = ?, description = ?
      WHERE id = ?
    `;
    await db.query(query, [position, category, description || null, id]);
    res.json({ message: 'Job position updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update job position
router.put('/jobposition/:id', async (req, res) => {
  const { id } = req.params;
  const { position, category } = req.body;
  
  if (!position || !category) {
    return res.status(400).json({ message: 'Position and category are required' });
  }

  try {
    const query = `
      UPDATE job_position SET position = ?, category = ?, description = ?
      WHERE id = ?
    `;
    await db.query(query, [position, category, id]);
    res.json({ message: 'Job position updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete job position
router.delete('/jobposition/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM job_position WHERE id = ?', [id]);
    res.json({ message: 'Job position deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get job position by ID
router.get('/jobposition/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM job_position WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Job position not found' });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;