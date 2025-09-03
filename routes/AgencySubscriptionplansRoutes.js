const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all agency subscription plans
router.get('/agencysubscriptionplans', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM agency_subscription_plans');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get agency subscription plan by ID
router.get('/agencysubscriptionplans/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM agency_subscription_plans WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Agency subscription plan not found' });
    
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new agency subscription plan
router.post('/agencysubscriptionplans', async (req, res) => {
  const {
    plan_name,
    candidate_posting,
    candidate_contact
  } = req.body;

  // Validate required fields
  if (!plan_name || !candidate_posting || !candidate_contact) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const query = `
      INSERT INTO agency_subscription_plans (
        plan_name,
        candidate_posting,
        candidate_contact
      ) VALUES (?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      plan_name,
      candidate_posting,
      candidate_contact
    ]);

    res.status(201).json({
      id: result.insertId,
      plan_name,
      candidate_posting,
      candidate_contact
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update agency subscription plan
router.put('/agencysubscriptionplans/:id', async (req, res) => {
  const { id } = req.params;
  const {
    plan_name,
    candidate_posting,
    candidate_contact
  } = req.body;

  // Validate required fields
  if (!plan_name || !candidate_posting || !candidate_contact) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const query = `
      UPDATE agency_subscription_plans SET 
        plan_name = ?,
        candidate_posting = ?,
        candidate_contact = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      plan_name,
      candidate_posting,
      candidate_contact,
      id
    ]);

    res.json({ 
      message: 'Agency subscription plan updated successfully',
      plan_name,
      candidate_posting,
      candidate_contact
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete agency subscription plan
router.delete('/agencysubscriptionplans/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM agency_subscription_plans WHERE id = ?', [id]);
    res.json({ message: 'Agency subscription plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;