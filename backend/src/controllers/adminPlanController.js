const db = require('../config/db');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a new subscription plan (Admin only)
 * @route   POST /api/admin/plans
 * @access  Private (Admin)
 */
exports.createPlan = async (req, res) => {
    const { name, description, price, currency, interval, token_limit, carry_over_limit } = req.body;

    // Basic validation
    if (!name || !price || !interval || !token_limit || !carry_over_limit) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields: name, price, interval, token_limit, carry_over_limit' });
    }

    if (!['month', 'year', 'quarter'].includes(interval)) {
        return res.status(400).json({ success: false, message: "Invalid 'interval'. Must be 'month', 'year', or 'quarter'." });
    }

    try {
        // Create plan in Razorpay
        const razorpayInterval = interval === 'quarter' ? 'month' : interval; // Razorpay doesn't have 'quarter', use 'month' and adjust periods
        const period = interval === 'quarter' ? 3 : 1; // 3 months for a quarter

        const razorpayPlan = await razorpay.plans.create({
            period: razorpayInterval,
            interval: period,
            item: {
                name: name,
                amount: price * 100, // Amount in paisa
                currency: currency || 'INR',
                description: description || `Subscription plan: ${name}`
            },
            notes: {
                token_limit: token_limit,
                carry_over_limit: carry_over_limit
            }
        });

        // Save plan details to your database
        const result = await db.query(
            `INSERT INTO subscription_plans (name, description, price, currency, interval, token_limit, carry_over_limit, razorpay_plan_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, description, price, currency || 'INR', interval, token_limit, carry_over_limit, razorpayPlan.id]
        );

        res.status(201).json({ success: true, data: result.rows[0], razorpayPlan });

    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Update an existing subscription plan (Admin only)
 * @route   PUT /api/admin/plans/:id
 * @access  Private (Admin)
 */
exports.updatePlan = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, currency, interval, token_limit, carry_over_limit } = req.body;

    try {
        // First, check if the plan exists in your DB
        const existingPlan = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [id]);
        if (existingPlan.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Plan not found.' });
        }

        // Note: Razorpay API does not allow updating existing plans directly.
        // To "update" a plan, you typically create a new plan in Razorpay
        // and then update the razorpay_plan_id in your database.
        // For simplicity, this example will only update the local DB record.
        // A more robust solution would involve managing plan versions or
        // guiding the admin to create a new plan in Razorpay and then
        // updating the reference here.

        const result = await db.query(
            `UPDATE subscription_plans SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                currency = COALESCE($4, currency),
                interval = COALESCE($5, interval),
                token_limit = COALESCE($6, token_limit),
                carry_over_limit = COALESCE($7, carry_over_limit),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [name, description, price, currency, interval, token_limit, carry_over_limit, id]
        );

        res.status(200).json({ success: true, data: result.rows[0] });

    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Delete a subscription plan (Admin only)
 * @route   DELETE /api/admin/plans/:id
 * @access  Private (Admin)
 */
exports.deletePlan = async (req, res) => {
    const { id } = req.params;

    try {
        // Optionally, you might want to deactivate/delete the plan in Razorpay as well.
        // Razorpay does not have a direct "delete plan" API, but you can mark it inactive
        // or simply stop using it. For this implementation, we only delete from our DB.

        const result = await db.query('DELETE FROM subscription_plans WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Plan not found.' });
        }

        res.status(200).json({ success: true, message: 'Plan deleted successfully.' });

    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get all subscription plans (Admin only)
 * @route   GET /api/admin/plans
 * @access  Private (Admin)
 */
exports.getAllPlans = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM subscription_plans ORDER BY created_at DESC');
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching all plans:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get a single subscription plan by ID (Admin only)
 * @route   GET /api/admin/plans/:id
 * @access  Private (Admin)
 */
exports.getPlanById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Plan not found.' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching plan by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};