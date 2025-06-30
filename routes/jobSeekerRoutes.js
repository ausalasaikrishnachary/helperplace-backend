const express = require('express');
const router = express.Router();
const db = require('../db'); // db is a mysql2/promise pool

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

    const [rows] = await db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      await db.query('INSERT INTO job_seekers SET ?', [data]);
      res.status(201).json({ message: 'New job seeker inserted' });
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
      res.status(200).json({ message: 'Job seeker updated' });
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
    await db.query('UPDATE job_seekers SET ? WHERE user_id = ?', [data, userId]);
    res.json({ message: 'Job seeker updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE: Delete by ID
router.delete('/job-seeker/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await db.query('DELETE FROM job_seekers WHERE user_id = ?', [userId]);
    res.json({ message: 'Job seeker deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
