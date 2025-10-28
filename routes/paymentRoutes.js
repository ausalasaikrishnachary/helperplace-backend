const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

// ✅ Initialize Razorpay here only
// const razorpay = new Razorpay({
//   key_id: "rzp_test_jIUzBukJnwE5kE",
//   key_secret: "ZhnhUtHuusGrZBSqBAnwXhAI"
// });

// const razorpay = new Razorpay({
//   key_id: "rzp_test_RUqBDkqa10TxXE",
//   key_secret: "YH5qifp0nv6z1m0ItHD3vQ3F"
// });

const razorpay = new Razorpay({
  key_id: "rzp_live_RXHWwwo2GCKNPF",
  key_secret: "wAjLz2kbMonqvDkhqyoHnXpf"
});

// Create Razorpay Order
router.post("/orders", async (req, res) => {
  const options = {
    amount: req.body.amount, // amount in paise
    currency: req.body.currency || "USD",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Internal server error");
  }
});

// ✅ Verify Payment Signature
router.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", "wAjLz2kbMonqvDkhqyoHnXpf") // your secret
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    return res.json({ success: true, message: "Payment verified successfully" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

module.exports = router;
