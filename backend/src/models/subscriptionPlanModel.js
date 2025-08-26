// const db = require('../config/db');

// // Schema for subscription_plans
// // This table will store the details of different subscription plans available.
// const createSubscriptionPlansTable = async () => {
//     try {
//         // Create or replace the ENUM type for plan intervals
//         await db.query(`
//             DO $$ BEGIN
//                 IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_interval') THEN
//                     CREATE TYPE plan_interval AS ENUM ('month', 'year', 'quarter');
//                 ELSE
//                     -- Add new values to the ENUM if they don't exist
//                     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'plan_interval'::regtype AND enumlabel = 'month') THEN
//                         ALTER TYPE plan_interval ADD VALUE 'month';
//                     END IF;
//                     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'plan_interval'::regtype AND enumlabel = 'year') THEN
//                         ALTER TYPE plan_interval ADD VALUE 'year';
//                     END IF;
//                     IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'plan_interval'::regtype AND enumlabel = 'quarter') THEN
//                         ALTER TYPE plan_interval ADD VALUE 'quarter';
//                     END IF;
//                 END IF;
//             END $$;
//         `);

//         await db.query(`
//             CREATE TABLE IF NOT EXISTS subscription_plans (
//                 id SERIAL PRIMARY KEY,
//                 name VARCHAR(255) NOT NULL UNIQUE,
//                 description TEXT,
//                 price DECIMAL(10, 2) NOT NULL,
//                 currency VARCHAR(3) DEFAULT 'INR',
//                 interval plan_interval NOT NULL, -- Use the ENUM type
//                 type VARCHAR(50) NOT NULL DEFAULT 'individual', -- e.g., 'individual', 'business'
//                 token_limit INT NOT NULL,
//                 carry_over_limit INT NOT NULL,
//                 document_limit INT NOT NULL DEFAULT 0,
//                 ai_analysis_limit INT NOT NULL DEFAULT 0,
//                 template_access VARCHAR(50) NOT NULL DEFAULT 'free',
//                 limits JSONB, -- For flexible limits, if needed
//                 razorpay_plan_id VARCHAR(255), -- Stores the Razorpay Plan ID
//                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//                 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//             );
//         `);
//         console.log('Subscription_plans table created or already exists.');
//     } catch (error) {
//         console.error('Error creating subscription_plans table:', error);
//     }
// };

// // Schema for user_subscriptions
// // This table will link users to their active subscriptions and manage their token balances.
// const createUserSubscriptionsTable = async () => {
//     try {
//         await db.query(`
//             CREATE TABLE IF NOT EXISTS user_subscriptions (
//                 id SERIAL PRIMARY KEY,
//                 user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//                 plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
//                 razorpay_subscription_id VARCHAR(255) UNIQUE, -- Razorpay Subscription ID
//                 status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'active', 'cancelled', 'pending', 'halted'
//                 current_token_balance INT NOT NULL,
//                 last_reset_date DATE NOT NULL,
//                 start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//                 end_date TIMESTAMP WITH TIME ZONE, -- For fixed-term subscriptions or tracking
//                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//                 updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//                 UNIQUE(user_id) -- A user can only have one active subscription at a time
//             );
//         `);
//         console.log('User_subscriptions table created or already exists.');
//     } catch (error) {
//         console.error('Error creating user_subscriptions table:', error);
//     }
// };

// // Schema for payments
// // This table will store details of all Razorpay payments.
// const createPaymentsTable = async () => {
//     try {
//         await db.query(`
//             CREATE TABLE IF NOT EXISTS payments (
//                 id SERIAL PRIMARY KEY,
//                 user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//                 subscription_id INT REFERENCES user_subscriptions(id) ON DELETE SET NULL, -- Link to user_subscriptions
//                 razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
//                 razorpay_order_id VARCHAR(255),
//                 razorpay_signature VARCHAR(255),
//                 amount DECIMAL(10, 2) NOT NULL,
//                 currency VARCHAR(3) DEFAULT 'INR',
//                 status VARCHAR(50) NOT NULL, -- e.g., 'captured', 'failed', 'pending'
//                 payment_method VARCHAR(50),
//                 created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//             );
//         `);
//         console.log('Payments table created or already exists.');
//     } catch (error) {
//         console.error('Error creating payments table:', error);
//     }
// };

// // Schema for token_usage_logs
// // This table will log every token usage by users for auditing and analytics.
// const createTokenUsageLogsTable = async () => {
//     try {
//         await db.query(`
//             CREATE TABLE IF NOT EXISTS token_usage_logs (
//                 id SERIAL PRIMARY KEY,
//                 user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//                 tokens_used INT NOT NULL,
//                 action_description TEXT, -- e.g., 'AI API call', 'Document processing'
//                 used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//             );
//         `);
//         console.log('Token_usage_logs table created or already exists.');
//     } catch (error) {
//         console.error('Error creating token_usage_logs table:', error);
//     }
// };

// module.exports = {
//     createSubscriptionPlansTable,
//     createUserSubscriptionsTable,
//     createPaymentsTable,
//     createTokenUsageLogsTable
// };

const db = require('../config/db');

// ENUM: plan_interval (month, quarter, year)
const createPlanIntervalEnum = async () => {
  try {
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_interval') THEN
          CREATE TYPE plan_interval AS ENUM ('month', 'quarter', 'year');
        END IF;
      END $$;
    `);
  } catch (err) {
    console.error("❌ Failed to create ENUM 'plan_interval':", err.message);
  }
};

const createSubscriptionPlansTable = async () => {
  try {
    await createPlanIntervalEnum();

    await db.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        interval plan_interval NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'individual',
        token_limit INT NOT NULL,
        carry_over_limit INT NOT NULL,
        document_limit INT NOT NULL DEFAULT 0,
        ai_analysis_limit INT NOT NULL DEFAULT 0,
        template_access VARCHAR(50) NOT NULL DEFAULT 'free',
        limits JSONB,
        razorpay_plan_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ subscription_plans table ready.");
  } catch (err) {
    console.error("❌ Failed to create subscription_plans table:", err.message);
  }
};

const createUserSubscriptionsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
        razorpay_subscription_id VARCHAR(255) UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'active', 'cancelled', etc.
        current_token_balance INT NOT NULL,
        last_reset_date DATE NOT NULL,
        start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id) -- one active subscription per user
      );
    `);

    console.log("✅ user_subscriptions table ready.");
  } catch (err) {
    console.error("❌ Failed to create user_subscriptions table:", err.message);
  }
};

const createPaymentsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_id INT REFERENCES user_subscriptions(id) ON DELETE SET NULL,
        razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
        razorpay_order_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ payments table ready.");
  } catch (err) {
    console.error("❌ Failed to create payments table:", err.message);
  }
};

const createTokenUsageLogsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS token_usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tokens_used INT NOT NULL,
        action_description TEXT,
        used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ token_usage_logs table ready.");
  } catch (err) {
    console.error("❌ Failed to create token_usage_logs table:", err.message);
  }
};

module.exports = {
  createSubscriptionPlansTable,
  createUserSubscriptionsTable,
  createPaymentsTable,
  createTokenUsageLogsTable
};
