// In your backend routes file (e.g., routes.js or similar)
const express = require('express');
const router = express.Router();
const db = require('../db'); // Your database connection

// Track job view (when job seeker clicks on a job)
router.post('/api/track-job-view', async (req, res) => {
  try {
    const { job_id, employee_id, user_id } = req.body;
    
    // Validate required fields
    if (!job_id || !employee_id || !user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: job_id, employee_id, user_id' 
      });
    }
    
    // Insert the view record
    const [result] = await db.execute(
      'INSERT INTO job_views (job_id, employee_id, user_id) VALUES (?, ?, ?)',
      [job_id, employee_id, user_id]
    );
    
    res.status(201).json({
      message: 'Job view tracked successfully',
      viewId: result.insertId
    });
    
  } catch (error) {
    console.error('Error tracking job view:', error);
    res.status(500).json({ error: 'Failed to track job view' });
  }
});

// Get profiles visited count for dashboard
router.get('/api/profiles-visited/:employee_id', async (req, res) => {
  try {
    const { employee_id } = req.params;
    
    // Get today's count
    const [todayResult] = await db.execute(
      `SELECT COUNT(*) as today_count 
       FROM job_views 
       WHERE employee_id = ? 
       AND DATE(created_at) = CURDATE()`,
      [employee_id]
    );
    
    // Get total count
    const [totalResult] = await db.execute(
      `SELECT COUNT(*) as total_count 
       FROM job_views 
       WHERE employee_id = ?`,
      [employee_id]
    );
    
    res.json({
      today: todayResult[0].today_count,
      total: totalResult[0].total_count,
      employee_id: parseInt(employee_id)
    });
    
  } catch (error) {
    console.error('Error fetching profiles visited:', error);
    res.status(500).json({ error: 'Failed to fetch profiles visited count' });
  }
});


// In your routes file
router.get('/api/job-applications-with-details/:userid', async (req, res) => {
  try {
    const { userid } = req.params;
    
    // Query to get applications with job details
    const query = `
      SELECT 
        ja.*,
        e.job_title,
        e.emp_name,
        e.working_city,
        e.country,
        e.job_type,
        e.domestic_worker_category,
        e.application_date
      FROM job_applications ja
      LEFT JOIN employer e ON ja.jobid = e.id
      WHERE ja.userid = ?
      ORDER BY ja.application_date DESC
    `;
    
    const [applications] = await db.query(query, [userid]);
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications with details:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;