const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all subscription plans
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM subscription_plans');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subscription plan by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Subscription plan not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new subscription plan
router.post('/', async (req, res) => {
  const { plan_name, description } = req.body;

  try {
    const query = `
      INSERT INTO subscription_plans (plan_name, description)
      VALUES (?, ?)
    `;
    const [result] = await db.query(query, [
      plan_name, description
    ]);

    res.status(201).json({
      id: result.insertId,
      plan_name,
      description
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update subscription plan
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { plan_name, description } = req.body;
  try {
    const query = `
      UPDATE subscription_plans SET plan_name = ?, description = ?
      WHERE id = ?
    `;
    await db.query(query, [plan_name, description, id]);
    res.json({ message: 'Subscription plan updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete subscription plan
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM subscription_plans WHERE id = ?', [id]);
    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;