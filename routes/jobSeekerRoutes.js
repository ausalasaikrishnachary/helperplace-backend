const express = require('express');
const router = express.Router();
const db = require('../db'); // assumes db.js exports MySQL connection

// Fields that need to be stored as JSON strings in MySQL
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

// Utility to stringify JSON fields if they are not strings
function stringifyJsonFields(data) {
  jsonFields.forEach(field => {
    if (data[field] && typeof data[field] !== 'string') {
      data[field] = JSON.stringify(data[field]);
    }
  });
  return data;
}

// ✅ POST: Insert new or partially update existing job seeker
router.post('/job-seeker', (req, res) => {
  const data = stringifyJsonFields(req.body);
  const userId = data.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  // Check if user_id exists
  const checkSql = 'SELECT * FROM job_seekers WHERE user_id = ?';
  db.query(checkSql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      // INSERT new row
      const insertSql = 'INSERT INTO job_seekers SET ?';
      db.query(insertSql, data, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'New job seeker inserted' });
      });
    } else {
      // UPDATE only provided fields
      const updateFields = Object.keys(data)
        .filter(key => key !== 'user_id') // Don't update user_id
        .map(key => `${key} = ?`)
        .join(', ');

      const updateValues = Object.keys(data)
        .filter(key => key !== 'user_id')
        .map(key => data[key]);

      const updateSql = `UPDATE job_seekers SET ${updateFields} WHERE user_id = ?`;
      db.query(updateSql, [...updateValues, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Job seeker updated' });
      });
    }
  });
});




// ✅ GET /job-seeker - fetch all job seekers
router.get('/job-seeker', (req, res) => {
    console.log('✅ GET /job-seeker hit'); // Debug log
  db.query('SELECT * FROM job_seekers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse JSON fields back to objects/arrays
    const parsedResults = results.map(row => {
      jsonFields.forEach(field => {
        if (row[field]) {
          try {
            row[field] = JSON.parse(row[field]);
          } catch (e) {
            // Leave as is if not valid JSON
          }
        }
      });
      return row;
    });

    res.status(200).json(parsedResults);
  });
});


router.get('/job-seeker/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM job_seekers WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});






// ✅ PUT: Update job seeker by ID
router.put('/job-seeker/:id', (req, res) => {
  const userId = req.params.id;
  const data = stringifyJsonFields(req.body);

  const sql = 'UPDATE job_seekers SET ? WHERE user_id = ?';
  db.query(sql, [data, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job seeker updated' });
  });
});

// ✅ DELETE: Delete job seeker by ID
router.delete('/job-seeker/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM job_seekers WHERE user_id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job seeker deleted' });
  });
});

module.exports = router;
