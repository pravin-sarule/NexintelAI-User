
// exports.getAllPlans = async (req, res) => {
//     const { type, interval } = req.query;
//     let query = 'SELECT * FROM subscription_plans';
//     const conditions = [];
//     const values = [];
//     let i = 1;

//     if (type) {
//         conditions.push(`type = $${i++}`);
//         values.push(type);
//     }

//     if (interval) {
//         conditions.push(`"interval" = $${i++}`);
//         values.push(interval);
//     }

//     if (conditions.length > 0) {
//         query += ' WHERE ' + conditions.join(' AND ');
//     }

//     query += ' ORDER BY price ASC';

//     try {
//         const { rows } = await db.query(query, values);
//         return res.status(200).json({ success: true, count: rows.length, data: rows });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

// /**
//  * @desc    Get a single plan by ID
//  * @route   GET /api/admin/plans/:id
//  */
// exports.getPlanById = async (req, res) => {
//     try {
//         const { rows } = await db.query('SELECT * FROM subscription_plans WHERE id = $1', [req.params.id]);
//         if (rows.length === 0) {
//             return res.status(404).json({ success: false, message: 'Plan not found' });
//         }
//         return res.status(200).json({ success: true, data: rows[0] });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };
const db = require('../config/db');

/**
 * @desc    Get all plans grouped by type and interval
 * @route   GET /api/plans/grouped
 * @access  Public
 */
exports.getAllPlans = async (req, res) => {
    const { type, interval } = req.query;

    let queryText = `
        SELECT id, name, description, price, currency, "interval", type, features,
               document_limit, ai_analysis_limit, template_access, token_limit,
               carry_over_limit, limits, razorpay_plan_id, created_at, updated_at
        FROM subscription_plans
    `;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Filter by type
    if (type) {
        if (['individual', 'business'].includes(type)) {
            conditions.push(`type = $${paramIndex++}`);
            values.push(type);
        } else {
            return res.status(400).json({ success: false, message: "Invalid 'type' parameter." });
        }
    }

    // Filter by interval
    if (interval) {
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

    queryText += ' ORDER BY type, "interval", price ASC;';

    try {
        const { rows } = await db.query(queryText, values);

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
