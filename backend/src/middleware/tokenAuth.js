// const db = require('../config/db');

// /**
//  * @desc    Middleware to check and deduct user tokens for API usage
//  * @param   {number} tokensRequired - The number of tokens required for the current action.
//  */
// const checkTokenUsage = (tokensRequired) => async (req, res, next) => {
//     const userId = req.user.id; // Assuming user ID is available from authentication middleware

//     if (!userId) {
//         return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found.' });
//     }

//     try {
//         // Fetch user's current subscription and token balance
//         const userSubscriptionResult = await db.query(
//             `SELECT current_token_balance, status
//              FROM user_subscriptions
//              WHERE user_id = $1`,
//             [userId]
//         );

//         const userSubscription = userSubscriptionResult.rows[0];

//         if (!userSubscription || userSubscription.status !== 'active') {
//             return res.status(403).json({ success: false, message: 'Forbidden: No active subscription found.' });
//         }

//         const currentBalance = userSubscription.current_token_balance;

//         if (currentBalance >= tokensRequired) {
//             // Deduct tokens
//             const newBalance = currentBalance - tokensRequired;
//             await db.query(
//                 `UPDATE user_subscriptions
//                  SET current_token_balance = $1, updated_at = CURRENT_TIMESTAMP
//                  WHERE user_id = $2`,
//                 [newBalance, userId]
//             );

//             // Log token usage
//             await db.query(
//                 `INSERT INTO token_usage_logs (user_id, tokens_used, action_description)
//                  VALUES ($1, $2, $3)`,
//                 [userId, tokensRequired, req.originalUrl] // Log the API endpoint as action description
//             );

//             req.user.current_token_balance = newBalance; // Update user object in request for subsequent middleware/controllers
//             next();
//         } else {
//             return res.status(403).json({ success: false, message: 'Forbidden: Insufficient tokens.' });
//         }

//     } catch (error) {
//         console.error('Error in token usage middleware:', error);
//         res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//     }
// };

// module.exports = {
//     checkTokenUsage
// };

const db = require('../config/db');

/**
 * @desc Middleware to check and deduct tokens from a user
 * @param {number} tokensRequired
 */
const checkTokenUsage = (tokensRequired) => async (req, res, next) => {
  const userId = req.user?.id || req.userId;

  if (!userId) {
    console.error("❌ checkTokenUsage: No user ID found in request");
    return res.status(401).json({ success: false, message: 'Unauthorized: User ID not found.' });
  }

  try {
    // Fetch user's subscription
    const result = await db.query(`
      SELECT current_token_balance, status 
      FROM user_subscriptions 
      WHERE user_id = $1
    `, [userId]);

    const userSub = result.rows[0];

    if (!userSub || userSub.status !== 'active') {
      return res.status(403).json({ success: false, message: 'No active subscription found.' });
    }

    if (userSub.current_token_balance >= tokensRequired) {
      const newBalance = userSub.current_token_balance - tokensRequired;

      // Update token balance
      await db.query(`
        UPDATE user_subscriptions
        SET current_token_balance = $1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [newBalance, userId]);

      // Log token usage
      await db.query(`
        INSERT INTO token_usage_logs (user_id, tokens_used, action_description)
        VALUES ($1, $2, $3)
      `, [userId, tokensRequired, req.originalUrl]);

      req.user.current_token_balance = newBalance;
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Insufficient tokens.' });
    }
  } catch (err) {
    console.error("❌ Error in checkTokenUsage middleware:", err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  checkTokenUsage
};
