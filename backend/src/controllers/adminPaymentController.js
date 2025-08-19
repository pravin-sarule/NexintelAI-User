const db = require('../config/db');

/**
 * @desc    Get all payment history (Admin only)
 * @route   GET /api/admin/payments
 * @access  Private (Admin)
 */
exports.getAllPaymentHistory = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT
                p.id AS payment_id,
                p.razorpay_payment_id,
                p.amount,
                p.currency,
                p.status AS payment_status,
                p.payment_method,
                p.created_at AS payment_date,
                u.id AS user_id,
                u.username,
                u.email,
                us.razorpay_subscription_id,
                sp.name AS plan_name,
                sp.interval AS plan_interval
            FROM payments p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN user_subscriptions us ON p.subscription_id = us.id
            LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
            ORDER BY p.created_at DESC;`
        );
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching all payment history:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get payment history for a specific user (Admin only)
 * @route   GET /api/admin/users/:userId/payments
 * @access  Private (Admin)
 */
exports.getUserPaymentHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const { rows } = await db.query(
            `SELECT
                p.id AS payment_id,
                p.razorpay_payment_id,
                p.amount,
                p.currency,
                p.status AS payment_status,
                p.payment_method,
                p.created_at AS payment_date,
                u.id AS user_id,
                u.username,
                u.email,
                us.razorpay_subscription_id,
                sp.name AS plan_name,
                sp.interval AS plan_interval
            FROM payments p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN user_subscriptions us ON p.subscription_id = us.id
            LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE u.id = $1
            ORDER BY p.created_at DESC;`,
            [userId]
        );
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching user payment history:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};