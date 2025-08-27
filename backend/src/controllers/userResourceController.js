const pool = require('../config/db');
const File = require('../models/File'); // To get total storage used and document count
const TokenUsageService = require('../services/tokenUsageService'); // Import TokenUsageService

// exports.getUserResourceUtilization = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         console.log(`DEBUG: getUserResourceUtilization - User ID: ${userId}`);
//         if (!userId) {
//             console.log("DEBUG: getUserResourceUtilization - Unauthorized: No user ID.");
//             return res.status(401).json({ message: 'Unauthorized' });
//         }

//         // 1. Fetch user's active subscription details
//         const subscriptionQuery = `
//             SELECT
//                 sp.name AS plan_name,
//                 sp.token_limit,
//                 sp.ai_analysis_limit,
//                 sp.document_limit,
//                 sp.template_access
//             FROM
//                 user_subscriptions us
//             JOIN
//                 subscription_plans sp ON us.plan_id = sp.id
//             WHERE
//                 us.user_id = $1 AND us.status = 'active';
//         `;
//         const subscriptionResult = await pool.query(subscriptionQuery, [userId]);

//         if (subscriptionResult.rows.length === 0) {
//             return res.status(404).json({ message: 'No active subscription found for this user.' });
//         }

//         const {
//             plan_name,
//             token_limit,
//             ai_analysis_limit,
//             document_limit,
//             template_access
//         } = subscriptionResult.rows[0];

//         // Fetch current token balance and total tokens used from TokenUsageService
//         const currentTokenBalance = await TokenUsageService.getRemainingTokens(userId);
//         const totalTokensUsed = await TokenUsageService.getTotalTokensUsed(userId);
//         console.log(`DEBUG: getUserResourceUtilization - currentTokenBalance: ${currentTokenBalance}, totalTokensUsed: ${totalTokensUsed}`);

//         // 2. Fetch user's total storage used
//         const totalStorageUsedBytes = await File.getTotalStorageUsed(userId);
//         const totalStorageUsedGB = (totalStorageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
//         const maxStorageGB = (MAX_STORAGE_BYTES / (1024 * 1024 * 1024)).toFixed(2);
//         console.log(`DEBUG: getUserResourceUtilization - totalStorageUsedBytes: ${totalStorageUsedBytes}, totalStorageUsedGB: ${totalStorageUsedGB}, maxStorageGB: ${maxStorageGB}`);

//         // 3. Fetch user's document count
//         const documentCountResult = await pool.query(
//             `SELECT COUNT(*) FROM user_files WHERE user_id = $1 AND is_folder = FALSE;`,
//             [userId]
//         );
//         const currentDocumentCount = parseInt(documentCountResult.rows[0].count, 10);
//         console.log(`DEBUG: getUserResourceUtilization - currentDocumentCount: ${currentDocumentCount}`);

//         // Calculate percentages
//         const tokenUsagePercentage = token_limit > 0 ? (((token_limit - currentTokenBalance) / token_limit) * 100).toFixed(0) : 0;
//         const documentUsagePercentage = document_limit > 0 ? ((currentDocumentCount / document_limit) * 100).toFixed(0) : 0;
//         const storageUsagePercentage = MAX_STORAGE_BYTES > 0 ? ((totalStorageUsedBytes / MAX_STORAGE_BYTES) * 100).toFixed(0) : 0;
//         console.log(`DEBUG: getUserResourceUtilization - tokenUsagePercentage: ${tokenUsagePercentage}, documentUsagePercentage: ${documentUsagePercentage}, storageUsagePercentage: ${storageUsagePercentage}`);

//         res.status(200).json({
//             planDetails: {
//                 plan_name,
//                 token_limit,
//                 ai_analysis_limit,
//                 document_limit,
//                 template_access,
//             },
//             resourceUtilization: {
//                 tokens: {
//                     remaining: currentTokenBalance,
//                     total_allocated: token_limit,
//                     total_used: totalTokensUsed,
//                     percentage_used: tokenUsagePercentage,
//                     expiration_date: activePlanDetails?.end_date || null
//                 },
//                 documents: {
//                     used: currentDocumentCount,
//                     limit: document_limit,
//                     percentage_used: documentUsagePercentage
//                 },
//                 queries: {
//                     used: (token_limit - currentTokenBalance), // Assuming 'queries' refers to AI analysis tokens
//                     limit: ai_analysis_limit, // Using ai_analysis_limit for queries
//                     percentage_used: tokenUsagePercentage // Reusing tokenUsagePercentage for queries
//                 },
//                 storage: {
//                     used_gb: totalStorageUsedGB,
//                     limit_gb: maxStorageGB, // This is currently a global limit
//                     percentage_used: storageUsagePercentage,
//                     note: "Storage limit is currently global (15GB). Per-plan storage limits require a 'storage_limit_gb' column in subscription_plans."
//                 }
//             }
//         });

