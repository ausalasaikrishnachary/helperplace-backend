const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const { transporter, ADMIN_EMAIL } = require("./nodemailer");
const razorpay = require("./razorpay");

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// =========================
//   RAZORPAY WEBHOOK
// =========================
router.post("/webhook/razorpay", async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.body.toString(); // express.raw() is required for this

        if (!signature || !rawBody) {
            return res.status(400).send("Bad Request");
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.log("❌ Invalid webhook signature");
            return res.status(401).send("Invalid signature");
        }

        const event = JSON.parse(rawBody);
        const eventType = event?.event;

        console.log("\n===============================");
        console.log("📩 Razorpay Webhook Received");
        console.log("Event:", eventType);
        console.log("===============================\n");

        const subscriptionEntity = event.payload?.subscription?.entity;
        const customer_id = subscriptionEntity?.customer_id;

        // -------------------------
        // Fetch Customer Details
        // -------------------------
        let customerEmail = null;
        let customerName = null;

        if (customer_id) {
            try {
                const customer = await razorpay.customers.fetch(customer_id);
                customerEmail = customer.email;
                customerName = customer.name || "Customer";
            } catch (err) {
                console.error("❌ Failed to fetch customer:", err);
            }
        }

        // -------------------------
        // Fetch Plan Details
        // -------------------------
        let planName = "Plan";
        let planAmount = "0.00";
        let planCurrency = "INR";

        if (subscriptionEntity?.plan_id) {
            try {
                const plan = await razorpay.plans.fetch(subscriptionEntity.plan_id);

                planName = plan?.item?.name || "Plan";
                planAmount = (plan?.item?.amount / 100).toFixed(2); // paise → rupees
                planCurrency = plan?.item?.currency || "INR";
            } catch (err) {
                console.error("❌ Failed to fetch plan details:", err);
            }
        }

        // -------------------------
        // Helpers
        // -------------------------
        const getTodayDate = () => {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, "0");
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const yyyy = today.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        };

        const todayDate = getTodayDate();

        const successMessage = `Dear ${customerName}, your payment of ${planCurrency} ${planAmount} for the Gulf Worker ${planName} plan has been successfully debited on ${todayDate}. Thank you for staying connected with Gulf Worker.`;

        const failureMessage = `Dear ${customerName}, your payment for the Gulf Worker ${planName} plan on ${todayDate} has failed. Please update your payment method to avoid service interruption.`;

        // ==============================
        //     EVENT: subscription.charged
        // ==============================
        if (eventType === "subscription.charged") {
            const sub = subscriptionEntity;

            console.log("⚡ subscription.charged");

            const razorpaySubscriptionId = sub.id;
            const razorpayCustomerId = sub.customer_id;

            const nextPaymentAttempt = sub.next_payment_attempt;
            const currentEnd = sub.current_end;

            const nextEpoch = nextPaymentAttempt || currentEnd; // epoch timestamp

            if (nextEpoch) {
                const ISTDate = new Date(nextEpoch * 1000 + 5.5 * 60 * 60 * 1000);

                const pad = (n) => String(n).padStart(2, "0");
                const formatted = `${ISTDate.getFullYear()}-${pad(
                    ISTDate.getMonth() + 1
                )}-${pad(ISTDate.getDate())} ${pad(ISTDate.getHours())}:${pad(
                    ISTDate.getMinutes()
                )}:${pad(ISTDate.getSeconds())}`;

                // -------------------------
                // Update DB next due date
                // -------------------------
                try {
                    await db.execute(
                        `
            UPDATE users 
            SET next_duedate = ?
            WHERE razorpay_subscription_id = ? AND customer_id = ?
          `,
                        [formatted, razorpaySubscriptionId, razorpayCustomerId]
                    );

                    console.log("✅ next_duedate updated:", formatted);
                } catch (err) {
                    console.error("❌ DB Update Error:", err);
                }


                if (customerEmail) {
                    try {
                        await transporter.sendMail({
                            from: ADMIN_EMAIL,
                            to: customerEmail,
                            subject: "Gulf Worker Payment Confirmation",
                            text: successMessage,
                        });

                        console.log("📧 Success Email Sent to:", customerEmail);
                    } catch (err) {
                        console.error("❌ Email Sending Error:", err);
                    }
                }
            }
        }

        if (eventType === "payment.failed") {
            console.log("⚠ Payment Failed Event");

            if (customerEmail) {
                try {
                    await transporter.sendMail({
                        from: ADMIN_EMAIL,
                        to: customerEmail,
                        subject: "Gulf Worker Payment Failed",
                        text: failureMessage,
                    });

                    console.log("📧 Failure Email Sent to:", customerEmail);
                } catch (err) {
                    console.error("❌ Email Sending Error:", err);
                }
            }
        }

        res.status(200).send("OK");
    } catch (err) {
        console.error("❌ Webhook Exception:", err);
        res.status(500).send("Server error");
    }
});

module.exports = router;
