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
                return true;
            } catch (err) {
                console.error("❌ Transaction Insert Error:", err);
                return false;
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
        let paymentId = null;
        let orderId = null;
        let invoiceId = null;
        let paymentAmount = null;
        let paymentMethod = null;
        let paymentBank = null;
        let paymentCard = null;
        let paymentWallet = null;
        let subscriptionId = null;
        let planId = null;

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

            // Extract payment details
            paymentId = payment?.id || null;
            orderId = payment?.order_id || null;
            invoiceId = payment?.invoice_id || null;
            paymentAmount = payment?.amount ? (payment.amount / 100).toFixed(2) : null;
            paymentMethod = payment?.method || null;
            paymentBank = payment?.bank || null;
            paymentCard = payment?.card?.network || null;
            paymentWallet = payment?.wallet || null;

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

            // 6️⃣ Try to get customer info from subscription if not available
            if (!customerEmail && subscriptionEntity?.customer_id) {
                try {
                    const customer = await razorpay.customers.fetch(subscriptionEntity.customer_id);
                    customerEmail = customer.email;
                    customerName = customer.name || "Customer";
                } catch (err) {
                    console.log("❌ Customer fetch error:", err);
                }
            }

            // 7️⃣ Try to get customer info from payment if still not available
            if (!customerEmail && payment?.customer_id) {
                try {
                    const customer = await razorpay.customers.fetch(payment.customer_id);
                    customerEmail = customer.email;
                    customerName = customer.name || "Customer";
                } catch (err) {
                    console.log("❌ Customer fetch error from payment:", err);
                }
            }

            // 8️⃣ Save payment transaction FIRST
            const transactionSaved = await logTransaction({
                customer_id: payment?.customer_id || subscriptionEntity?.customer_id || null,
                plan_name: planNameFinal,
                order_id: orderId,
                payment_id: paymentId,
                plan_id: planId,
                subscription_id: subscriptionId,
                amount: paymentAmount,
                transaction_status: eventType,
                invoice_id: invoiceId
            });

            console.log("💾 Transaction saved for:", eventType, "Status:", transactionSaved);

            // ======================================================
            //          SEND EMAIL AFTER DB STORAGE
            // ======================================================
            if (transactionSaved && customerEmail && customerName) {
                try {
                    const todayDate = new Date().toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    const todayTime = new Date().toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });

                    // Format payment method for display
                    const formatPaymentMethod = (method) => {
                        if (!method) return "Not specified";
                        return method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ');
                    };

                    // Format payment details string
                    const paymentDetails = `
Payment ID: ${paymentId || "N/A"}
Order ID: ${orderId || "N/A"}
Amount: ${planCurrency} ${paymentAmount || planAmount || "N/A"}
Payment Method: ${formatPaymentMethod(paymentMethod)}
${paymentBank ? `Bank: ${paymentBank}` : ''}
${paymentCard ? `Card: ${paymentCard}` : ''}
${paymentWallet ? `Wallet: ${paymentWallet}` : ''}
Date: ${todayDate}
Time: ${todayTime}
                    `.trim();

                    // Email templates for different payment events
                    const emailTemplates = {
                        "payment.authorized": {
                            subject: "Gulf Worker Payment Authorized",
                            message: `Dear ${customerName},

Your payment for the Gulf Worker ${planNameFinal} plan has been authorized.

${paymentDetails}

The amount will be captured shortly. You will receive another confirmation once the payment is successfully processed.

Thank you for choosing Gulf Worker!`
                        },
                        "payment.captured": {
                            subject: "Gulf Worker Payment Successful",
                            message: `Dear ${customerName},

Your payment for the Gulf Worker ${planNameFinal} plan has been successfully processed.

${paymentDetails}

Thank you for staying connected with Gulf Worker. Your subscription is now active and you can continue to enjoy our services.

If you have any questions, please contact our support team.`
                        },
                        "payment.failed": {
                            subject: "Gulf Worker Payment Failed",
                            message: `Dear ${customerName},

We were unable to process your payment for the Gulf Worker ${planNameFinal} plan.

${paymentDetails}

Please update your payment method to avoid service interruption. You can update your payment details in your account settings.

If this issue persists, please contact our support team for assistance.`
                        },
                        "payment.dispute.created": {
                            subject: "Payment Dispute Created",
                            message: `Dear ${customerName},

A dispute has been created for your recent payment.

${paymentDetails}

We are reviewing this matter and will keep you updated on the resolution. Please ensure you have all relevant transaction details available.

For any questions regarding this dispute, please contact our support team.`
                        },
                        "payment.dispute.won": {
                            subject: "Payment Dispute Resolved in Your Favor",
                            message: `Dear ${customerName},

We're happy to inform you that the dispute for your payment has been resolved in your favor.

${paymentDetails}

The disputed amount has been credited back to your account. Thank you for your patience and cooperation throughout this process.`
                        },
                        "payment.dispute.lost": {
                            subject: "Payment Dispute Update",
                            message: `Dear ${customerName},

The dispute for your payment has been resolved.

${paymentDetails}

Please contact our support team for more details about this resolution and any further steps that may be required.`
                        },
                        "payment.dispute.closed": {
                            subject: "Payment Dispute Closed",
                            message: `Dear ${customerName},

The dispute for your payment has been closed.

${paymentDetails}

If you have any questions about this closure, please don't hesitate to contact our support team.`
                        },
                        "payment.dispute.under_review": {
                            subject: "Payment Dispute Under Review",
                            message: `Dear ${customerName},

Your payment dispute is currently under review.

${paymentDetails}

We are working to resolve this matter and will notify you once we have an update. Thank you for your patience.`
                        },
                        "payment.dispute.action_required": {
                            subject: "Action Required - Payment Dispute",
                            message: `Dear ${customerName},

Your attention is required regarding a payment dispute.

${paymentDetails}

Please check your email for further instructions or contact our support team immediately to resolve this matter.`
                        },
                        "payment.downtime.started": {
                            subject: "Payment System Notice",
                            message: `Dear ${customerName},

We've detected a temporary issue with our payment system.

${paymentDetails}

Your payment may be affected by this issue. Our team is working to resolve this as quickly as possible. We apologize for any inconvenience.`
                        },
                        "payment.downtime.updated": {
                            subject: "Payment System Update",
                            message: `Dear ${customerName},

We have an update regarding the payment system issue.

${paymentDetails}

We're continuing to work on the resolution and will keep you informed of our progress. Thank you for your patience.`
                        },
                        "payment.downtime.resolved": {
                            subject: "Payment System Restored",
                            message: `Dear ${customerName},

The payment system issue has been resolved.

${paymentDetails}

Your payments should now process normally. We apologize for any inconvenience caused and thank you for your patience.`
                        }
                    };

                    const template = emailTemplates[eventType] || {
                        subject: `Gulf Worker Payment Update - ${eventType}`,
                        message: `Dear ${customerName},

There's an update regarding your payment for the Gulf Worker ${planNameFinal} plan.

${paymentDetails}

Event Type: ${eventType}

If you have any questions, please contact our support team.`
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
            } else {
                console.log(`❌ Cannot send email: transactionSaved=${transactionSaved}, customerEmail=${!!customerEmail}, customerName=${!!customerName}`);
            }
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

        res.status(200).send("OK");

    } catch (err) {
        console.error("❌ Webhook Exception:", err);
        res.status(500).send("Server error");
    }
});

module.exports = router;