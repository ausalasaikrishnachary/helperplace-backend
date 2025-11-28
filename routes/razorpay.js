const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//   key_id: "rzp_test_RUqBDkqa10TxXE",
//   key_secret: "YH5qifp0nv6z1m0ItHD3vQ3F"
// });

const razorpay = new Razorpay({
  key_id: "rzp_live_RXHWwwo2GCKNPF",
  key_secret: "wAjLz2kbMonqvDkhqyoHnXpf"
});

module.exports = razorpay;
