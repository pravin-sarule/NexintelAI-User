const db = require('../config/db'); // Assumes you have a db.js file for your pg pool connection

/**
 * @desc    Get all publicly visible subscription plans (with filtering)
 * @route   GET /api/plans?type=individual&interval=month
 * @access  Public
 */
exports.getAllVisiblePlans = async (req, res) => {
    const { type, interval } = req.query;

    let queryText = 'SELECT * FROM subscription_plans';
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Dynamically build the WHERE clause based on query parameters
    if (type) {
        // Validate input to ensure it's one of the allowed ENUM values
        if (['individual', 'business'].includes(type)) {
            conditions.push(`type = $${paramIndex++}`);
            values.push(type);
        } else {
            return res.status(400).json({ success: false, message: "Invalid 'type' parameter." });
        }
    }
    if (interval) {
        // Validate input to ensure it's one of the allowed ENUM values
        if (['month', 'year', 'quarter'].includes(interval)) {
            conditions.push(`"interval" = $${paramIndex++}`);
            values.push(interval);
        } else {
            return res.status(400).json({ success: false, message: "Invalid 'interval' parameter." });
        }
    }

    if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Order results for a consistent and user-friendly display
    queryText += ' ORDER BY type, "interval", price ASC;';

    try {
        const { rows } = await db.query(queryText, values);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
