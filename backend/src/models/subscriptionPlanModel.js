const db = require('../config/db');

// Schema for subscription_plans
// This table will store the details of different subscription plans available.
const createSubscriptionPlansTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'INR',
                interval VARCHAR(50) NOT NULL, -- e.g., 'month', 'year', 'quarter'
                token_limit INT NOT NULL,
                carry_over_limit INT NOT NULL,
                razorpay_plan_id VARCHAR(255), -- Stores the Razorpay Plan ID
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Subscription_plans table created or already exists.');
    } catch (error) {
        console.error('Error creating subscription_plans table:', error);
    }
};

// Schema for user_subscriptions
// This table will link users to their active subscriptions and manage their token balances.
const createUserSubscriptionsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
                razorpay_subscription_id VARCHAR(255) UNIQUE, -- Razorpay Subscription ID
                status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'active', 'cancelled', 'pending', 'halted'
                current_token_balance INT NOT NULL,
                last_reset_date DATE NOT NULL,
                start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP WITH TIME ZONE, -- For fixed-term subscriptions or tracking
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id) -- A user can only have one active subscription at a time
            );
        `);
        console.log('User_subscriptions table created or already exists.');
    } catch (error) {
        console.error('Error creating user_subscriptions table:', error);
    }
};

// Schema for payments
// This table will store details of all Razorpay payments.
const createPaymentsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                subscription_id INT REFERENCES user_subscriptions(id) ON DELETE SET NULL, -- Link to user_subscriptions
                razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
                razorpay_order_id VARCHAR(255),
                razorpay_signature VARCHAR(255),
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) DEFAULT 'INR',
                status VARCHAR(50) NOT NULL, -- e.g., 'captured', 'failed', 'pending'
                payment_method VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Payments table created or already exists.');
    } catch (error) {
        console.error('Error creating payments table:', error);
    }
};

// Schema for token_usage_logs
// This table will log every token usage by users for auditing and analytics.
const createTokenUsageLogsTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS token_usage_logs (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                tokens_used INT NOT NULL,
                action_description TEXT, -- e.g., 'AI API call', 'Document processing'
                used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Token_usage_logs table created or already exists.');
    } catch (error) {
        console.error('Error creating token_usage_logs table:', error);
    }
};

module.exports = {
    createSubscriptionPlansTable,
    createUserSubscriptionsTable,
    createPaymentsTable,
    createTokenUsageLogsTable
};