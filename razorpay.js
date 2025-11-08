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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
