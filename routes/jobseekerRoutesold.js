const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2/promise pool
const { sendProfileVerifiedEmail } = require('./emailService');
const {
  sendSubscriptionPlanChangeEmail,
  sendPlanUpgradeEmailToJobSeeker,
  sendWhatsappNumberReminder,
  sendCustomEmail,
  // sendIncompleteProfileReminder // add if you actually have it
} = require('./emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folders exist
['images', 'videos'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// -------- Multer --------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_photo') cb(null, 'images');
    else if (file.fieldname === 'upload_video') cb(null, 'videos');
    else cb(new Error('Invalid field name'), null);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png/;
  const videoTypes = /mp4|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'profile_photo' && imageTypes.test(ext)) cb(null, true);
  else if (file.fieldname === 'upload_video' && videoTypes.test(ext)) cb(null, true);
  else cb(new Error('Only image and video files are allowed!'));
};

const upload = multer({ storage, fileFilter });

// -------- JSON field helper --------
const jsonFields = [
  'preffered_job_locations',
  'main_skills',
  'cooking_skills',
  'other_skills',
  'personality',
  'previous_country_worked',
  'previous_employer_house_duties',
  'language',
  'education',
  'experience'
];

function stringifyJsonFields(data) {
  jsonFields.forEach(field => {
    if (data[field] && typeof data[field] !== 'string') {
      data[field] = JSON.stringify(data[field]);
    }
  });
  return data;
}

// -------- Date helpers (ISO -> MySQL) --------
const pad2 = n => String(n).padStart(2, '0');

// Use UTC for consistency. If you prefer local, replace getUTC* with get*.
function toMySQLDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d)) return null;
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
}

function toMySQLDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d)) return null;
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

const DATE_FIELDS = [
  'preferred_start_date',
  'visa_issued_date',
  'visa_expiry_date',
  'plan_startdate',
  'plan_enddate',
  'current_employment_date',
  'current_finish_contract_date',
  'previous_employment_date',
  'previous_finish_contract_date',
  'prometric_issue_date',
  'prometric_expiry_date',
  'dataflow_issue_date',
  'dataflow_expiry_date',
  'nursing_license_issue_date',
  'nursing_license_expiry_date'
];

// Convert known DATE keys
function normalizeDateFields(obj) {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val == null || val === '') continue;

    if (DATE_FIELDS.includes(key)) {
      const out = toMySQLDate(val);
      if (out) obj[key] = out;
    }
  }
  return obj;
}

// Convert ANY ISO 8601 ending with Z, regardless of key (belt + suspenders)
const ISO_Z_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/i;
function scrubAnyIsoDates(obj) {
  for (const k of Object.keys(obj)) {
    let v = obj[k];
    if (Array.isArray(v)) v = v[0]; // multer/qs can wrap values in arrays
    if (typeof v === 'string' && ISO_Z_RE.test(v)) {
      obj[k] = toMySQLDateTime(v);
    }
  }
  return obj;
}

// Never let client set created_at — DB has DEFAULT CURRENT_TIMESTAMP
function stripClientTimestamps(obj) {
  delete obj.created_at;
}

