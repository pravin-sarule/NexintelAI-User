const Razorpay = require('razorpay');
const db = require('../config/db');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a Razorpay order for subscription
 * @route   POST /api/payments/order
 * @access  Private (Authenticated User)
 */
exports.createOrder = async (req, res) => {
    console.log('--- Entering createOrder controller ---');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    const { planId } = req.body;
    const userId = req.user ? req.user.id : null; // Assuming user ID is available from authentication middleware
    console.log('planId:', planId, 'userId:', userId);

    if (!userId) {
        console.error('Error in createOrder: User ID is missing from req.user. Check authentication middleware.');
        return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found.' });
    }

    if (!planId) {
        return res.status(400).json({ success: false, message: 'Plan ID is required.' });
    }

    try {
        // Fetch plan details from your database
        const planResult = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
        const plan = planResult.rows[0];
        console.log('Fetched plan details:', plan);

        if (!plan) {
            console.error('Error in createOrder: Subscription plan not found for planId:', planId);
            return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
        }

        if (!plan.razorpay_plan_id) {
            console.error('Error in createOrder: Razorpay Plan ID is missing for plan:', plan);
            return res.status(400).json({ success: false, message: 'Razorpay Plan ID is missing for the selected plan. Please ensure the plan was created via Admin API.' });
        }

        console.log('Attempting to create Razorpay subscription with plan_id:', plan.razorpay_plan_id);
        // Create a Razorpay subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.razorpay_plan_id,
            customer_notify: 1, // 1 to send notification to customer
            total_count: 12, // Example: 12 billing cycles. Adjust as per your plan logic.
            start_at: Math.floor(Date.now() / 1000), // Start immediately
            addons: [],
            notes: {
                user_id: userId,
                plan_id: plan.id,
            }
        });
        console.log('Razorpay subscription created:', subscription.id);

        // Save initial subscription details to user_subscriptions table
        // Status will be updated by webhook after successful payment
        await db.query(
            `INSERT INTO user_subscriptions (user_id, plan_id, razorpay_subscription_id, current_token_balance, last_reset_date, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id) DO UPDATE SET
                plan_id = EXCLUDED.plan_id,
                razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
                current_token_balance = EXCLUDED.current_token_balance,
                last_reset_date = EXCLUDED.last_reset_date,
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, plan.id, subscription.id, 0, new Date(), 'pending'] // Initial balance 0, status pending
        );

        res.status(200).json({
            success: true,
            order: {
                id: subscription.id, // Use subscription ID as order ID for checkout
                amount: plan.price * 100,
                currency: plan.currency,
                receipt: `receipt_${userId}_${Date.now()}`,
                notes: {
                    plan_id: plan.id,
                    user_id: userId,
                }
            },
            razorpaySubscription: subscription
        });

    } catch (error) {
        console.error('Error creating Razorpay order/subscription:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (Razorpay)
 */
exports.handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const crypto = require('crypto');

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body.event;
        const payload = req.body.payload;

        try {
            switch (event) {
                case 'subscription.activated':
                    const subscriptionId = payload.subscription.entity.id;
                    const userId = payload.subscription.entity.notes.user_id;
                    const planId = payload.subscription.entity.notes.plan_id;

                    // Fetch plan details to get token_limit
                    const planResult = await db.query('SELECT token_limit FROM subscription_plans WHERE id = $1', [planId]);
                    const tokenLimit = planResult.rows[0] ? planResult.rows[0].token_limit : 0;

                    await db.query(
                        `UPDATE user_subscriptions
                         SET status = $1, current_token_balance = $2, last_reset_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
                         WHERE razorpay_subscription_id = $3 AND user_id = $4`,
                        ['active', tokenLimit, subscriptionId, userId]
                    );
                    console.log(`Subscription ${subscriptionId} activated for user ${userId}. Tokens assigned: ${tokenLimit}`);
                    break;

                case 'payment.captured':
                    const paymentEntity = payload.payment.entity;
                    const subscriptionEntity = payload.subscription ? payload.subscription.entity : null; // Payment might be for a subscription or standalone
                    const paymentUserId = paymentEntity.notes.user_id;
                    const paymentPlanId = paymentEntity.notes.plan_id;
                    const subscriptionDbId = subscriptionEntity ? (await db.query('SELECT id FROM user_subscriptions WHERE razorpay_subscription_id = $1', [subscriptionEntity.id])).rows[0]?.id : null;

                    await db.query(
                        `INSERT INTO payments (user_id, subscription_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency, status, payment_method)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [
                            paymentUserId,
                            subscriptionDbId,
                            paymentEntity.id,
                            paymentEntity.order_id,
                            paymentEntity.signature,
                            paymentEntity.amount / 100, // Convert paisa to actual amount
                            paymentEntity.currency,
                            paymentEntity.status,
                            paymentEntity.method
                        ]
                    );
                    console.log(`Payment ${paymentEntity.id} captured for user ${paymentUserId}.`);
                    break;

                case 'subscription.cancelled':
                    const cancelledSubscriptionId = payload.subscription.entity.id;
                    await db.query(
                        `UPDATE user_subscriptions
                         SET status = $1, updated_at = CURRENT_TIMESTAMP
                         WHERE razorpay_subscription_id = $2`,
                        ['cancelled', cancelledSubscriptionId]
                    );
                    console.log(`Subscription ${cancelledSubscriptionId} cancelled.`);
                    break;

                // Add other event handlers as needed (e.g., payment.failed, subscription.halted)
                default:
                    console.log(`Unhandled Razorpay event: ${event}`);
            }
            res.status(200).json({ success: true, message: 'Webhook received and processed.' });
        } catch (error) {
            console.error('Error processing Razorpay webhook:', error.message, error.stack);
            res.status(500).json({ success: false, message: 'Error processing webhook', error: error.message });
        }
    } else {
        console.warn('Invalid Razorpay webhook signature.');
        res.status(403).json({ success: false, message: 'Invalid signature.' });
    }
};