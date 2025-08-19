const cron = require('node-cron');
const db = require('../config/db');

// Function to reset tokens monthly with carry-over logic
const resetMonthlyTokens = async () => {
    console.log('Running monthly token reset cron job...');
    try {
        // Get all active user subscriptions
        const { rows: subscriptions } = await db.query(
            `SELECT
                us.id AS user_subscription_id,
                us.user_id,
                us.current_token_balance,
                us.last_reset_date,
                sp.token_limit,
                sp.carry_over_limit,
                sp.interval
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.status = 'active';`
        );

        for (const sub of subscriptions) {
            const {
                user_subscription_id,
                user_id,
                current_token_balance,
                last_reset_date,
                token_limit,
                carry_over_limit,
                interval
            } = sub;

            let new_token_balance = 0;
            let next_reset_date = new Date(last_reset_date);

            // Calculate carry-over tokens
            const unusedTokens = current_token_balance;
            const carryOver = Math.min(unusedTokens, carry_over_limit);

            // Determine the next reset date based on the interval
            if (interval === 'month') {
                next_reset_date.setMonth(next_reset_date.getMonth() + 1);
            } else if (interval === 'quarter') {
                next_reset_date.setMonth(next_reset_date.getMonth() + 3);
            } else if (interval === 'year') {
                next_reset_date.setFullYear(next_reset_date.getFullYear() + 1);
            }

            // Only reset if the next reset date is in the past or today
            // This handles cases where the cron might run slightly off schedule
            if (next_reset_date <= new Date()) {
                new_token_balance = token_limit + carryOver;

                await db.query(
                    `UPDATE user_subscriptions
                     SET current_token_balance = $1, last_reset_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $2`,
                    [new_token_balance, user_subscription_id]
                );
                console.log(`User ${user_id}: Tokens reset. New balance: ${new_token_balance} (Plan: ${token_limit}, Carry-over: ${carryOver})`);
            } else {
                console.log(`User ${user_id}: Not yet time for token reset. Next reset on ${next_reset_date.toDateString()}`);
            }
        }
        console.log('Monthly token reset cron job finished.');
    } catch (error) {
        console.error('Error in monthly token reset cron job:', error);
    }
};

// Schedule the cron job to run on the 1st of every month at 00:00 (midnight)
// '0 0 1 * *' means:
// 0   - minute (0-59)
// 0   - hour (0-23)
// 1   - day of month (1-31)
// *   - month (1-12)
// *   - day of week (0-7, Sunday is 0 or 7)
const startCronJobs = () => {
    cron.schedule('0 0 1 * *', resetMonthlyTokens, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Or your desired timezone
    });
    console.log('Cron job for monthly token reset scheduled.');
};

module.exports = {
    startCronJobs,
    resetMonthlyTokens // Export for testing purposes if needed
};