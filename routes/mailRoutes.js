const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path as needed

// Get all mails
router.get('/message/get-all', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM mails_table');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a mail by ID
router.get('/message/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM mails_table WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Mail not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get mails by employee ID
router.get('/message/employee/:emp_id', async (req, res) => {
  const { emp_id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM mails_table WHERE emp_id = ?', [emp_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get mails by job seeker ID
router.get('/message/job-seeker/:job_seeker_id', async (req, res) => {
  const { job_seeker_id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM mails_table WHERE job_seeker_id = ?', [job_seeker_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by emp_id and job_seeker_id
router.get('/message/:emp_id/:job_seeker_id/get', async (req, res) => {
  const { emp_id, job_seeker_id } = req.params;
  try {
    const [results] = await db.query(
      'SELECT * FROM mails_table WHERE emp_id = ? AND job_seeker_id = ?',
      [emp_id, job_seeker_id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create a new mail
router.post('/message', async (req, res) => {
  const { emp_id, job_seeker_id, message } = req.body;
  try {
    const query = `
      INSERT INTO mails_table (emp_id, job_seeker_id, message)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [emp_id, job_seeker_id, message]);

    res.status(201).json({
      message: 'Mail created',
      mailId: result.insertId,
      emp_id,
      job_seeker_id,
      message
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing mail
router.put('message/:id', async (req, res) => {
  const { id } = req.params;
  const { emp_id, job_seeker_id, message } = req.body;
  try {
    const query = `
      UPDATE mails_table 
      SET emp_id = ?, job_seeker_id = ?, message = ?
      WHERE id = ?
    `;
    await db.query(query, [emp_id, job_seeker_id, message, id]);

    res.json({ message: 'Mail updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a mail
router.delete('message/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM mails_table WHERE id = ?', [id]);
    res.json({ message: 'Mail deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;