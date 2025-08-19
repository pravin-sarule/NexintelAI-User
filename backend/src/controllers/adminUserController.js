const db = require('../config/db');

/**
 * @desc    Get all users with their current token balances (Admin only)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
exports.getAllUsersWithTokenBalances = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT
                u.id AS user_id,
                u.username,
                u.email,
                u.role,
                u.is_blocked,
                us.current_token_balance,
                us.last_reset_date,
                us.status AS subscription_status,
                sp.name AS plan_name,
                sp.token_limit,
                sp.carry_over_limit,
                sp.interval AS plan_interval
            FROM users u
            LEFT JOIN user_subscriptions us ON u.id = us.user_id
            LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
            ORDER BY u.created_at DESC;`
        );
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        console.error('Error fetching all users with token balances:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get a single user's details with token balance (Admin only)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin)
 */
exports.getUserWithTokenBalanceById = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            `SELECT
                u.id AS user_id,
                u.username,
                u.email,
                u.role,
                u.is_blocked,
                us.current_token_balance,
                us.last_reset_date,
                us.status AS subscription_status,
                sp.name AS plan_name,
                sp.token_limit,
                sp.carry_over_limit,
                sp.interval AS plan_interval
            FROM users u
            LEFT JOIN user_subscriptions us ON u.id = us.user_id
            LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE u.id = $1;`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching user with token balance by ID:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};