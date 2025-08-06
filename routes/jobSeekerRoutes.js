const express = require('express');
const router = express.Router();
const db = require('../db'); // db is a mysql2/promise pool
const { sendProfileVerifiedEmail } = require('./emailService');
const {sendSubscriptionPlanChangeEmail} = require('./emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folders exist
['images', 'videos'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_photo') {
      cb(null, 'images');
    } else if (file.fieldname === 'upload_video') {
      cb(null, 'videos');
    } else {
      cb(new Error('Invalid field name'), null);
    }
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

  if (file.fieldname === 'profile_photo' && imageTypes.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'upload_video' && videoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'));
  }
};

const upload = multer({ storage, fileFilter });

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

// Function to calculate filled columns percentage for job_seekers
async function calculateColumnsPercentage(data) {
  try {
    // Get all columns from the job_seekers table except columns_percentage and auto-increment fields
    const [columnsInfo] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'job_seekers' 
      AND COLUMN_NAME NOT IN ('columns_percentage', 'id', 'created_at', 'updated_at')
    `);
    
    const totalColumns = columnsInfo.length;
    let filledColumns = 0;

    // Count how many columns are filled in the data
    for (const column of columnsInfo) {
      const columnName = column.COLUMN_NAME;
      if (data[columnName] !== undefined && data[columnName] !== null && data[columnName] !== '') {
        filledColumns++;
      }
    }

    // Calculate percentage
    const percentage = Math.round((filledColumns / totalColumns) * 100);
    return percentage;
  } catch (err) {
    console.error('Error calculating columns percentage:', err);
    return 0;
  }
}

// ✅ POST: Create or update job seeker
router.post('/job-seeker', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'upload_video', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = stringifyJsonFields(req.body);
    const userId = data.user_id;

    if (!userId) return res.status(400).json({ error: 'user_id is required' });

    // Handle file uploads
    if (req.files?.profile_photo) {
      data.profile_photo = `/images/${req.files.profile_photo[0].filename}`;
    }
    if (req.files?.upload_video) {
      const video = req.files.upload_video[0];
      data.upload_video = `/videos/${video.filename}`;
      data.video_file_size = video.size;
      data.video_file_type = video.mimetype;
      data.video_upload_date = new Date();
    }

    // Calculate columns percentage with the new data
    const percentage = await calculateColumnsPercentage(data);
    data.columns_percentage = percentage;

    const [rows] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      await db.query('INSERT INTO job_seekers SET ?', [data]);
      res.status(201).json({ 
        message: 'New job seeker inserted',
        columns_percentage: percentage 
      });
    } else {
      const updateFields = Object.keys(data)
        .filter(key => key !== 'user_id')
        .map(key => `${key} = ?`)
        .join(', ');

      const updateValues = Object.keys(data)
        .filter(key => key !== 'user_id')
        .map(key => data[key]);

      const updateSql = `UPDATE job_seekers SET ${updateFields} WHERE user_id = ?`;
      await db.query(updateSql, [...updateValues, userId]);
      res.status(200).json({ 
        message: 'Job seeker updated',
        columns_percentage: percentage 
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET: All job seekers
router.get('/job-seeker', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM job_seekers');

    const parsedResults = results.map(row => {
      jsonFields.forEach(field => {
        if (row[field]) {
          try {
            row[field] = JSON.parse(row[field]);
          } catch (e) {
            // ignore
          }
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

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT: Update by ID
router.put('/job-seeker/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const data = stringifyJsonFields(req.body);
    
    // Calculate columns percentage with the new data
    const percentage = await calculateColumnsPercentage(data);
    data.columns_percentage = percentage;
    
    await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);
    res.json({ 
      message: 'Job seeker updated',
      columns_percentage: percentage 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE: Delete by ID (deletes entire record)
router.delete('/job-seeker/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await db.query('DELETE FROM job_seekers WHERE user_id = ?', [userId]);
    res.json({ message: 'Job seeker deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE: Delete only profile photo by ID
router.delete('/job-seeker/:id/photo', async (req, res) => {
  try {
    const userId = req.params.id;

    // First get the current profile photo path
    const [results] = await db.query('SELECT profile_photo FROM job_seekers WHERE user_id = ?', [userId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profilePhotoPath = results[0].profile_photo;

    // Update the database to remove the profile photo
    await db.query('UPDATE job_seekers SET profile_photo = NULL WHERE user_id = ?', [userId]);

    // Recalculate columns percentage after removing photo
    const [userData] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);
    if (userData.length > 0) {
      const percentage = await calculateColumnsPercentage(userData[0]);
      await db.query('UPDATE job_seekers SET columns_percentage = ? WHERE user_id = ?', [percentage, userId]);
    }

    res.json({
      message: 'Profile photo deleted',
      deletedPhotoPath: profilePhotoPath
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET columns percentage for a specific job seeker
router.get('/job-seeker/columns-percentage/:id', async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "user_id is required" });
  }

  try {
    const [rows] = await db.query(
      `SELECT columns_percentage, email_id, first_name FROM job_seekers WHERE user_id = ?`,
      [userId]
    );

    if (rows.length > 0) {
      const jobSeeker = rows[0];
      
      // Check if profile is incomplete (less than 100%)
      if (jobSeeker.columns_percentage < 100) {
        try {
          // You would need to implement sendIncompleteProfileReminder similar to the reference code
          await sendIncompleteProfileReminder(
            jobSeeker.email_id,
            jobSeeker.first_name,
            jobSeeker.columns_percentage
          );
        } catch (emailErr) {
          console.error('Error sending incomplete profile reminder:', emailErr);
          // Continue with the response even if email fails
        }
      }
      
      res.json({ columns_percentage: jobSeeker.columns_percentage });
    } else {
      res.status(404).json({ message: "No data found for the given user_id" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

router.put('/job-seeker/status/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const data = stringifyJsonFields(req.body);

    // Get the current verification status before updating
    const [currentData] = await db.query(
      'SELECT verification_status, email_id, first_name FROM job_seekers WHERE user_id = ?',
      [userId]
    );

    // Calculate columns percentage with the new data
    const [userData] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);
    if (userData.length > 0) {
      const mergedData = { ...userData[0], ...data };
      const percentage = await calculateColumnsPercentage(mergedData);
      data.columns_percentage = percentage;
    }

    await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);

    // Check if verification status was changed to "Verified"
    if (data.verification_status === 'Verified' &&
      currentData[0]?.verification_status !== 'Verified' &&
      currentData[0]?.email_id) {
      try {
        await sendProfileVerifiedEmail(
          currentData[0].email_id,
          currentData[0].first_name
        );
      } catch (emailErr) {
        console.error('Error sending verification email:', emailErr);
        // Don't fail the request if email fails
      }
    }

    res.json({ message: 'Job seeker updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT: Update by ID
router.put('/job-seeker/subscription/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const data = stringifyJsonFields(req.body);
        
        // Get current subscription data before updating
        const [currentData] = await db.query(
            'SELECT subscription_plan, email_id, first_name FROM job_seekers WHERE user_id = ?', 
            [userId]
        );

        // Calculate columns percentage with the new data
        const percentage = await calculateColumnsPercentage(data);
        data.columns_percentage = percentage;
        
        await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);

        // Check if subscription plan was changed
        if (currentData.length > 0 && 
            data.subscription_plan && 
            data.subscription_plan !== currentData[0].subscription_plan &&
            currentData[0].email_id) {
            try {
                await sendSubscriptionPlanChangeEmail(
                    currentData[0].email_id,
                    currentData[0].first_name,
                    currentData[0].subscription_plan,
                    data.subscription_plan,
                    data.plan_enddate
                );
            } catch (emailErr) {
                console.error('Error sending plan change email:', emailErr);
                // Don't fail the request if email fails
            }
        }

        res.json({ 
            message: 'Job seeker updated',
            columns_percentage: percentage 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;