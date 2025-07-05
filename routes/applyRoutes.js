// applicationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new job application
router.post('/api/applications', async (req, res) => {
  try {
    const { userid, empuserid, jobid } = req.body;
    
    if (!userid || !empuserid || !jobid) {
      return res.status(400).json({ error: 'Missing required fields: userid, empuserid, jobid' });
    }

    // Check for duplicate application
    const [existing] = await db.query(
      'SELECT id FROM job_applications WHERE userid = ? AND jobid = ?',
      [userid, jobid]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    const [result] = await db.query(
      'INSERT INTO job_applications (userid, empuserid, jobid) VALUES (?, ?, ?)',
      [userid, empuserid, jobid]
    );

    const [application] = await db.query(
      'SELECT * FROM job_applications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(application[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications (with optional filters)
router.get('/api/applications', async (req, res) => {
  try {
    const { userid, empuserid, jobid, status } = req.query;
    let query = 'SELECT * FROM job_applications WHERE 1=1';
    const params = [];

    if (userid) {
      query += ' AND userid = ?';
      params.push(userid);
    }
    if (empuserid) {
      query += ' AND empuserid = ?';
      params.push(empuserid);
    }
    if (jobid) {
      query += ' AND jobid = ?';
      params.push(jobid);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY application_date DESC';

    const [applications] = await db.query(query, params);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single application by ID
router.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [application] = await db.query(
      'SELECT * FROM job_applications WHERE id = ?',
      [id]
    );

    if (application.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status
router.patch('/api/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [result] = await db.query(
      'UPDATE job_applications SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const [application] = await db.query(
      'SELECT * FROM job_applications WHERE id = ?',
      [id]
    );

    res.json(application[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an application
router.delete('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'DELETE FROM job_applications WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;