// // controllers/dashboardController.js
// const pool = require('../config/db');

// function percent(used, limit) {
//   if (!limit || Number(limit) === 0) return null;
//   return Math.min(100, Math.round((Number(used) / Number(limit)) * 100));
// }

// exports.getDashboardSummary = async (req, res) => {
//   const userId = req.user?.id;
//   if (!userId) {
//     return res.status(401).json({ success: false, message: 'Unauthorized' });
//   }

//   try {
//     // Fetch active subscription + plan
//     const subSql = `
//       SELECT us.*, sp.name AS plan_tier, sp.type AS account_type,
//              sp.interval AS billing_cycle, sp.price AS monthly_cost,
//              sp.currency, sp.limits
//       FROM user_subscriptions us
//       JOIN subscription_plans sp ON sp.id = us.plan_id
//       WHERE us.user_id = $1
//       ORDER BY us.created_at DESC LIMIT 1;
//     `;
//     const { rows: subRows } = await pool.query(subSql, [userId]);
//     if (subRows.length === 0) {
//       return res.json({ success: true, data: null });
//     }
//     const sub = subRows[0];
//     const limits = sub.limits || {};

//     // Documents
//     const docRes = await pool.query(
//       `SELECT COUNT(*)::int AS used FROM user_files WHERE user_id=$1 AND (is_folder IS DISTINCT FROM TRUE)`,
//       [userId]
//     );
//     const documentsUsed = docRes.rows[0].used;

//     // Queries
//     const queryRes = await pool.query(
//       `SELECT COUNT(*)::int AS used FROM file_chats WHERE user_id=$1`,
//       [userId]
//     );
//     const queriesUsed = queryRes.rows[0].used;

//     // Storage
//     const storageRes = await pool.query(
//       `SELECT COALESCE(SUM(size),0)::bigint AS bytes_used FROM user_files WHERE user_id=$1 AND (is_folder IS DISTINCT FROM TRUE)`,
//       [userId]
//     );
//     const storageGbUsed = Number(storageRes.rows[0].bytes_used) / (1024 ** 3);

//     // API calls
//     const apiRes = await pool.query(
//       `SELECT COUNT(*)::int AS used FROM token_usage_logs WHERE user_id=$1 AND action_description ILIKE 'api_call%'`,
//       [userId]
//     );
//     const apiCallsUsed = apiRes.rows[0].used;

//     const data = {
//       activeSubscription: {
//         planTier: sub.plan_tier,
//         accountType: sub.account_type,
//         billingCycle: sub.billing_cycle,
//         monthlyCost: Number(sub.monthly_cost),
//         currency: sub.currency,
//         status: sub.status
//       },
//       utilization: {
//         documents: {
//           used: documentsUsed,
//           limit: limits.documents ?? null,
//           usedPct: percent(documentsUsed, limits.documents)
//         },
//         queries: {
//           used: queriesUsed,
//           limit: limits.queries ?? null,
//           usedPct: percent(queriesUsed, limits.queries)
//         },
//         storage: {
//           usedGB: Number(storageGbUsed.toFixed(1)),
//           limitGB: limits.storage_gb ?? null,
//           usedPct: percent(storageGbUsed, limits.storage_gb)
//         },
//         apiCalls: {
//           used: apiCallsUsed,
//           limit: limits.api_calls ?? null,
//           usedPct: percent(apiCallsUsed, limits.api_calls)
//         }
//       }
//     };

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error('getDashboardSummary error:', err);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };
// const pool = require('../config/db');

// function isNumberLike(v) {
//   return v !== null && v !== undefined && !Number.isNaN(Number(v));
// }
// function percent(used, limit) {
//   if (!isNumberLike(limit) || Number(limit) === 0) return null;
//   return Math.min(100, Math.round((Number(used) / Number(limit)) * 100));
// }

// exports.getDashboardSummary = async (req, res) => {
//   const userId = req.user?.id; // from your auth middleware
//   if (!userId) {
//     return res.status(401).json({ success: false, message: 'Unauthorized: missing user id from token' });
//   }

//   try {
//     // Diagnostics: what does the DB have for this user?
//     const diag = {};
//     const subCountRes = await pool.query(`SELECT COUNT(*)::int AS c FROM user_subscriptions WHERE user_id = $1`, [userId]);
//     diag.userSubscriptionsCount = subCountRes.rows[0]?.c ?? 0;