// -------- Columns percentage helper --------
async function calculateColumnsPercentage(data) {
  try {
    const [columnsInfo] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'job_seekers'
        AND COLUMN_NAME NOT IN ('columns_percentage', 'id', 'created_at')
    `);

    const total = columnsInfo.length;
    let filled = 0;

    for (const c of columnsInfo) {
      const name = c.COLUMN_NAME;
      if (data[name] !== undefined && data[name] !== null && data[name] !== '') {
        filled++;
      }
    }

    return Math.round((filled / total) * 100);
  } catch (err) {
    console.error('Error calculating columns percentage:', err);
    return 0;
  }
}

// ===================== ROUTES =====================

// ✅ POST: Create or update job seeker
router.post(
  '/job-seeker',
  upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'upload_video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const data = stringifyJsonFields({ ...req.body });
      scrubAnyIsoDates(data);
      normalizeDateFields(data);
      stripClientTimestamps(data); // CRITICAL: don't send created_at

      const userId = data.user_id;
      if (!userId) return res.status(400).json({ error: 'user_id is required' });

      // Files
      if (req.files?.profile_photo) {
        data.profile_photo = `/images/${req.files.profile_photo[0].filename}`;
      }
      if (req.files?.upload_video) {
        const video = req.files.upload_video[0];
        data.upload_video = `/videos/${video.filename}`;
        data.video_file_size = video.size;
        data.video_file_type = video.mimetype;
        data.video_upload_date = toMySQLDateTime(new Date()); // a DATETIME-like string but you don't store this field in schema; if not needed, remove
      }

      const percentage = await calculateColumnsPercentage(data);
      data.columns_percentage = percentage;

      const [rows] = await db.query('SELECT user_id FROM job_seekers WHERE user_id = ?', [userId]);

      if (rows.length === 0) {
        await db.query('INSERT INTO job_seekers SET ?', [data]); // DB fills created_at itself
        return res.status(201).json({ message: 'New job seeker inserted', columns_percentage: percentage });
      } else {
        // Build update SQL without touching created_at
        const updateFields = Object.keys(data)
          .filter(key => key !== 'user_id')
          .map(key => `${key} = ?`)
          .join(', ');

        const updateValues = Object.keys(data)
          .filter(key => key !== 'user_id')
          .map(key => data[key]);

        const updateSql = `UPDATE job_seekers SET ${updateFields} WHERE user_id = ?`;
        await db.query(updateSql, [...updateValues, userId]);

        return res.status(200).json({ message: 'Job seeker updated', columns_percentage: percentage });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ GET: All job seekers
router.get('/job-seeker', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM job_seekers');

    const parsedResults = results.map(row => {
      jsonFields.forEach(field => {
        if (row[field]) {
          try { row[field] = JSON.parse(row[field]); } catch (_) {}
        }
      });
      return row;
    });

    res.status(200).json(parsedResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: Job seeker by ID
router.get('/job-seeker/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);

    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const row = results[0];
    jsonFields.forEach(field => {
      if (row[field]) { try { row[field] = JSON.parse(row[field]); } catch (_) {} }
    });

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT: Update by ID
router.put('/job-seeker/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const data = stringifyJsonFields({ ...req.body });
    scrubAnyIsoDates(data);
    normalizeDateFields(data);
    stripClientTimestamps(data); // don't let client override

    const percentage = await calculateColumnsPercentage(data);
    data.columns_percentage = percentage;

    await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);

    res.json({ message: 'Job seeker updated', columns_percentage: percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE: Delete by ID
// router.delete('/job-seeker/:id', async (req, res) => {
//   try {
//     const userId = req.params.id;
//     await db.query('DELETE FROM job_seekers WHERE user_id = ?', [userId]);
//     res.json({ message: 'Job seeker deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ✅ DELETE: Delete only profile photo
router.delete('/job-seeker/:id/photo', async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db.query('SELECT profile_photo FROM job_seekers WHERE user_id = ?', [userId]);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const profilePhotoPath = results[0].profile_photo;
    await db.query('UPDATE job_seekers SET profile_photo = NULL WHERE user_id = ?', [userId]);

    // Recalculate columns percentage
    const [userData] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);
    if (userData.length > 0) {
      const percentage = await calculateColumnsPercentage(userData[0]);
      await db.query('UPDATE job_seekers SET columns_percentage = ? WHERE user_id = ?', [percentage, userId]);
    }

    res.json({ message: 'Profile photo deleted', deletedPhotoPath: profilePhotoPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: columns percentage (optional email reminder)
router.get('/job-seeker/columns-percentage/:id', async (req, res) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ message: 'user_id is required' });

  try {
    const [rows] = await db.query(
      `SELECT columns_percentage, email_id, first_name FROM job_seekers WHERE user_id = ?`,
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'No data found for the given user_id' });

    const jobSeeker = rows[0];

    // if (jobSeeker.columns_percentage < 100) {
    //   try {
    //     await sendIncompleteProfileReminder(
    //       jobSeeker.email_id,
    //       jobSeeker.first_name,
    //       jobSeeker.columns_percentage
    //     );
    //   } catch (e) {
    //     console.error('Error sending incomplete profile reminder:', e);
    //   }
    // }

    res.json({ columns_percentage: jobSeeker.columns_percentage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ✅ PUT: Update verification/status (and Verified email)
router.put('/job-seeker/status/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const data = stringifyJsonFields({ ...req.body });
    scrubAnyIsoDates(data);
    normalizeDateFields(data);
    stripClientTimestamps(data);

    const [currentData] = await db.query(
      'SELECT verification_status, email_id, first_name FROM job_seekers WHERE user_id = ?',
      [userId]
    );

    // Merge to compute percentage correctly
    const [userData] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);
    if (userData.length > 0) {
      const mergedData = { ...userData[0], ...data };
      const percentage = await calculateColumnsPercentage(mergedData);
      data.columns_percentage = percentage;
    }

    await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);

    if (
      data.verification_status === 'Verified' &&
      currentData[0]?.verification_status !== 'Verified' &&
      currentData[0]?.email_id
    ) {
      try {
        await sendProfileVerifiedEmail(currentData[0].email_id, currentData[0].first_name);
      } catch (emailErr) {
        console.error('Error sending verification email:', emailErr);
      }
    }

    res.json({ message: 'Job seeker updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT: Update subscription (and plan-change email)
router.put('/job-seeker/subscription/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const data = stringifyJsonFields({ ...req.body });
    scrubAnyIsoDates(data);
    normalizeDateFields(data);
    stripClientTimestamps(data);

    const [currentData] = await db.query(
      'SELECT subscription_plan, email_id, first_name FROM job_seekers WHERE user_id = ?',
      [userId]
    );

    const percentage = await calculateColumnsPercentage(data);
    data.columns_percentage = percentage;

    await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);

    if (
      currentData.length > 0 &&
      data.subscription_plan &&
      data.subscription_plan !== currentData[0].subscription_plan &&
      currentData[0].email_id
    ) {
      try {
        await sendSubscriptionPlanChangeEmail(
          currentData[0].email_id,
          currentData[0].first_name,
          currentData[0].subscription_plan,
          data.subscription_plan,
          data.plan_enddate // normalized above
        );
      } catch (emailErr) {
        console.error('Error sending plan change email:', emailErr);
      }
    }

    res.json({ message: 'Job seeker updated', columns_percentage: percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: Check and send plan upgrade emails
router.get('/job-seeker/check-plan-upgrades', async (req, res) => {
  console.log('Plan upgrade check endpoint hit');

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tomorrowStr = toMySQLDate(tomorrow); // 'YYYY-MM-DD'
    console.log('Checking for plans ending on:', tomorrowStr);

    const [jobSeekers] = await db.query(
      `SELECT user_id, first_name, email_id, agency_mail, plan_enddate, subscription_plan, whatsapp_number
       FROM job_seekers
       WHERE plan_enddate = ? AND subscription_plan IS NOT NULL`,
      [tomorrowStr]
    );

    console.log(`Found ${jobSeekers.length} job seekers with plans ending tomorrow`);

    let upgradeEmailsSent = 0;
    let whatsappRemindersSent = 0;
    const errors = [];

    for (const jobSeeker of jobSeekers) {
      try {
        if (!jobSeeker.whatsapp_number) {
          await sendWhatsappNumberReminder(jobSeeker.email_id, jobSeeker.first_name);
          whatsappRemindersSent++;
        }

        let nextPlan;
        switch ((jobSeeker.subscription_plan || '').toLowerCase()) {
          case '30 days plan': nextPlan = '60 days plan'; break;
          case '60 days plan': nextPlan = '90 days plan'; break;
          default: nextPlan = null;
        }

        if (nextPlan) {
          await sendPlanUpgradeEmailToJobSeeker(
            jobSeeker.agency_mail,
            jobSeeker.first_name,
            jobSeeker.subscription_plan,
            nextPlan,
            jobSeeker.plan_enddate
          );
          upgradeEmailsSent++;
        }
      } catch (emailErr) {
        errors.push({ userId: jobSeeker.user_id, error: emailErr.message });
      }
    }

    res.json({
      success: true,
      message: 'Plan upgrade check completed',
      dateChecked: tomorrowStr,
      jobSeekersChecked: jobSeekers.length,
      upgradeEmailsSent,
      whatsappRemindersSent,
      errors: errors.length ? errors : undefined
    });
  } catch (err) {
    console.error('Error in plan upgrade check:', err);
    res.status(500).json({ success: false, error: err.message, message: 'Failed to check plan upgrades' });
  }
});

// ✅ POST: Send custom email
router.post('/send-email', async (req, res) => {
  try {
    const { to_email, subject, message } = req.body;
    if (!to_email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields: to_email, subject, or message' });
    }
    const result = await sendCustomEmail(to_email, subject, message);
    res.status(200).json({ success: true, message: 'Email sent successfully', data: result });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to send email', error: err.message });
  }
});

module.exports = router;