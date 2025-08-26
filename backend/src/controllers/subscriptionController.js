const pool = require("../db/pool");
const razorpay = require("../lib/razorpay");

exports.createSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { plan_id } = req.body;

    if (!plan_id) return res.status(400).json({ success: false, message: "Plan ID is required" });

    // Fetch plan from DB
    const { rows } = await pool.query(
      `SELECT * FROM subscription_plans WHERE id = $1 LIMIT 1`,
      [plan_id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Plan not found" });

    const plan = rows[0];

    // Create subscription with Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpay_plan_id,
      quantity: 1,
      total_count: 12, // 12 months
      customer_notify: 1,
      notes: {
        user_id: userId.toString(),
        plan_name: plan.name
      }
    });

    // Save to DB
    await pool.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, razorpay_subscription_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'pending', now(), now())`,
      [userId, plan.id, subscription.id]
    );

    res.json({
      success: true,
      subscription_id: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
      plan_name: plan.name
    });
  } catch (err) {
    console.error("Subscription creation error:", err);
    res.status(500).json({ success: false, message: "Failed to create subscription" });
  }
};
