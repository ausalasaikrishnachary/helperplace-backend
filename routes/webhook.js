const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const { transporter, ADMIN_EMAIL } = require("./nodemailer");
const razorpay = require("./razorpay");

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// ============================================================
//                  RAZORPAY WEBHOOK
// ============================================================
router.post("/webhook/razorpay", async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.body.toString(); // express.raw() REQUIRED

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
        console.log("📩 Razorpay Webhook");
        console.log("Event:", eventType);
        console.log("===============================\n");

        const subscriptionEntity = event.payload?.subscription?.entity;
        const paymentEntity = event.payload?.payment?.entity;

        // ======================================================
        // Helper: Insert Transaction Log
        // ======================================================
        async function logTransaction({
            customer_id,
            plan_name,
            order_id,
            payment_id,
            plan_id,
            subscription_id,
            amount,
            transaction_status,
            invoice_id
        }) {
            try {
                await db.execute(
                    `INSERT INTO transactions 
                    (customer_id, plan_name, order_id, payment_id, plan_id, subscription_id, amount, transaction_status, invoice_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        customer_id,
                        plan_name,
                        order_id,
                        payment_id,
                        plan_id,
                        subscription_id,
                        amount,
                        transaction_status,
                        invoice_id
                    ]
                );

                console.log(`💾 Stored Transaction: ${transaction_status}`);

            } catch (err) {
                console.error("❌ Transaction Insert Error:", err);
            }
        }

        // ======================================================
        // Fetch customer & plan info (used in emails)
        // ======================================================
        let customerEmail = null;
        let customerName = null;
        let planNameFinal = null;
        let planAmount = null;
        let planCurrency = null;

        if (subscriptionEntity?.customer_id) {
            try {
                const customer = await razorpay.customers.fetch(subscriptionEntity.customer_id);
                customerEmail = customer.email;
                customerName = customer.name || "Customer";
            } catch (err) {
                console.log("❌ Customer fetch error:", err);
            }
        }

        const paymentEvents = [
            "payment.authorized",
            "payment.failed",
            "payment.captured",
            "payment.dispute.created",
            "payment.dispute.won",
            "payment.dispute.lost",
            "payment.dispute.closed",
            "payment.dispute.under_review",
            "payment.dispute.action_required",
            "payment.downtime.started",
            "payment.downtime.updated",
            "payment.downtime.resolved",
        ];

        // ======================================================
        //                 PAYMENT EVENTS
        // ======================================================
        if (paymentEvents.includes(eventType)) {
            const payment = paymentEntity;

            let subscriptionId = null;
            let planId = null;

            // 1️⃣ From payment notes
            subscriptionId = payment?.notes?.subscription_id || null;

            // 2️⃣ From order info
            if (!subscriptionId && payment?.order_id) {
                try {
                    const orderInfo = await razorpay.orders.fetch(payment.order_id);
                    subscriptionId = orderInfo.subscription_id || null;
                } catch (err) {
                    console.log("❌ Order fetch error:", err);
                }
            }

            // 3️⃣ From invoice
            if (!subscriptionId && payment?.invoice_id) {
                try {
                    const invoice = await razorpay.invoices.fetch(payment.invoice_id);
                    subscriptionId = invoice.subscription_id || null;
                } catch (err) {
                    console.log("❌ Invoice fetch error:", err);
                }
            }

            // 4️⃣ Fetch subscription → get plan_id
            if (subscriptionId) {
                try {
                    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
                    planId = subscription.plan_id || null;
                } catch (err) {
                    console.log("❌ Subscription fetch error:", err);
                }
            }

            // 5️⃣ Fetch plan → get plan name, amount, currency
            if (planId) {
                try {
                    const plan = await razorpay.plans.fetch(planId);
                    planNameFinal = plan?.item?.name || "Plan";
                    planAmount = plan.amount ? (plan.amount / 100).toFixed(2) : null;
                    planCurrency = plan.currency?.toUpperCase() || "INR";
                } catch (err) {
                    console.log("❌ Plan fetch error:", err);
                }
            }

            // 6️⃣ Save payment transaction
            await logTransaction({
                customer_id: payment?.customer_id || subscriptionEntity?.customer_id || null,
                plan_name: planNameFinal,
                order_id: payment?.order_id || null,
                payment_id: payment?.id || null,
                plan_id: planId,
                subscription_id: subscriptionId,
                amount: payment?.amount ? (payment.amount / 100).toFixed(2) : null,
                transaction_status: eventType,
                invoice_id: payment?.invoice_id || null
            });

            console.log("💾 Transaction saved for:", eventType);
        }

        // ======================================================
        //     subscription.charged → Update Due Date
        // ======================================================
        if (eventType === "subscription.charged") {
            const sub = subscriptionEntity;

            const razorpaySubscriptionId = sub.id;
            const razorpayCustomerId = sub.customer_id;

            const nextPaymentAttempt = sub.next_payment_attempt;
            const currentEnd = sub.current_end;

            const nextEpoch = nextPaymentAttempt || currentEnd;

            if (nextEpoch) {
                const ISTDate = new Date(nextEpoch * 1000 + 5.5 * 60 * 60 * 1000);

                const pad = (n) => String(n).padStart(2, "0");
                const formatted = `${ISTDate.getFullYear()}-${pad(
                    ISTDate.getMonth() + 1
                )}-${pad(ISTDate.getDate())} ${pad(ISTDate.getHours())}:${pad(
                    ISTDate.getMinutes()
                )}:${pad(ISTDate.getSeconds())}`;

                try {
                    await db.execute(
                        `UPDATE users 
                         SET next_duedate = ?
                         WHERE razorpay_subscription_id = ? AND customer_id = ?`,
                        [formatted, razorpaySubscriptionId, razorpayCustomerId]
                    );

                    console.log("✅ next_duedate updated:", formatted);
                } catch (err) {
                    console.error("❌ DB Update Error:", err);
                }
            }
        }

        // ======================================================
        //          PAYMENT EVENT EMAILS
        // ======================================================
        if (paymentEvents.includes(eventType) && customerEmail && customerName) {
            try {
                const todayDate = new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Email templates for different payment events
                const emailTemplates = {
                    "payment.authorized": {
                        subject: "Gudnet Payment Authorized",
                        message: `Dear ${customerName}, your payment of ${planCurrency} ${planAmount} for the Gudnet ${planNameFinal} plan has been authorized on ${todayDate}. The amount will be captured shortly.`
                    },
                    "payment.captured": {
                        subject: "Gudnet Payment Successful",
                        message: `Dear ${customerName}, your payment of ${planCurrency} ${planAmount} for the Gudnet ${planNameFinal} plan has been successfully debited on ${todayDate}. Thank you for staying connected with Gudnet.`
                    },
                    "payment.failed": {
                        subject: "Gudnet Payment Failed",
                        message: `Dear ${customerName}, your payment for the Gudnet ${planNameFinal} plan on ${todayDate} has failed. Please update your payment method to avoid service interruption.`
                    },
                    "payment.dispute.created": {
                        subject: "Payment Dispute Created",
                        message: `Dear ${customerName}, a dispute has been created for your payment of ${planCurrency} ${planAmount} for the Gudnet ${planNameFinal} plan. We will keep you updated on the resolution.`
                    },
                    "payment.dispute.won": {
                        subject: "Payment Dispute Resolved in Your Favor",
                        message: `Dear ${customerName}, we're happy to inform you that the dispute for your payment of ${planCurrency} ${planAmount} has been resolved in your favor. Thank you for your patience.`
                    },
                    "payment.dispute.lost": {
                        subject: "Payment Dispute Update",
                        message: `Dear ${customerName}, the dispute for your payment of ${planCurrency} ${planAmount} has been resolved. Please contact our support team for more details.`
                    },
                    "payment.dispute.closed": {
                        subject: "Payment Dispute Closed",
                        message: `Dear ${customerName}, the dispute for your payment of ${planCurrency} ${planAmount} has been closed.`
                    },
                    "payment.dispute.under_review": {
                        subject: "Payment Dispute Under Review",
                        message: `Dear ${customerName}, your payment dispute for ${planCurrency} ${planAmount} is currently under review. We'll notify you once we have an update.`
                    },
                    "payment.dispute.action_required": {
                        subject: "Action Required - Payment Dispute",
                        message: `Dear ${customerName}, your attention is required for the payment dispute regarding ${planCurrency} ${planAmount}. Please check your email for further instructions.`
                    },
                    "payment.downtime.started": {
                        subject: "Payment System Notice",
                        message: `Dear ${customerName}, we've detected a temporary issue with our payment system. Your payment of ${planCurrency} ${planAmount} may be affected. We're working to resolve this.`
                    },
                    "payment.downtime.updated": {
                        subject: "Payment System Update",
                        message: `Dear ${customerName}, we have an update regarding the payment system issue. We're continuing to work on the resolution.`
                    },
                    "payment.downtime.resolved": {
                        subject: "Payment System Restored",
                        message: `Dear ${customerName}, the payment system issue has been resolved. Your payments should now process normally.`
                    }
                };

                const template = emailTemplates[eventType] || {
                    subject: `Gudnet Payment Update - ${eventType}`,
                    message: `Dear ${customerName}, there's an update regarding your payment for the Gudnet ${planNameFinal} plan. Event: ${eventType}`
                };

                await transporter.sendMail({
                    from: ADMIN_EMAIL,
                    to: customerEmail,
                    subject: template.subject,
                    text: template.message,
                });

                console.log(`📧 ${eventType} email sent to:`, customerEmail);

            } catch (err) {
                console.error(`❌ Email Error for ${eventType}:`, err);
            }
        }

        res.status(200).send("OK");

    } catch (err) {
        console.error("❌ Webhook Exception:", err);
        res.status(500).send("Server error");
    }
});

module.exports = router;