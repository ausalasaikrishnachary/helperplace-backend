// applicationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new job application
// Create a new job application

// Create a new job application
router.post('/api/applications', async (req, res) => {
  try {
    const { userid, empuserid, jobid } = req.body;
    
    console.log('📋 Application received:', { userid, empuserid, jobid });

    if (!userid || !empuserid || !jobid) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: userid, empuserid, jobid' });
    }

    // Check for duplicate application
    const [existing] = await db.query(
      'SELECT id FROM job_applications WHERE userid = ? AND jobid = ?',
      [userid, jobid]
    );
    
    if (existing.length > 0) {
      console.log('❌ Duplicate application found');
      return res.status(409).json({ error: 'You have already applied to this job' });
    }

    // Get job details and employer subscription info
    const [jobDetails] = await db.query(`
      SELECT e.*, u.email as employer_email, u.first_name as employer_first_name,
             u.plan_name as employer_plan_name
      FROM employer e 
      LEFT JOIN users u ON e.user_id = u.id 
      WHERE e.id = ?
    `, [jobid]);

    if (jobDetails.length === 0) {
      console.log('❌ Job not found with ID:', jobid);
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobDetails[0];
    const hasGoldSubscription = job.employer_plan_name?.toLowerCase().includes('gold');
    
    console.log('🏢 Employer details:', {
      email: job.employer_email,
      name: job.employer_first_name,
      plan: job.employer_plan_name,
      hasGoldSubscription: hasGoldSubscription
    });

    // Get job seeker details
    const [jobSeekerDetails] = await db.query(`
      SELECT js.*, u.email as job_seeker_email, u.first_name as job_seeker_first_name,
             u.last_name as job_seeker_last_name
      FROM job_seekers js
      LEFT JOIN users u ON js.user_id = u.id 
      WHERE js.user_id = ?
    `, [userid]);

    const jobSeeker = jobSeekerDetails[0] || {};
    
    console.log('👤 Job seeker details:', {
      email: jobSeeker.job_seeker_email,
      name: `${jobSeeker.job_seeker_first_name} ${jobSeeker.job_seeker_last_name}`,
      phone: jobSeeker.whatsapp_number || jobSeeker.phone_number
    });

    // Insert application
    const [result] = await db.query(
      'INSERT INTO job_applications (userid, empuserid, jobid) VALUES (?, ?, ?)',
      [userid, empuserid, jobid]
    );

    console.log('💾 Application saved to database with ID:', result.insertId);

    // Send emails
    console.log('📤 Starting email sending process...');
    const emailResults = await sendApplicationEmails(job, jobSeeker, hasGoldSubscription);
    console.log('📨 Email sending completed:', emailResults);

    const [application] = await db.query(
      'SELECT * FROM job_applications WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      ...application[0],
      emailStatus: emailResults
    });
    
  } catch (err) {
    console.error('❌ Error in application:', err);
    res.status(500).json({ error: err.message });
  }
});

