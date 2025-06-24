const express = require('express');
const router = express.Router();
const db = require('../db');

// POST - Create new agency
router.post('/agency', (req, res) => {
  const data = req.body;
  const query = 'INSERT INTO agency_user SET ?';
  db.query(query, data, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Agency created', id: result.insertId });
  });
});

// GET - All agencies
router.get('/agency', (req, res) => {
  db.query('SELECT * FROM agency_user', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

// GET - Single agency by ID
router.get('/agency/:id', (req, res) => {
  db.query('SELECT * FROM agency_user WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Agency not found' });
    res.status(200).json(results[0]);
  });
});

// PUT - Update agency by ID
router.put('/agency/:id', (req, res) => {
  const data = req.body;
  db.query('UPDATE agency_user SET ? WHERE id = ?', [data, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Agency updated' });
  });
});

// DELETE - Delete agency by ID
router.delete('/agency/:id', (req, res) => {
  db.query('DELETE FROM agency_user WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Agency deleted' });
  });
});

module.exports = router;
