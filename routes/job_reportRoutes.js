const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path as needed

// Get all job reports
router.get('/jobreport/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM job_reports');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a job report by ID
router.get('/jobreport/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM job_reports WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new job report
router.post('/jobreport', async (req, res) => {
  const { user_id, first_name, job_id, emp_id, email, reason, description } = req.body;
  try {
    const query = `
      INSERT INTO job_reports (user_id, first_name, job_id, emp_id, email, reason, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [user_id, first_name, job_id, emp_id, email, reason, description]);

    res.status(201).json({
      message: 'Report created',
      reportId: result.insertId,
      user_id,
      first_name,
      job_id,
      emp_id,
      email,
      reason,
      description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing report
router.put('/obreport/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, first_name, job_id, emp_id, email, reason, description } = req.body;
  try {
    const query = `
      UPDATE job_reports 
      SET user_id = ?, first_name = ?, job_id = ?, emp_id = ?, email = ?, reason = ?, description = ?
      WHERE id = ?
    `;
    await db.query(query, [user_id, first_name, job_id, emp_id, email, reason, description, id]);

    res.json({ message: 'Report updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a report
router.delete('/jobreport/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM job_reports WHERE id = ?', [id]);
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
