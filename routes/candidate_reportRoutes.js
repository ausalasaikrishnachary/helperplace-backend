const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path as needed

// Get all candidate reports
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM candidate_report');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a candidate report by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM candidate_report WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new candidate report
router.post('/', async (req, res) => {
  const { emp_id, first_name, candidate_id, candidate_name, email, reason, description } = req.body;
  try {
    const query = `
      INSERT INTO candidate_report (emp_id, first_name, candidate_id, candidate_name, email, reason, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [emp_id, first_name, candidate_id, candidate_name, email, reason, description]);

    res.status(201).json({
      message: 'Candidate report created',
      reportId: result.insertId,
      emp_id,
      first_name,
      candidate_id,
      candidate_name,
      email,
      reason,
      description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing candidate report
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { emp_id, first_name, candidate_id, candidate_name, email, reason, description } = req.body;
  try {
    const query = `
      UPDATE candidate_report 
      SET emp_id = ?, first_name = ?, candidate_id = ?, candidate_name = ?, email = ?, reason = ?, description = ?
      WHERE id = ?
    `;
    await db.query(query, [emp_id, first_name, candidate_id, candidate_name, email, reason, description, id]);

    res.json({ message: 'Candidate report updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a candidate report
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM candidate_report WHERE id = ?', [id]);
    res.json({ message: 'Candidate report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