//     } catch (error) {
//         console.error('❌ Error fetching user resource utilization:', error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };


exports.getUserResourceUtilization = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 1. Fetch user's active subscription details
        const subscriptionQuery = `
            SELECT
                sp.name AS plan_name,
                sp.token_limit,
                sp.ai_analysis_limit,
                sp.document_limit,
                sp.template_access,
                us.end_date
            FROM
                user_subscriptions us
            JOIN
                subscription_plans sp ON us.plan_id = sp.id
            WHERE
                us.user_id = $1 AND us.status = 'active';
        `;
        const subscriptionResult = await pool.query(subscriptionQuery, [userId]);

        if (subscriptionResult.rows.length === 0) {
            return res.status(404).json({ message: 'No active subscription found for this user.' });
        }

        const {
            plan_name,
            token_limit,
            ai_analysis_limit,
            document_limit,
            template_access,
            end_date
        } = subscriptionResult.rows[0];

        // 2. Fetch token usage logs
        const tokenUsageQuery = `
            SELECT id, user_id, tokens_used, action_description, used_at, remaining_tokens
            FROM token_usage_logs
            WHERE user_id = $1
            ORDER BY used_at DESC;
        `;
        const tokenUsageResult = await pool.query(tokenUsageQuery, [userId]);
        const tokenUsageLogs = tokenUsageResult.rows;

        // Derive current balance and totals
        const currentTokenBalance = tokenUsageLogs.length > 0 ? tokenUsageLogs[0].remaining_tokens : token_limit;
        const totalTokensUsed = tokenUsageLogs.reduce((acc, row) => acc + row.tokens_used, 0);

        // 3. Fetch user's total storage used
        const totalStorageUsedBytes = await File.getTotalStorageUsed(userId);
        const totalStorageUsedGB = (totalStorageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
        const maxStorageGB = (MAX_STORAGE_BYTES / (1024 * 1024 * 1024)).toFixed(2);

        // 4. Fetch user's document count
        const documentCountResult = await pool.query(
            `SELECT COUNT(*) FROM user_files WHERE user_id = $1 AND is_folder = FALSE;`,
            [userId]
        );
        const currentDocumentCount = parseInt(documentCountResult.rows[0].count, 10);

        // Calculate percentages
        const tokenUsagePercentage = token_limit > 0 ? (((token_limit - currentTokenBalance) / token_limit) * 100).toFixed(0) : 0;
        const documentUsagePercentage = document_limit > 0 ? ((currentDocumentCount / document_limit) * 100).toFixed(0) : 0;
        const storageUsagePercentage = MAX_STORAGE_BYTES > 0 ? ((totalStorageUsedBytes / MAX_STORAGE_BYTES) * 100).toFixed(0) : 0;

        res.status(200).json({
            planDetails: {
                plan_name,
                token_limit,
                ai_analysis_limit,
                document_limit,
                template_access,
                expiration_date: end_date
            },
            resourceUtilization: {
                tokens: {
                    remaining: currentTokenBalance,
                    total_allocated: token_limit,
                    total_used: totalTokensUsed,
                    percentage_used: tokenUsagePercentage,
                    expiration_date: end_date,
                    usage_history: tokenUsageLogs // 👈 full token usage logs
                },
                documents: {
                    used: currentDocumentCount,
                    limit: document_limit,
                    percentage_used: documentUsagePercentage
                },
                queries: {
                    used: (token_limit - currentTokenBalance),
                    limit: ai_analysis_limit,
                    percentage_used: tokenUsagePercentage
                },
                storage: {
                    used_gb: totalStorageUsedGB,
                    limit_gb: maxStorageGB,
                    percentage_used: storageUsagePercentage,
                    note: "Storage limit is currently global (15GB). Per-plan storage limits require a 'storage_limit_gb' column in subscription_plans."
                }
            }
        });

    } catch (error) {
        console.error('❌ Error fetching user resource utilization:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`DEBUG: getUserTransactions - User ID: ${userId}`);
        if (!userId) {
            console.log("DEBUG: getUserTransactions - Unauthorized: No user ID.");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch token usage logs
        const tokenLogsQuery = `
            SELECT
                id,
                tokens_used,
                action_description,
                used_at AS transaction_date,
                'token_usage' AS type
            FROM
                token_usage_logs
            WHERE
                user_id = $1
            ORDER BY
                used_at DESC;
        `;
        const tokenLogsResult = await pool.query(tokenLogsQuery, [userId]);

        // Fetch payment history
        const paymentsQuery = `
            SELECT
                id,
                amount, -- Return as numeric type
                currency,
                status,
                payment_method,
                TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS transaction_date,
                'payment' AS type,
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS payment_date,
                subscription_id -- Include subscription_id
            FROM
                payments
            WHERE
                user_id = $1
            ORDER BY
                created_at DESC;
        `;
        const paymentsResult = await pool.query(paymentsQuery, [userId]);

        // Combine and sort transactions by date
        const RAZORPAY_INVOICE_BASE_URL = process.env.RAZORPAY_INVOICE_BASE_URL || 'https://dashboard.razorpay.com/app/payments/'; // Placeholder

        const paymentsWithInvoiceLinks = paymentsResult.rows.map(payment => ({
            ...payment,
            invoice_link: payment.razorpay_payment_id ? `${RAZORPAY_INVOICE_BASE_URL}${payment.razorpay_payment_id}` : null
        }));

        const allTransactions = [...tokenLogsResult.rows, ...paymentsWithInvoiceLinks];
        allTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

        res.status(200).json({
            transactions: allTransactions
        });

    } catch (error) {
        console.error('❌ Error fetching user transactions:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getPlanAndResourceDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`DEBUG: getPlanAndResourceDetails - User ID: ${userId}`);
        if (!userId) {
            console.log("DEBUG: getPlanAndResourceDetails - Unauthorized: No user ID.");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { service } = req.query; // Optional: 'documents', 'queries', 'storage'

        // 1. Fetch user's active subscription details
        const subscriptionQuery = `
            SELECT
                sp.id AS plan_id,
                sp.name AS plan_name,
                sp.description,
                sp.price,
                sp.currency,
                sp.interval,
                sp.type,
                sp.token_limit,
                sp.carry_over_limit,
                sp.document_limit,
                sp.ai_analysis_limit,
                sp.template_access,
                sp.storage_limit_gb, -- Add storage_limit_gb
                sp.drafting_type,     -- Add drafting_type
                sp.limits,
                us.start_date,
                us.end_date,
                us.status AS subscription_status
            FROM
                user_subscriptions us
            JOIN
                subscription_plans sp ON us.plan_id = sp.id
            WHERE
                us.user_id = $1
            ORDER BY
                us.start_date DESC
            LIMIT 1; -- Get the most recent subscription, active or not
        `;
        const subscriptionResult = await pool.query(subscriptionQuery, [userId]);
        const activePlanDetails = subscriptionResult.rows.length > 0 ? subscriptionResult.rows[0] : null;

        // Fetch all available plan configurations
        const allPlansResult = await pool.query(`SELECT * FROM subscription_plans ORDER BY price ASC;`);
        const allPlanConfigurations = allPlansResult.rows;

        // Fetch latest payment details for the user
        const latestPaymentQuery = `
            SELECT
                id,
                amount,
                currency,
                status,
                payment_method,
                razorpay_payment_id,
                razorpay_order_id,
                subscription_id,
                TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS payment_date
            FROM
                payments
            WHERE
                user_id = $1
            ORDER BY
                created_at DESC
            LIMIT 1;
        `;
        const latestPaymentResult = await pool.query(latestPaymentQuery, [userId]);
        const latestPaymentDetails = latestPaymentResult.rows.length > 0 ? latestPaymentResult.rows[0] : null;

        if (!activePlanDetails) {
            // If no subscription is found, return a default or empty state
            return res.status(200).json({
                activePlan: null,
                resourceUtilization: {
                    tokens: { remaining: 0, limit: 0, total_used: 0, percentage_used: 0, status: 'no_plan' },
                    queries: { remaining: 0, limit: 0, total_used: 0, percentage_used: 0, status: 'no_plan' },
                    documents: { used: 0, limit: 0, percentage_used: 0, status: 'no_plan' },
                    storage: { used_gb: 0, limit_gb: 0, percentage_used: 0, status: 'no_plan', note: "No active subscription found." }
                },
                allPlanConfigurations: allPlanConfigurations.map(plan => ({ ...plan, is_active_plan: false })),
                latestPayment: latestPaymentDetails // Include latest payment even if no active plan
            });
        }

        let resourceUtilization = {};

        // Fetch current token balance from TokenUsageService
        const currentTokenBalance = await TokenUsageService.getRemainingTokens(userId);

        const latestTokenLogResult = await pool.query(
            `SELECT action_description, TO_CHAR(used_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS latest_usage_date
             FROM token_usage_logs
             WHERE user_id = $1
             ORDER BY used_at DESC
             LIMIT 1;`,
            [userId]
        );
        const latestTokenDetails = latestTokenLogResult.rows.length > 0 ? latestTokenLogResult.rows[0] : null;

        const tokenLimit = activePlanDetails?.token_limit || 0;
        const aiAnalysisLimit = activePlanDetails?.ai_analysis_limit || 0;
        const documentLimit = activePlanDetails?.document_limit || 0;

        const totalStorageUsedBytes = await File.getTotalStorageUsed(userId);
        const totalStorageUsedGB = (totalStorageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
        const planStorageLimitGB = activePlanDetails?.storage_limit_gb || 0; // Use plan-specific limit
        const currentDocumentCountResult = await pool.query(
            `SELECT COUNT(*) FROM user_files WHERE user_id = $1 AND is_folder = FALSE;`,
            [userId]
        );
        const currentDocumentCount = parseInt(currentDocumentCountResult.rows[0].count, 10);

        const calculateUtilization = (remaining, limit) => {
            if (limit === 0) return { remaining, limit, total_used: 0, percentage_used: 0, status: 'unlimited' };
            const used = limit - remaining;
            const percentage = ((used / limit) * 100).toFixed(0);
            const status = used >= limit ? 'exceeded' : 'within_limit';
            return { remaining, limit, total_used: used, percentage_used: percentage, status };
        };

        // Helper to get expiration date from activePlanDetails
        const getSubscriptionExpirationDate = (planDetails) => {
            return planDetails?.end_date || null;
        };


        if (service) {
            switch (service.toLowerCase()) {
                case 'tokens':
                    resourceUtilization = { tokens: calculateUtilization(currentTokenBalance, tokenLimit) };
                    break;
                case 'queries': // AI Analysis
                    resourceUtilization = { queries: calculateUtilization(currentTokenBalance, aiAnalysisLimit) };
                    break;
                case 'documents':
                    resourceUtilization = { documents: calculateUtilization(documentLimit - currentDocumentCount, documentLimit) }; // Document count is both used and total for this context
                    break;
                case 'storage':
                    resourceUtilization = {
                        storage: {
                            used_gb: totalStorageUsedGB,
                            limit_gb: planStorageLimitGB,
                            percentage_used: planStorageLimitGB > 0 ? ((totalStorageUsedBytes / (planStorageLimitGB * 1024 * 1024 * 1024)) * 100).toFixed(0) : 0,
                            status: planStorageLimitGB > 0 && totalStorageUsedBytes >= (planStorageLimitGB * 1024 * 1024 * 1024) ? 'exceeded' : 'within_limit',
                            note: planStorageLimitGB === 0 ? "No storage limit defined for this plan." : undefined
                        }
                    };
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid service specified. Must be one of: tokens, queries, documents, storage.' });
            }
        } else {
            // Return all utilizations if no specific service is requested
            resourceUtilization = {
                tokens: {
                    ...calculateUtilization(currentTokenBalance, tokenLimit),
                    expiration_date: getSubscriptionExpirationDate(activePlanDetails),
                    latest_usage_details: latestTokenDetails
                },
                queries: calculateUtilization(currentTokenBalance, aiAnalysisLimit),
                documents: calculateUtilization(documentLimit - currentDocumentCount, documentLimit),
                storage: {
                    used_gb: totalStorageUsedGB,
                    limit_gb: planStorageLimitGB,
                    percentage_used: planStorageLimitGB > 0 ? ((totalStorageUsedBytes / (planStorageLimitGB * 1024 * 1024 * 1024)) * 100).toFixed(0) : 0,
                    status: planStorageLimitGB > 0 && totalStorageUsedBytes >= (planStorageLimitGB * 1024 * 1024 * 1024) ? 'exceeded' : 'within_limit',
                    note: planStorageLimitGB === 0 ? "No storage limit defined for this plan." : undefined
                }
            };
        }

        const allPlanConfigurationsWithActiveFlag = allPlanConfigurations.map(plan => ({
            ...plan,
            is_active_plan: activePlanDetails ? (plan.id === activePlanDetails.plan_id) : false
        }));

        res.status(200).json({
            activePlan: activePlanDetails,
            resourceUtilization: resourceUtilization,
            allPlanConfigurations: allPlanConfigurationsWithActiveFlag,
            latestPayment: latestPaymentDetails
        });

    } catch (error) {
        console.error('❌ Error fetching plan and resource details:', error);
        console.error(`DEBUG: getPlanAndResourceDetails - Error: ${error.message}, Stack: ${error.stack}`);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};