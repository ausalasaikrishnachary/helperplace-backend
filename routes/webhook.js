const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const { transporter, ADMIN_EMAIL } = require('./nodemailer');
const razorpay = require("./razorpay");

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// ✅ Razorpay Webhook Handler
router.post("/webhook/razorpay", async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.body.toString();   // express.raw() captures this

        if (!signature || !rawBody) {
            console.error("❌ Missing signature or raw body");
            return res.status(400).send("Bad Request");
        }

        // ✅ Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("❌ Invalid webhook signature");
            return res.status(401).send("Invalid signature");
        }

        // ✅ Parse Event
        const event = JSON.parse(rawBody);
        const eventType = event?.event;

        console.log("==========================================");
        console.log("📩 Razorpay Webhook Received");
        console.log("📌 Event:", eventType);
        console.log("------------------------------------------");

        // ✅ Log complete payload
        console.log("📦 Full Event Payload:");
        console.log(JSON.stringify(event, null, 2));

        console.log("------------------------------------------");

        if (event.payload?.subscription?.entity) {
            console.log("🔔 Subscription Entity:");
            console.log(JSON.stringify(event.payload.subscription.entity, null, 2));
        }

        if (event.payload?.payment?.entity) {
            console.log("💳 Payment Entity:");
            console.log(JSON.stringify(event.payload.payment.entity, null, 2));
        }

        if (event.payload?.invoice?.entity) {
            console.log("🧾 Invoice Entity:");
            console.log(JSON.stringify(event.payload.invoice.entity, null, 2));
        }

        console.log("==========================================\n");

        // ✅ Extract subscription entity for customer_id (available in several events)
        const subscriptionEntity = event.payload?.subscription?.entity;
        const customer_id = subscriptionEntity?.customer_id;

        // ✅ Fetch Customer Details (if available)
        let customerEmail = null;
        let customerName = null;

        if (customer_id) {
            try {
                const customer = await razorpay.customers.fetch(customer_id);
                customerEmail = customer.email;
                customerName = customer.name || "Customer";

                console.log("✅ Customer Email:", customerEmail);
                console.log("✅ Customer Name:", customerName);
            } catch (err) {
                console.error("❌ Failed to fetch customer details:", err);
            }
        }

        const formatSuccessMessage = (name, amount, date) => {
            return `Dear ${name}, your payment of Rs.${amount} for the Gudnet Silver plan has been successfully debited on ${date}. Thank you for staying connected with Gudnet.`;
        };

        const formatFailureMessage = (name, date) => {
            return `Dear ${name}, your payment for the Gudnet Silver plan on ${date} has failed. Please ensure your card/bank account has sufficient balance or update your payment method to avoid service interruption. Team Gudnet.`;
        };


        // ✅ Handle subscription.charged  (payment success)
        if (eventType === "subscription.charged") {
            const sub = event.payload?.subscription?.entity;

            if (sub) {
                console.log("✅ subscription.charged handler starting");

                const razorpaySubscriptionId = sub.id;
                const razorpayCustomerId = sub.customer_id;

                const nextPaymentAttempt = sub.next_payment_attempt;
                const currentEnd = sub.current_end;

                const nextEpoch = nextPaymentAttempt || currentEnd;

                if (nextEpoch) {
                    const dateUTC = new Date(nextEpoch * 1000);
                    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
                    const dateIST = new Date(dateUTC.getTime() + IST_OFFSET);

                    const pad = (n) => String(n).padStart(2, "0");

                    const formatted = `${dateIST.getFullYear()}-${pad(
                        dateIST.getMonth() + 1
                    )}-${pad(dateIST.getDate())} ${pad(
                        dateIST.getHours()
                    )}:${pad(dateIST.getMinutes())}:${pad(
                        dateIST.getSeconds()
                    )}`;

                    console.log("✅ Calculated next_due_date:", formatted);

                    // ✅ Update DB
                    const updateQuery = `
                        UPDATE users 
                        SET next_duedate = ?
                        WHERE razorpay_subscription_id = ? AND customer_id = ?
                    `;

                    try {
                        const [result] = await db.execute(updateQuery, [
                            formatted,
                            razorpaySubscriptionId,
                            razorpayCustomerId,
                        ]);
                        console.log("✅ next_duedate updated in DB:", result);
                    } catch (dbErr) {
                        console.error("❌ DB Update Error:", dbErr);
                    }

                    // ✅ SEND EMAIL FOR PAYMENT SUCCESS
                    if (customerEmail) {
                        const msg = formatSuccessMessage (
                            customerName,
                            "10.00",
                            formatted.split(" ")[0]
                        );

                        try {
                            await transporter.sendMail({
                                from: ADMIN_EMAIL,
                                to: customerEmail,
                                subject: "Gudnet Payment Confirmation",
                                text: msg,
                            });

                            console.log("✅ Success Email Sent to", customerEmail);
                        } catch (mailErr) {
                            console.error("❌ Email Sending Error:", mailErr);
                        }
                    }
                }
            }
        }

        // ✅ Handle payment.failed
        if (eventType === "payment.failed") {
            console.log("⚠ Payment Failed Event Triggered");

            if (customerEmail) {
                const today = new Date();
                const pad = (n) => String(n).padStart(2, "0");

                const formattedDate = `${today.getFullYear()}-${pad(
                    today.getMonth() + 1
                )}-${pad(today.getDate())}`;

                const msg = formatFailureMessage (
                    customerName,
                    "10.00",
                    formattedDate
                );

                try {
                    await transporter.sendMail({
                        from: ADMIN_EMAIL,
                        to: customerEmail,
                        subject: "Gudnet Payment Failed",
                        text: msg,
                    });

                    console.log("✅ Failure Email Sent to", customerEmail);
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
