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

  console.log("Requested body=", req.body);

  try {
    // Convert listing_duration_days to number
    let days = Number(listing_duration_days);

    if (!days || days <= 0) {
      return res.status(400).json({
        error: "Invalid listing_duration_days. It must be a valid number.",
      });
    }

    // ----------------------------
    // PERIOD & INTERVAL LOGIC
    // ----------------------------
    let period = "daily";
    let interval = 1;

    if (days < 7) {
      // Example: 1 to 6 days → daily
      period = "daily";
      interval = days;
    } else if (days === 7) {
      // Exactly 7 days → weekly
      period = "weekly";
      interval = 1;
    } else if (days > 7 && days < 30) {
      // Example: 8–29 days → weekly split
      period = "weekly";
      interval = Math.floor(days / 7);
      if (interval < 1) interval = 1;
    } else if (days === 30) {
      // Exactly 30 → monthly
      period = "monthly";
      interval = 1;
    } else if (days > 30) {
      // Example: 31+ days → monthly split
      period = "monthly";
      interval = Math.floor(days / 30);
      if (interval < 1) interval = 1;
    }

    let razorpayPlanId = null;

    // ----------------------------
    //  CREATE RAZORPAY PLAN (SKIP IF FREE)
    // ----------------------------
    if (plan_name.toLowerCase() !== "free") {
      const razorpayPlan = await razorpay.plans.create({
        period,
        interval,
        item: {
          name: plan_name,
          description: `Subscription plan: ${plan_name} for ${days} days`,
          amount: Math.round(Number(price) * 100), // convert to paise
          currency: currency || "USD",
        },
        notes: {
          listing_duration_days: days,
          created_from: "Node backend",
        },
      });

      razorpayPlanId = razorpayPlan.id;
    }

    // ----------------------------
    //  SAVE PLAN IN DATABASE
    // ----------------------------
    const query = `
      INSERT INTO subscription_plans (
        plan_id,
        plan_name,
        period,
        listing_duration_days,
        access_type,
        job_position_priority,
        messaging_limit,
        whatsapp_access,
        direct_call_access,
        share_option,
        view_limit,
        alerts_for_new_cvs,
        full_contact_details,
        activate_deactivate_option,
        currency,
        price,
        limit_count,
        contact_details,
        candidate_contact_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      razorpayPlanId,
      plan_name,
      period,
      days,
      access_type,
      job_position_priority,
      messaging_limit,
      whatsapp_access,
      direct_call_access,
      share_option,
      view_limit,
      alerts_for_new_cvs,
      full_contact_details,
      activate_deactivate_option,
      currency,
      price,
      limit_count,
      contact_details,
      candidate_contact_details,
    ]);

    // ----------------------------
    //  RESPONSE
    // ----------------------------
    res.status(201).json({
      message:
        plan_name.toLowerCase() === "free"
          ? "Free plan created successfully (no Razorpay plan created)"
          : "Subscription plan created successfully",
      mysql_id: result.insertId,
      razorpay_plan_id: razorpayPlanId,
      period,
      interval,
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