// Enhanced email sending function with logging
async function sendApplicationEmails(job, jobSeeker, hasGoldSubscription) {
  const results = {
    jobSeekerEmail: { sent: false, error: null },
    employerEmail: { sent: false, error: null }
  };

  try {
    const { sendCustomEmail } = require('./emailService');

    // Email to Job Seeker (Employee)
    console.log('👤 Sending email to job seeker:', jobSeeker.job_seeker_email);
    const jobSeekerEmailContent = `
      <p>Hi ${jobSeeker.job_seeker_first_name || 'Job Seeker'},</p>
      <p>Thank you for applying to the position: <strong>${job.job_title || 'N/A'}</strong></p>
      <p>Your application has been successfully submitted to the employer.</p>
      ${!hasGoldSubscription ? `
        <p><strong>Upgrade to Gold Subscription:</strong> Get access to employer contact details and faster responses by upgrading your profile!</p>
      ` : ''}
      <p>We wish you the best in your job search!</p>
      <p>Best regards,<br/>Gulf Helper Team</p>
    `;

    try {
      await sendCustomEmail(
        jobSeeker.job_seeker_email,
        `Application Submitted - ${job.job_title || 'Job Position'}`,
        jobSeekerEmailContent
      );
      results.jobSeekerEmail.sent = true;
      console.log('✅ Job seeker email sent successfully');
    } catch (error) {
      results.jobSeekerEmail.error = error.message;
      console.error('❌ Failed to send job seeker email:', error);
    }

    // Email to Employer
    console.log('🏢 Sending email to employer:', job.employer_email);
    let employerEmailContent = `
      <p>Hi ${job.employer_first_name || 'Employer'},</p>
      <p>You have received a new application for your job posting: <strong>${job.job_title || 'N/A'}</strong></p>
      <p><strong>Applicant Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${jobSeeker.job_seeker_first_name || 'N/A'} ${jobSeeker.job_seeker_last_name || ''}</li>
        <li><strong>Position Applied:</strong> ${job.domestic_worker_category || 'N/A'}</li>
      </ul>
    `;

    // Include contact details if employer has Gold subscription
    if (hasGoldSubscription) {
      employerEmailContent += `
        <p><strong>Contact Details (Gold Subscription Benefit):</strong></p>
        <ul>
          <li><strong>Email:</strong> ${jobSeeker.job_seeker_email || 'N/A'}</li>
          <li><strong>Phone:</strong> ${jobSeeker.whatsapp_number || jobSeeker.phone_number || 'N/A'}</li>
          ${jobSeeker.nationality ? `<li><strong>Nationality:</strong> ${jobSeeker.nationality}</li>` : ''}
          ${jobSeeker.total_work_experience ? `<li><strong>Experience:</strong> ${jobSeeker.total_work_experience}</li>` : ''}
        </ul>
        <p>You can contact the candidate directly using the above details.</p>
      `;
    } else {
      employerEmailContent += `
        <p><strong>Upgrade to Gold Subscription to get:</strong></p>
        <ul>
          <li>Direct access to candidate contact details</li>
          <li>Faster communication with applicants</li>
          <li>Priority listing in search results</li>
          <li>Enhanced visibility for your job posts</li>
        </ul>
        <p>Upgrade now for a better hiring experience. To do so, please visit our website at https://gulfworker.net/login</p>
      `;
    }

    employerEmailContent += `
      <p>Best regards,<br/>Gulf Helper Team</p>
    `;

    try {
      await sendCustomEmail(
        job.employer_email,
        `New Application Received - ${job.job_title || 'Job Position'}`,
        employerEmailContent
      );
      results.employerEmail.sent = true;
      console.log('✅ Employer email sent successfully');
    } catch (error) {
      results.employerEmail.error = error.message;
      console.error('❌ Failed to send employer email:', error);
    }

    return results;
  } catch (error) {
    console.error('❌ Error in sendApplicationEmails:', error);
    return results;
  }
}


// Add this route to your backend (in your routes file)

// Send job status email
// Add this route to your backend routes
router.post('/api/send-job-status-email', async (req, res) => {
    try {
        const { to, firstName, jobTitle, jobId, status } = req.body;
        
        console.log('📧 Sending job status email:', { to, firstName, jobTitle, status });

        if (!to || !firstName || !jobTitle || !status) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, firstName, jobTitle, status' 
            });
        }

        const { sendJobApprovedEmail, sendJobRejectedEmail} = require('./emailService');

        let emailResult;
        
        if (status === 'Approved') {
            emailResult = await sendJobApprovedEmail(to, firstName, jobTitle, jobId);
        } else if (status === 'Rejected') {
            emailResult = await sendJobRejectedEmail(to, firstName, jobTitle, jobId);
        } else {
            return res.status(400).json({ error: 'Invalid status provided' });
        }

        console.log('✅ Job status email sent successfully');
        res.status(200).json({ 
            success: true, 
            message: `Job ${status.toLowerCase()} email sent successfully`,
            emailResult 
        });

    } catch (error) {
        console.error('❌ Error sending job status email:', error);
        res.status(500).json({ 
            error: 'Failed to send job status email',
            details: error.message 
        });
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