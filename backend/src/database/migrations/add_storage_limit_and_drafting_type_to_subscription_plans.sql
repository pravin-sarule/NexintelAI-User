-- Migration to add storage_limit_gb and drafting_type to subscription_plans table

-- Add storage_limit_gb column
ALTER TABLE subscription_plans
ADD COLUMN storage_limit_gb DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Add drafting_type column
-- Consider using an ENUM type if the types are fixed and few (e.g., 'basic', 'premium')
-- For now, using VARCHAR for flexibility.
ALTER TABLE subscription_plans
ADD COLUMN drafting_type VARCHAR(50) NOT NULL DEFAULT 'basic';

-- Optional: Update existing plans with default values if needed
-- UPDATE subscription_plans SET storage_limit_gb = 10.00 WHERE name = 'Free Plan';
-- UPDATE subscription_plans SET drafting_type = 'premium' WHERE name = 'Premium Plan';