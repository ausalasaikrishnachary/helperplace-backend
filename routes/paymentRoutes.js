const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const razorpay = require("./razorpay");

// Create Razorpay Order
router.post("/orders", async (req, res) => {
  const options = {
    amount: req.body.amount, // amount in paise
    currency: req.body.currency || "USD",
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1
  };

  // console.log("Options=",options)

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

    const key_secret = "YH5qifp0nv6z1m0ItHD3vQ3F";
 // const key_secret = "wAjLz2kbMonqvDkhqyoHnXpf";

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", key_secret) // your secret
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    return res.json({ success: true, message: "Payment verified successfully" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

// router.post("/verify-payment", (req, res) => {
//   const {
//     razorpay_payment_id,
//     razorpay_subscription_id,
//     razorpay_signature
//   } = req.body;

//   const key_secret = "YH5qifp0nv6z1m0ItHD3vQ3F";
//   // const key_secret = "wAjLz2kbMonqvDkhqyoHnXpf";

//   const generated = crypto
//     .createHmac("sha256", key_secret)
//     .update(razorpay_payment_id + "|" + razorpay_subscription_id)
//     .digest("hex");

//   if (generated === razorpay_signature) {
//     return res.json({ success: true });
//   }

//   return res.status(400).json({ success: false, message: "Invalid signature" });
// });



module.exports = router;
