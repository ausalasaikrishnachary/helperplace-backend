const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all job positions
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM job_position');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get job position by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM job_position WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Job position not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new job position
router.post('/', async (req, res) => {
  const { position, category } = req.body;

  if (!position || !category) {
    return res.status(400).json({ message: 'Position and category are required' });
  }

  try {
    const query = `
      INSERT INTO job_position (position, category)
      VALUES (?, ?)
    `;
    const [result] = await db.query(query, [position, category]);

    res.status(201).json({
      id: result.insertId,
      position,
      category
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update job position
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { position, category } = req.body;
  
  if (!position || !category) {
    return res.status(400).json({ message: 'Position and category are required' });
  }

  try {
    const query = `
      UPDATE job_position SET position = ?, category = ?
      WHERE id = ?
    `;
    await db.query(query, [position, category, id]);
    res.json({ message: 'Job position updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete job position
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM job_position WHERE id = ?', [id]);
    res.json({ message: 'Job position deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;