//     const planCountRes = await pool.query(`
//       SELECT COUNT(*)::int AS c
//       FROM subscription_plans
//       WHERE id IN (SELECT plan_id FROM user_subscriptions WHERE user_id = $1)
//     `, [userId]);
//     diag.subscriptionPlansForUserCount = planCountRes.rows[0]?.c ?? 0;

//     // Get latest subscription:
//     // LEFT JOIN to avoid hiding subscription if its plan row is missing.
//     const subSql = `
//       SELECT
//         us.id                AS subscription_id,
//         us.user_id,
//         us.plan_id,
//         us.status,
//         us.start_date,
//         us.end_date,
//         us.created_at,
//         us.updated_at,
//         us.razorpay_subscription_id,
//         sp.name              AS plan_tier,
//         sp.type              AS account_type,
//         sp.interval          AS billing_cycle,
//         sp.price             AS monthly_cost,
//         sp.currency          AS currency,
//         sp.limits            AS limits
//       FROM user_subscriptions us
//       LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
//       WHERE us.user_id = $1
//       ORDER BY
//         COALESCE(us.created_at, us.start_date) DESC NULLS LAST,
//         us.id DESC
//       LIMIT 1;
//     `;
//     const { rows: subRows } = await pool.query(subSql, [userId]);

//     if (subRows.length === 0) {
//       return res.json({
//         success: true,
//         data: null,
//         reason: 'NO_SUBSCRIPTION_FOR_USER',
//         debug: diag
//       });
//     }

//     const sub = subRows[0];
//     const limits = sub.limits || {};
//     const docLimit       = isNumberLike(limits.documents)   ? Number(limits.documents)   : null;
//     const queryLimit     = isNumberLike(limits.queries)     ? Number(limits.queries)     : null;
//     const storageGbLimit = isNumberLike(limits.storage_gb)  ? Number(limits.storage_gb)  : null;
//     const apiCallsLimit  = isNumberLike(limits.api_calls)   ? Number(limits.api_calls)   : null;
//     const seatsLimit     = isNumberLike(limits.seats)       ? Number(limits.seats)       : null;

//     // Aggregates
//     const [{ rows: docRows }] = await Promise.all([
//       pool.query(`SELECT COUNT(*)::int AS used
//                   FROM user_files
//                   WHERE user_id = $1 AND (is_folder IS DISTINCT FROM TRUE)`, [userId])
//     ]);
//     const documentsUsed = docRows[0]?.used ?? 0;

//     const { rows: queryRows } = await pool.query(
//       `SELECT COUNT(*)::int AS used FROM file_chats WHERE user_id = $1`,
//       [userId]
//     );
//     const queriesUsed = queryRows[0]?.used ?? 0;

//     const { rows: storageRows } = await pool.query(
//       `SELECT COALESCE(SUM(size), 0)::bigint AS bytes_used
//        FROM user_files
//        WHERE user_id = $1 AND (is_folder IS DISTINCT FROM TRUE)`,
//       [userId]
//     );
//     const storageBytesUsed = BigInt(storageRows[0]?.bytes_used ?? 0n);
//     const storageGbUsed = Number(storageBytesUsed) / (1024 ** 3);

//     const { rows: apiRows } = await pool.query(
//       `SELECT COUNT(*)::int AS used
//        FROM token_usage_logs
//        WHERE user_id = $1 AND action_description ILIKE 'api_call%'`,
//       [userId]
//     );
//     const apiCallsUsed = apiRows[0]?.used ?? 0;

//     // Seats used: placeholder (adjust when you have a team table)
//     const seatsUsed = 1;

//     // Next billing date (simple derive)
//     const nextBillingDate = (() => {
//       const cycle = (sub.billing_cycle || '').toLowerCase();
//       const start = sub.start_date ? new Date(sub.start_date) : null;
//       if (!start) return sub.end_date ? new Date(sub.end_date) : null;

//       const now = new Date();
//       const d = new Date(start);
//       const inc = () => {
//         if (cycle === 'monthly') d.setMonth(d.getMonth() + 1);
//         else if (cycle === 'yearly' || cycle === 'annual') d.setFullYear(d.getFullYear() + 1);
//         else if (cycle === 'quarter' || cycle === 'quarterly') d.setMonth(d.getMonth() + 3);
//         else if (cycle === 'half-yearly' || cycle === 'semiannual') d.setMonth(d.getMonth() + 6);
//         else return null; // unknown cycle
//         return d;
//       };
//       let step = inc();
//       if (!step) return sub.end_date ? new Date(sub.end_date) : null;
//       while (d <= now) step = inc();
//       return d;
//     })();

