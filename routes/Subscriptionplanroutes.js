const express = require('express');
const router = express.Router();
const db = require('../db');
const razorpay = require("./razorpay");

// Get all subscription plans
router.get('/subscriptionplans', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM subscription_plans');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subscription plan by ID
router.get('/subscriptionplans/:id', async (req, res) => {
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
router.post("/subscriptionplans", async (req, res) => {
  const {
    plan_name,
    listing_duration_days,
    access_type,
    job_position_priority,
    messaging_limit,
    whatsapp_access,
    direct_call_access,
    share_option,
    view_limit,
    contact_details,
    candidate_contact_details,
    alerts_for_new_cvs,
    currency,
    price,
    limit_count,
    full_contact_details,
    activate_deactivate_option,
  } = req.body;
  console.log("Requested body=",req.body)

  try {
    let period = "monthly";
    let interval = 1;

    // 🔹 Map days to a valid period + interval combination Razorpay supports
    if (listing_duration_days >= 365) {
      period = "yearly";
      interval = 1;
    } else if (listing_duration_days >= 90) {
      period = "monthly";
      interval = Math.floor(listing_duration_days / 30);
      if (interval < 1) interval = 1;
    } else if (listing_duration_days >= 7) {
      period = "weekly";
      interval = Math.floor(listing_duration_days / 7);
      if (interval < 1) interval = 1;
    } else {
      // For <7 days, Razorpay doesn't allow daily <7,
      // So we’ll make it a single weekly plan.
      period = "weekly";
      interval = 1;
    }

    // 🔹 Create plan in Razorpay
    const razorpayPlan = await razorpay.plans.create({
      period,
      interval,
      item: {
        name: plan_name,
        description: `Subscription plan: ${plan_name} for ${listing_duration_days} days`,
        amount: Math.round(Number(price) * 100), // amount in paise
        currency: currency || "USD",
      },
      notes: {
        listing_duration_days,
        created_from: "Node backend",
      },
    });

    // 🔹 Insert plan into MySQL (now includes plan_id & period)
    const query = `
      INSERT INTO subscription_plans (
        plan_name,
        listing_duration_days,
        access_type,
        job_position_priority,
        messaging_limit,
        whatsapp_access,
        direct_call_access,
        share_option,
        view_limit,
        contact_details,
        candidate_contact_details,
        alerts_for_new_cvs,
        currency,
        price,
        limit_count,
        full_contact_details,
        activate_deactivate_option,
        plan_id,
        period
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;

    const [result] = await db.query(query, [
      plan_name,
      listing_duration_days,
      access_type,
      job_position_priority,
      messaging_limit,
      whatsapp_access,
      direct_call_access,
      share_option,
      view_limit,
      contact_details,
      candidate_contact_details,
      alerts_for_new_cvs,
      currency,
      price,
      limit_count,
      full_contact_details,
      activate_deactivate_option,
      razorpayPlan.id,
      period,
    ]);

    res.status(201).json({
      message: "Subscription plan created successfully",
      mysql_id: result.insertId,
      razorpay_plan_id: razorpayPlan.id,
      period,
      interval,
      plan_details: razorpayPlan,
    });
  } catch (err) {
    console.error("Error creating plan:", err);
    res.status(500).json({
      error: err.error?.description || err.message,
    });
  }
});


// Update subscription plan
router.put('/subscriptionplans/:id', async (req, res) => {
  const { id } = req.params;
  const {
    plan_name,
    listing_duration_days,
    access_type,
    job_position_priority,
    messaging_limit,
    whatsapp_access,
    direct_call_access,
    share_option,
    view_limit,
    contact_details,
    candidate_contact_details,
    alerts_for_new_cvs,
    currency,
    price,
    limit_count,
    full_contact_details,
    activate_deactivate_option
  } = req.body;

  try {
    const query = `
      UPDATE subscription_plans SET 
        plan_name = ?,
        listing_duration_days = ?,
        access_type = ?,
        job_position_priority = ?,
        messaging_limit = ?,
        whatsapp_access = ?,
        direct_call_access = ?,
        share_option = ?,
        view_limit = ?,
        contact_details = ?,
        candidate_contact_details = ?,
        alerts_for_new_cvs = ?,
        currency = ?,
        price = ?,
        limit_count = ?,
        full_contact_details = ?,
        activate_deactivate_option = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await db.query(query, [
      plan_name,
      listing_duration_days,
      access_type,
      job_position_priority,
      messaging_limit,
      whatsapp_access,
      direct_call_access,
      share_option,
      view_limit,
      contact_details,
      candidate_contact_details,
      alerts_for_new_cvs,
      currency,
      price,
      limit_count,
      full_contact_details,
      activate_deactivate_option,
      id
    ]);

    res.json({ message: 'Subscription plan updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete subscription plan
router.delete('/subscriptionplans/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM subscription_plans WHERE id = ?', [id]);
    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;