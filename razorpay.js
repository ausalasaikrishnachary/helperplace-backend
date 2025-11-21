// server.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_RUqBDkqa10TxXE",      // Your Razorpay Key ID
  key_secret: "YH5qifp0nv6z1m0ItHD3vQ3F", // Your Razorpay Secret Key
});

// ✅ Create Razorpay Order
app.post("/api/razorpay/orders", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount, // amount in paise (100 INR = 10000)
      currency: req.body.currency || "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);

    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Verify Payment Signature
app.post("/api/razorpay/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", "YH5qifp0nv6z1m0ItHD3vQ3F") // secret key
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    return res.json({ success: true, message: "Payment verified successfully" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

// Create Razorpay Customer
app.post("/razorpay/customer", async (req, res) => {
  const {
    name,
    email,
    contact,
    notes // optional
  } = req.body;

  try {
    const customerPayload = {
      name: name,
      email: email,
      contact: contact ? String(contact) : undefined,
      notes: notes || {}
    };

    // Create customer only in Razorpay
    const razorpayCustomer = await razorpay.customers.create(customerPayload);

    res.status(201).json({
      success: true,
      message: "Razorpay customer created successfully",
      customer_id: razorpayCustomer.id,
      customer_details: {
        name: razorpayCustomer.name,
        email: razorpayCustomer.email,
        contact: razorpayCustomer.contact,
        created_at: razorpayCustomer.created_at
      }
    });
  } catch (err) {
    console.error("Error creating Razorpay customer:", err);
    res.status(500).json({
      success: false,
      error: err.error?.description || err.message
    });
  }
});

// Create Razorpay Plan
app.post("/razorpay/plan", async (req, res) => {
  const {
    plan_name,
    description,
    amount,
    currency = "INR",
    period = "monthly",
    interval = 1
  } = req.body;

  try {
    const razorpayPlan = await razorpay.plans.create({
      period: period,
      interval: interval,
      item: {
        name: plan_name,
        description: description || `Subscription plan: ${plan_name}`,
        amount: Math.round(Number(amount) * 100), // convert to paise
        currency: currency,
      },
      notes: {
        created_from: "Node backend - Direct API"
      }
    });

    res.status(201).json({
      success: true,
      message: "Razorpay plan created successfully",
      plan_id: razorpayPlan.id,
      plan_details: {
        name: plan_name,
        amount: amount,
        currency: currency,
        period: period,
        interval: interval,
        created_at: razorpayPlan.created_at
      }
    });
  } catch (err) {
    console.error("Error creating Razorpay plan:", err);
    res.status(500).json({
      success: false,
      error: err.error?.description || err.message
    });
  }
});

// Create Razorpay Subscription
app.post("/razorpay/subscription", async (req, res) => {
  const {
    plan_id,
    customer_id,
    total_count = 12, // default 12 months
    start_at, // optional unix timestamp
    notes = {}
  } = req.body;

  try {
    if (!plan_id || !customer_id) {
      return res.status(400).json({
        success: false,
        message: "plan_id and customer_id are required"
      });
    }

    const subscriptionPayload = {
      plan_id: plan_id,
      customer_id: customer_id,
      total_count: total_count,
      customer_notify: 1,
      notes: notes
    };

    // Add start_at if provided
    if (start_at) {
      subscriptionPayload.start_at = start_at;
    }

    const razorpaysubscription = await razorpay.subscriptions.create(subscriptionPayload);

    // Format dates for response
    const formatUnixDate = (timestamp) => {
      return new Date(timestamp * 1000).toISOString();
    };

    const formattedDates = {
      charge_at: razorpaysubscription.charge_at ? formatUnixDate(razorpaysubscription.charge_at) : null,
      start_at: razorpaysubscription.start_at ? formatUnixDate(razorpaysubscription.start_at) : null,
      current_start: razorpaysubscription.current_start ? formatUnixDate(razorpaysubscription.current_start) : null,
      current_end: razorpaysubscription.current_end ? formatUnixDate(razorpaysubscription.current_end) : null,
      expire_by: razorpaysubscription.expire_by ? formatUnixDate(razorpaysubscription.expire_by) : null,
      created_at: razorpaysubscription.created_at ? formatUnixDate(razorpaysubscription.created_at) : null,
    };

    res.json({
      success: true,
      message: "Razorpay subscription created successfully",
      subscription_id: razorpaysubscription.id,
      subscription_status: razorpaysubscription.status,
      subscription_details: {
        customer_id: razorpaysubscription.customer_id,
        plan_id: razorpaysubscription.plan_id,
        total_count: razorpaysubscription.total_count,
        paid_count: razorpaysubscription.paid_count,
        entity: razorpaysubscription.entity,
        formatted_dates: formattedDates
      }
    });
  } catch (error) {
    console.error("Error creating Razorpay subscription:", error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Internal server error"
    });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