//     const data = {
//       activeSubscription: {
//         planTier: sub.plan_tier || null,
//         accountType: sub.account_type || null,
//         billingCycle: sub.billing_cycle || null,
//         monthlyCost: sub.monthly_cost != null ? Number(sub.monthly_cost) : null,
//         currency: sub.currency || null,
//         nextBillingDate: nextBillingDate ? nextBillingDate.toISOString().slice(0, 10) : null,
//         razorpaySubscriptionId: sub.razorpay_subscription_id,
//         status: sub.status
//       },
//       team: {
//         seatsUsed,
//         seatsLimit
//       },
//       utilization: {
//         documents: {
//           used: documentsUsed,
//           limit: docLimit,
//           usedPct: percent(documentsUsed, docLimit)
//         },
//         queries: {
//           used: queriesUsed,
//           limit: queryLimit,
//           usedPct: percent(queriesUsed, queryLimit)
//         },
//         storage: {
//           usedGB: Number(storageGbUsed.toFixed(1)),
//           limitGB: storageGbLimit,
//           usedPct: storageGbLimit ? percent(storageGbUsed, storageGbLimit) : null
//         },
//         apiCalls: {
//           used: apiCallsUsed,
//           limit: apiCallsLimit,
//           usedPct: percent(apiCallsUsed, apiCallsLimit)
//         }
//       }
//     };

//     return res.json({ success: true, data, debug: diag });
//   } catch (err) {
//     console.error('getDashboardSummary error:', err);
//     return res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };
// controllers/dashboardController.js
const pool = require('../config/db');

function isNumberLike(v) {
  return v !== null && v !== undefined && !Number.isNaN(Number(v));
}
function toInt(v) {
  return isNumberLike(v) ? parseInt(v, 10) : null;
}
function toNum(v) {
  return isNumberLike(v) ? Number(v) : null;
}
function percent(used, limit) {
  if (!isNumberLike(limit) || Number(limit) === 0) return null;
  return Math.min(100, Math.round((Number(used) / Number(limit)) * 100));
}

