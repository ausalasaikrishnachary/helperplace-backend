const express = require('express');
const router = express.Router();
const db = require('../db'); // mysql2/promise pool
const { sendProfileVerifiedEmail } = require('./emailService');
const {
  sendSubscriptionPlanChangeEmail,
  sendPlanUpgradeEmailToJobSeeker,
  sendWhatsappNumberReminder,
  sendCustomEmail,
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

// ✅ POST: Create or update job seeker and doctor profile
// ✅ POST: Create or update job seeker and doctor profile
router.post(
  '/job-seeker',
  upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'upload_video', maxCount: 1 }
  ]),
  async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Stringify JSON fields for both job_seekers and doctor_profile
      const data = stringifyJsonFields({ ...req.body });
      scrubAnyIsoDates(data);
      normalizeDateFields(data);
      stripClientTimestamps(data);

      const userId = data.user_id;
      if (!userId) {
        await connection.rollback();
        return res.status(400).json({ error: 'user_id is required' });
      }

      // Separate data for job_seekers and doctor_profile tables
      const jobSeekerData = {};
      const doctorProfileData = {};

      // Split the data based on field prefixes
      Object.keys(data).forEach(key => {
        if (key.startsWith('dtr_')) {
          doctorProfileData[key] = data[key];
        } else {
          jobSeekerData[key] = data[key];
        }
      });

      // Files handling (for job_seekers table)
      if (req.files?.profile_photo) {
        jobSeekerData.profile_photo = `/images/${req.files.profile_photo[0].filename}`;
      }
      if (req.files?.upload_video) {
        const video = req.files.upload_video[0];
        jobSeekerData.upload_video = `/videos/${video.filename}`;
        jobSeekerData.video_file_size = video.size;
        jobSeekerData.video_file_type = video.mimetype;
        jobSeekerData.video_upload_date = toMySQLDateTime(new Date());
      }

      // Calculate percentage for job_seekers table
      const percentage = await calculateColumnsPercentage(jobSeekerData);
      jobSeekerData.columns_percentage = percentage;

      // Process job_seekers table
      const [jobSeekerRows] = await connection.query(
        'SELECT user_id FROM job_seekers WHERE user_id = ?',
        [userId]
      );

      if (jobSeekerRows.length === 0) {
        await connection.query('INSERT INTO job_seekers SET ?', [jobSeekerData]);
      } else {
        const updateFields = Object.keys(jobSeekerData)
          .filter(key => key !== 'user_id')
          .map(key => `${key} = ?`)
          .join(', ');

        const updateValues = Object.keys(jobSeekerData)
          .filter(key => key !== 'user_id')
          .map(key => jobSeekerData[key]);

        const updateSql = `UPDATE job_seekers SET ${updateFields} WHERE user_id = ?`;
        await connection.query(updateSql, [...updateValues, userId]);
      }

      // Process doctor_profile table (only if there are dtr_ fields)
      if (Object.keys(doctorProfileData).length > 0) {
        // Add user_id and user_name to doctor profile data if available
        if (jobSeekerData.user_id) doctorProfileData.dtr_user_id = jobSeekerData.user_id;
        if (jobSeekerData.user_name) doctorProfileData.dtr_user_name = jobSeekerData.user_name;

        // Ensure all array/object fields in doctor profile are properly stringified
        const doctorJsonFields = [
          'dtr_preferred_country',
          'dtr_language_skilled',
          'dtr_country_doctor_license',
          'dtr_driving_license_country',
          'dtr_preferred_job_location',
          'dtr_previous_hospital_details',
          'dtr_before_worked_country',
          'dtr_certificate_options',
          'dtr_specialty_qualifications',
          'dtr_super_spl_qualifications'
        ];

        doctorJsonFields.forEach(field => {
          if (doctorProfileData[field] !== undefined) {
            if (Array.isArray(doctorProfileData[field]) || typeof doctorProfileData[field] === 'object') {
              doctorProfileData[field] = JSON.stringify(doctorProfileData[field]);
            }
            // Ensure empty arrays/objects become empty JSON arrays
            if (doctorProfileData[field] === null || doctorProfileData[field] === undefined) {
              doctorProfileData[field] = '[]';
            }
          }
        });

        const [doctorProfileRows] = await connection.query(
          'SELECT dtr_user_id FROM doctor_profile WHERE dtr_user_id = ?',
          [userId]
        );

        if (doctorProfileRows.length === 0) {
          // For INSERT, handle undefined/null values
          const insertData = { ...doctorProfileData };
          Object.keys(insertData).forEach(key => {
            if (insertData[key] === undefined || insertData[key] === null) {
              insertData[key] = '';
            }
          });
          await connection.query('INSERT INTO doctor_profile SET ?', [insertData]);
        } else {
          // For UPDATE, filter out undefined/null values or convert them to empty string
          const updateFields = [];
          const updateValues = [];

          Object.keys(doctorProfileData).forEach(key => {
            if (key !== 'dtr_user_id') {
              let value = doctorProfileData[key];

              // Handle undefined/null values
              if (value === undefined || value === null) {
                value = '';
              }

              // Handle empty arrays for JSON fields
              if (Array.isArray(value) && value.length === 0) {
                value = '[]';
              }

              updateFields.push(`${key} = ?`);
              updateValues.push(value);
            }
          });

          if (updateFields.length > 0) {
            const updateSql = `UPDATE doctor_profile SET ${updateFields.join(', ')} WHERE dtr_user_id = ?`;
            await connection.query(updateSql, [...updateValues, userId]);
          }
        }
      }

      await connection.commit();

      res.status(200).json({
        message: 'Data saved successfully',
        columns_percentage: percentage,
        doctor_profile_updated: Object.keys(doctorProfileData).length > 0
      });

    } catch (err) {
      if (connection) await connection.rollback();
      console.error('Error in job-seeker POST:', err);
      res.status(500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
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
          try { row[field] = JSON.parse(row[field]); } catch (_) { }
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
      if (row[field]) { try { row[field] = JSON.parse(row[field]); } catch (_) { } }
    });

    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/job-seeker/doctor/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db.query('SELECT * FROM doctor_profile WHERE dtr_user_id = ?', [userId]);

    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const row = results[0];
    jsonFields.forEach(field => {
      if (row[field]) { try { row[field] = JSON.parse(row[field]); } catch (_) { } }
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

// ✅ GET: Get all records from both job_seekers and doctor_profile tables (merged)
router.get('/job-seeker/combine/all', async (req, res) => {
  try {
    // Query both tables
    const [jobSeekerResults, doctorProfileResults] = await Promise.all([
      db.query('SELECT * FROM job_seekers'),
      db.query('SELECT * FROM doctor_profile')
    ]);

    const jobSeekers = jobSeekerResults[0];
    const doctorProfiles = doctorProfileResults[0];

    // Parse JSON fields for job_seekers data
    jobSeekers.forEach(seeker => {
      jsonFields.forEach(field => {
        if (seeker[field]) {
          try { seeker[field] = JSON.parse(seeker[field]); } catch (_) { }
        }
      });
    });

    // Parse JSON fields for doctor_profile data
    const doctorJsonFields = [
      'dtr_preferred_country',
      'dtr_language_skilled',
      'dtr_country_doctor_license',
      'dtr_driving_license_country',
      'dtr_preferred_job_location',
      'dtr_previous_hospital_details',
      'dtr_before_worked_country',
      'dtr_certificate_options',
      'dtr_specialty_qualifications',
      'dtr_super_spl_qualifications',
      'dtr_fellowship_qualifications',
      'dtr_other_language_qualifications',
      'dtr_cultural_qualifications'
    ];
    doctorProfiles.forEach(profile => {
      doctorJsonFields.forEach(field => {
        if (profile[field]) {
          try { profile[field] = JSON.parse(profile[field]); } catch (_) { }
        }
      });
    });

    // Create a map of doctor profiles for easy lookup
    const doctorProfileMap = {};
    doctorProfiles.forEach(profile => {
      if (profile.dtr_user_id) {
        doctorProfileMap[profile.dtr_user_id] = profile;
      }
    });

    // Merge data: for each job seeker, add corresponding doctor profile data
    const mergedData = jobSeekers.map(seeker => {
      const doctorProfile = doctorProfileMap[seeker.user_id] || {};

      // Remove dtr_user_id from doctor profile to avoid duplication with user_id
      const { dtr_user_id, ...doctorData } = doctorProfile;

      return {
        ...seeker,
        ...doctorData
      };
    });

    res.status(200).json({
      success: true,
      count: mergedData.length,
      data: mergedData
    });

  } catch (err) {
    console.error('Error in merged-all job-seeker GET:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


// ✅ GET: Get merged data from both tables by user ID (single object)
router.get('/job-seeker/merged/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const [jobSeekerResults, doctorProfileResults] = await Promise.all([
      db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]),
      db.query('SELECT * FROM doctor_profile WHERE dtr_user_id = ?', [userId])
    ]);

    if (jobSeekerResults[0].length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let mergedData = { ...jobSeekerResults[0][0] };

    // Parse JSON fields for job_seekers data
    jsonFields.forEach(field => {
      if (mergedData[field]) {
        try { mergedData[field] = JSON.parse(mergedData[field]); } catch (_) { }
      }
    });

    // Add doctor profile data if exists
    if (doctorProfileResults[0].length > 0) {
      const doctorProfileData = doctorProfileResults[0][0];

      const doctorJsonFields = [
        'dtr_preferred_country',
        'dtr_language_skilled',
        'dtr_country_doctor_license',
        'dtr_driving_license_country',
        'dtr_preferred_job_location',
        'dtr_previous_hospital_details',
        'dtr_before_worked_country',
        'dtr_certificate_options',
        'dtr_specialty_qualifications',
        'dtr_super_spl_qualifications',
        'dtr_fellowship_qualifications',
        'dtr_other_language_qualifications',
        'dtr_cultural_qualifications'
      ];
      // Parse JSON fields for doctor data
      doctorJsonFields.forEach(field => {
        if (doctorProfileData[field]) {
          try { doctorProfileData[field] = JSON.parse(doctorProfileData[field]); } catch (_) { }
        }
      });

      // Merge doctor data into main object
      mergedData = { ...mergedData, ...doctorProfileData };
    }

    res.status(200).json(mergedData);

  } catch (err) {
    console.error('Error in merged job-seeker GET:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE: Delete user from both users and job_seekers tables
router.delete('/user/:id', async (req, res) => {
  let connection;
  try {
    const userId = req.params.id;
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if user exists
    const [userExists] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 1. Delete from job_seekers table first (foreign key constraint might exist)
    const [jobSeekerResult] = await connection.query(
      'DELETE FROM job_seekers WHERE user_id = ?',
      [userId]
    );

    // 2. Delete from doctor_profile table if exists
    await connection.query(
      'DELETE FROM doctor_profile WHERE dtr_user_id = ?',
      [userId]
    );

    // 3. Delete from users table
    const [userResult] = await connection.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'User and related data deleted successfully',
      deletedFromJobSeekers: jobSeekerResult.affectedRows > 0,
      deletedFromUsers: userResult.affectedRows > 0
    });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error deleting user:', err);

    // Handle foreign key constraint errors
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED' ||
      err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete user. User has related records in other tables.',
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to delete user'
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;