exports.getDashboardSummary = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: missing user id from token' });
  }

  try {
    // --- Diagnostics ---
    const diag = {};
    const subCountRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM user_subscriptions WHERE user_id = $1`,
      [userId]
    );
    diag.userSubscriptionsCount = subCountRes.rows[0]?.c ?? 0;

    const planCountRes = await pool.query(
      `SELECT COUNT(*)::int AS c
       FROM subscription_plans
       WHERE id IN (SELECT plan_id FROM user_subscriptions WHERE user_id = $1)`,
      [userId]
    );
    diag.subscriptionPlansForUserCount = planCountRes.rows[0]?.c ?? 0;

    // --- Latest subscription with plan join ---
    // Note: We map:
    //   plan_tier     <- sp.name
    //   account_type  <- sp.type (ENUM)
    //   billing_cycle <- sp.interval (ENUM)
    //   monthly_cost  <- sp.price (NUMERIC)
    //   currency      <- sp.currency
    //
    // Limits come from explicit columns first, then JSONB as fallback.
    const subSql = `
      SELECT
        us.id  AS subscription_id,
        us.user_id,
        us.plan_id,
        us.status,
        us.start_date,
        us.end_date,
        us.created_at,
        us.updated_at,
        us.razorpay_subscription_id,

        sp.name        AS plan_tier,
        sp.type        AS account_type,
        sp.interval    AS billing_cycle,
        sp.price       AS monthly_cost,
        sp.currency    AS currency,

        -- explicit column limits (preferred) with JSONB fallbacks
        COALESCE(sp.document_limit,
                 NULLIF((sp.limits ->> 'documents'), '')::int)      AS documents_limit,
        COALESCE(sp.ai_analysis_limit,
                 NULLIF((sp.limits ->> 'queries'), '')::int)        AS queries_limit,
        COALESCE(sp.token_limit,
                 NULLIF((sp.limits ->> 'api_calls'), '')::int)      AS api_calls_limit,
        NULLIF((sp.limits ->> 'storage_gb'), '')::numeric          AS storage_gb_limit,
        NULLIF((sp.limits ->> 'seats'), '')::int                   AS seats_limit,
        sp.limits
      FROM user_subscriptions us
      LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = $1
      ORDER BY
        COALESCE(us.created_at, us.start_date) DESC NULLS LAST,
        us.id DESC
      LIMIT 1;
    `;
    const { rows: subRows } = await pool.query(subSql, [userId]);

    if (subRows.length === 0) {
      return res.json({
        success: true,
        data: null,
        reason: 'NO_SUBSCRIPTION_FOR_USER',
        debug: diag
      });
    }

    const sub = subRows[0];

    // --- Extract limits (normalize to numbers/null) ---
    const docLimit       = toInt(sub.documents_limit);
    const queryLimit     = toInt(sub.queries_limit);
    const storageGbLimit = toNum(sub.storage_gb_limit);
    const apiCallsLimit  = toInt(sub.api_calls_limit);
    const seatsLimit     = toInt(sub.seats_limit);

    // --- Aggregates ---
    // documents = number of non-folder user_files
    const { rows: docRows } = await pool.query(
      `SELECT COUNT(*)::int AS used
       FROM user_files
       WHERE user_id = $1 AND (is_folder IS DISTINCT FROM TRUE)`,
      [userId]
    );
    const documentsUsed = docRows[0]?.used ?? 0;

    // queries = file_chats by this user
    const { rows: queryRows } = await pool.query(
      `SELECT COUNT(*)::int AS used
       FROM file_chats
       WHERE user_id = $1`,
      [userId]
    );
    const queriesUsed = queryRows[0]?.used ?? 0;

    // storage usage in GB
    const { rows: storageRows } = await pool.query(
      `SELECT COALESCE(SUM(size), 0)::bigint AS bytes_used
       FROM user_files
       WHERE user_id = $1 AND (is_folder IS DISTINCT FROM TRUE)`,
      [userId]
    );
    const storageBytesUsed = BigInt(storageRows[0]?.bytes_used ?? 0n);
    const storageGbUsed = Number(storageBytesUsed) / (1024 ** 3);

    // api calls used (token log rows marked as api_call*)
    const { rows: apiRows } = await pool.query(
      `SELECT COUNT(*)::int AS used
       FROM token_usage_logs
       WHERE user_id = $1 AND action_description ILIKE 'api_call%'`,
      [userId]
    );
    const apiCallsUsed = apiRows[0]?.used ?? 0;

    // seats used – if you don’t have a team table, keep as 1
    const seatsUsed = 1;

    // --- Next billing date from start_date + interval ---
    const nextBillingDate = (() => {
      const cycle = (sub.billing_cycle || '').toString().toLowerCase();
      const start = sub.start_date ? new Date(sub.start_date) : null;
      if (!start) return sub.end_date ? new Date(sub.end_date) : null;

      const now = new Date();
      const d = new Date(start);
      const bump = () => {
        if (cycle === 'monthly') d.setMonth(d.getMonth() + 1);
        else if (cycle === 'yearly' || cycle === 'annual') d.setFullYear(d.getFullYear() + 1);
        else if (cycle === 'quarter' || cycle === 'quarterly') d.setMonth(d.getMonth() + 3);
        else if (cycle === 'half-yearly' || cycle === 'semiannual') d.setMonth(d.getMonth() + 6);
        else return null; // unknown cycle -> give up
        return d;
      };
      let step = bump();
      if (!step) return sub.end_date ? new Date(sub.end_date) : null;
      while (d <= now) step = bump();
      return d;
    })();

    // --- Response payload ---
    const data = {
      activeSubscription: {
        planTier: sub.plan_tier || null,
        accountType: sub.account_type || null,      // subscription_plans.type (ENUM)
        billingCycle: sub.billing_cycle || null,    // subscription_plans.interval (ENUM)
        monthlyCost: sub.monthly_cost != null ? Number(sub.monthly_cost) : null, // price
        currency: sub.currency || null,
        nextBillingDate: nextBillingDate ? nextBillingDate.toISOString().slice(0, 10) : null,
        razorpaySubscriptionId: sub.razorpay_subscription_id,
        status: sub.status
      },
      team: {
        seatsUsed,
        seatsLimit
      },
      utilization: {
        documents: {
          used: documentsUsed,
          limit: docLimit,
          usedPct: percent(documentsUsed, docLimit)
        },
        queries: {
          used: queriesUsed,
          limit: queryLimit,
          usedPct: percent(queriesUsed, queryLimit)
        },
        storage: {
          usedGB: Number(storageGbUsed.toFixed(1)),
          limitGB: storageGbLimit,
          usedPct: storageGbLimit ? percent(storageGbUsed, storageGbLimit) : null
        },
        apiCalls: {
          used: apiCallsUsed,
          limit: apiCallsLimit,
          usedPct: percent(apiCallsUsed, apiCallsLimit)
        }
      }
    };

    return res.json({ success: true, data, debug: diag });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
