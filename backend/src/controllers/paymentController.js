// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const db = require("../config/db");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// const startSubscription = async (req, res) => {
//   try {
//     console.log("🔥 Request received to start subscription");
    
//     const userId = req.user?.id;
//     const { plan_id } = req.body;
    
//     if (!userId) {
//       console.log("⛔ No userId");
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!plan_id) {
//       console.log("⛔ No plan_id");
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing plan_id" 
//       });
//     }
    
//     console.log("✅ User ID:", userId, "| Plan ID:", plan_id);
    
//     // Fetch plan
//     const planRes = await db.query("SELECT * FROM subscription_plans WHERE id = $1", [plan_id]);
//     if (planRes.rows.length === 0) {
//       console.log("❌ Plan not found");
//       return res.status(404).json({ 
//         success: false,
//         message: "Plan not found" 
//       });
//     }
    
//     const plan = planRes.rows[0];
//     console.log("📦 Plan from DB:", plan);
    
//     if (!plan.razorpay_plan_id) {
//       console.log("❌ Missing razorpay_plan_id");
//       return res.status(500).json({ 
//         success: false,
//         message: "Plan missing Razorpay ID" 
//       });
//     }
    
//     // Get user details for customer creation
//     const userRes = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
//     if (userRes.rows.length === 0) {
//       console.log("❌ User not found");
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }
    
//     const user = userRes.rows[0];
    
//     // Create or get Razorpay customer
//     let customerId = user.razorpay_customer_id;
    
//     if (!customerId) {
//       console.log("⚙️ Creating customer on Razorpay...");
//       const customer = await razorpay.customers.create({
//         name: user.name || user.username || 'Customer',
//         email: user.email,
//         contact: user.phone || user.contact || '',
//         fail_existing: 0
//       });
      
//       customerId = customer.id;
      
//       // Update user with customer ID
//       await db.query(
//         "UPDATE users SET razorpay_customer_id = $1 WHERE id = $2",
//         [customerId, userId]
//       );
      
//       console.log("✅ Customer created:", customerId);
//     }
    
//     // Create Razorpay subscription
//     console.log("⚙️ Creating subscription on Razorpay...");
//     const subscriptionOptions = {
//       plan_id: plan.razorpay_plan_id,
//       customer_notify: 1,
//       quantity: 1,
//     };
    
//     // Add total_count only if it's not unlimited
//     if (plan.interval !== 'lifetime') {
//       subscriptionOptions.total_count = 12; // or based on your business logic
//     }
    
//     const subscription = await razorpay.subscriptions.create(subscriptionOptions);
    
//     console.log("✅ Razorpay subscription created:", subscription);
    
//     // Save to DB
//     await db.query(
//       `INSERT INTO user_subscriptions 
//         (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date)
//         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
//         ON CONFLICT (user_id) DO UPDATE SET 
//           plan_id = EXCLUDED.plan_id,
//           razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
//           status = EXCLUDED.status,
//           current_token_balance = EXCLUDED.current_token_balance,
//           updated_at = CURRENT_TIMESTAMP`,
//       [
//         userId,
//         plan.id,
//         subscription.id,
//         "created", // Razorpay initial status
//         plan.token_limit || 0,
//       ]
//     );
    
//     return res.status(200).json({
//       success: true,
//       subscription_id: subscription.id,
//       key: process.env.RAZORPAY_KEY_ID, // Frontend needs this
//       customer_id: customerId,
//       plan_name: plan.name,
//       amount: plan.price * 100, // Razorpay expects amount in paise
//       currency: 'INR'
//     });
//   } catch (err) {
//     console.error("❌ Subscription creation failed:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Subscription initiation failed",
//       error: err.message,
//     });
//   }
// };

// const verifySubscription = async (req, res) => {
//   try {
//     console.log("🔥 Request received to verify subscription payment");
    
//     const userId = req.user?.id;
//     const { 
//       razorpay_payment_id, 
//       razorpay_subscription_id, 
//       razorpay_signature 
//     } = req.body;
    
//     if (!userId) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing payment verification data" 
//       });
//     }
    
//     // Verify signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
//       .digest('hex');
    
//     if (expectedSignature !== razorpay_signature) {
//       console.log("❌ Invalid signature");
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid payment signature" 
//       });
//     }
    
//     // Fetch subscription details from Razorpay
//     const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
//     console.log("📦 Subscription from Razorpay:", subscription);
    
//     // Update subscription status in DB
//     const updateResult = await db.query(
//       `UPDATE user_subscriptions 
//        SET status = $1, 
//            razorpay_payment_id = $2,
//            activated_at = CURRENT_TIMESTAMP,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $3 AND razorpay_subscription_id = $4
//        RETURNING *`,
//       ['active', razorpay_payment_id, userId, razorpay_subscription_id]
//     );
    
//     if (updateResult.rows.length === 0) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Subscription not found" 
//       });
//     }
    
//     console.log("✅ Subscription verified and activated");
    
//     return res.status(200).json({
//       success: true,
//       message: "Subscription verified successfully",
//       subscription: updateResult.rows[0]
//     });
    
//   } catch (err) {
//     console.error("❌ Subscription verification failed:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Subscription verification failed",
//       error: err.message,
//     });
//   }
// };

// // Webhook handler for Razorpay events
// const handleWebhook = async (req, res) => {
//   try {
//     const signature = req.headers['x-razorpay-signature'];
//     const payload = JSON.stringify(req.body);
    
//     // Verify webhook signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
//       .update(payload)
//       .digest('hex');
    
//     if (signature !== expectedSignature) {
//       console.log("❌ Invalid webhook signature");
//       return res.status(400).json({ message: "Invalid signature" });
//     }
    
//     const { event, payload: eventPayload } = req.body;
//     console.log(`🔔 Webhook received: ${event}`);
    
//     switch (event) {
//       case 'subscription.activated':
//         await handleSubscriptionActivated(eventPayload.subscription.entity);
//         break;
//       case 'subscription.charged':
//         await handleSubscriptionCharged(eventPayload.payment.entity, eventPayload.subscription.entity);
//         break;
//       case 'subscription.cancelled':
//         await handleSubscriptionCancelled(eventPayload.subscription.entity);
//         break;
//       case 'subscription.completed':
//         await handleSubscriptionCompleted(eventPayload.subscription.entity);
//         break;
//       default:
//         console.log(`Unhandled webhook event: ${event}`);
//     }
    
//     return res.status(200).json({ status: 'ok' });
//   } catch (err) {
//     console.error("❌ Webhook handling failed:", err);
//     return res.status(500).json({ message: "Webhook handling failed" });
//   }
// };

// const handleSubscriptionActivated = async (subscription) => {
//   try {
//     await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'active', activated_at = CURRENT_TIMESTAMP 
//        WHERE razorpay_subscription_id = $1`,
//       [subscription.id]
//     );
//     console.log(`✅ Subscription ${subscription.id} activated`);
//   } catch (err) {
//     console.error("Error handling subscription activation:", err);
//   }
// };

// const handleSubscriptionCharged = async (payment, subscription) => {
//   try {
//     // Update payment info and reset token balance if needed
//     await db.query(
//       `UPDATE user_subscriptions 
//        SET razorpay_payment_id = $1, 
//            last_charged_at = CURRENT_TIMESTAMP,
//            current_token_balance = (
//              SELECT token_limit FROM subscription_plans 
//              WHERE razorpay_plan_id = $2
//            ),
//            last_reset_date = CURRENT_DATE
//        WHERE razorpay_subscription_id = $3`,
//       [payment.id, subscription.plan_id, subscription.id]
//     );
//     console.log(`✅ Subscription ${subscription.id} charged`);
//   } catch (err) {
//     console.error("Error handling subscription charge:", err);
//   }
// };

// const handleSubscriptionCancelled = async (subscription) => {
//   try {
//     await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP 
//        WHERE razorpay_subscription_id = $1`,
//       [subscription.id]
//     );
//     console.log(`✅ Subscription ${subscription.id} cancelled`);
//   } catch (err) {
//     console.error("Error handling subscription cancellation:", err);
//   }
// };

// const handleSubscriptionCompleted = async (subscription) => {
//   try {
//     await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
//        WHERE razorpay_subscription_id = $1`,
//       [subscription.id]
//     );
//     console.log(`✅ Subscription ${subscription.id} completed`);
//   } catch (err) {
//     console.error("Error handling subscription completion:", err);
//   }
// };

// module.exports = {
//   startSubscription,
//   verifySubscription,
//   handleWebhook,
// };

// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const db = require("../config/db");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// const startSubscription = async (req, res) => {
//   try {
//     console.log("🔥 Starting subscription process");
//     console.log("Request body:", req.body);
//     console.log("User from auth:", req.user?.id);
    
//     const userId = req.user?.id;
//     const { plan_id } = req.body;
    
//     if (!userId) {
//       console.log("❌ No user ID");
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!plan_id) {
//       console.log("❌ No plan_id");
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing plan_id" 
//       });
//     }
    
//     console.log("✅ User ID:", userId, "Plan ID:", plan_id);
    
//     // Fetch plan from database
//     console.log("📦 Fetching plan from database...");
//     const planQuery = await db.query(
//       "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true", 
//       [plan_id]
//     );
    
//     console.log("Plan query result:", planQuery.rows);
    
//     if (planQuery.rows.length === 0) {
//       console.log("❌ Plan not found or inactive");
//       return res.status(404).json({ 
//         success: false,
//         message: "Plan not found or inactive" 
//       });
//     }
    
//     if (planQuery.rows.length === 0 || !planQuery.rows[0]) {
//       console.log("❌ Plan not found or inactive (after initial query)");
//       return res.status(404).json({
//         success: false,
//         message: "Plan not found or inactive"
//       });
//     }

//     const plan = planQuery.rows[0];
//     console.log("📋 Plan details:", {
//       id: plan.id,
//       name: plan.name,
//       razorpay_plan_id: plan.razorpay_plan_id,
//       price: plan.price,
//       interval: plan.interval
//     });
    
//     // Check if plan has razorpay_plan_id
//     if (!plan.razorpay_plan_id) {
//       console.log("❌ Plan missing razorpay_plan_id");
//       return res.status(500).json({
//         success: false,
//         message: `Plan '${plan.name}' is not properly configured with Razorpay`
//       });
//     }
    
//     // Get user details
//     console.log("👤 Fetching user details...");
//     const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    
//     if (userQuery.rows.length === 0) {
//       console.log("❌ User not found");
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }
    
//     const user = userQuery.rows[0];
//     console.log("👤 User details:", {
//       id: user.id,
//       name: user.name || user.username,
//       email: user.email,
//       existing_customer_id: user.razorpay_customer_id || 'none'
//     });
    
//     // Create or get Razorpay customer
//     let customerId = user.razorpay_customer_id;
    
//     if (!customerId) {
//       console.log("⚙️ Creating Razorpay customer...");
      
//       try {
//         const customerData = {
//           name: user.name || user.username || `User ${user.id}`,
//           email: user.email,
//           fail_existing: 0
//         };
        
//         // Add phone if available
//         if (user.phone || user.contact) {
//           customerData.contact = user.phone || user.contact;
//         }
        
//         console.log("Creating customer with:", customerData);
        
//         const customer = await razorpay.customers.create(customerData);
//         customerId = customer.id;
        
//         console.log("✅ Customer created:", customerId);
        
//         // Update user with customer ID
//         await db.query(
//           "UPDATE users SET razorpay_customer_id = $1 WHERE id = $2",
//           [customerId, userId]
//         );
        
//       } catch (customerError) {
//         console.error("❌ Customer creation failed:", customerError);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to create customer profile",
//           error: customerError.error?.description || customerError.message
//         });
//       }
//     }
    
//     // Create subscription
//     console.log("⚙️ Creating Razorpay subscription...");
//     console.log("Using plan_id:", plan.razorpay_plan_id);
    
//     try {
//       const subscriptionData = {
//         plan_id: plan.razorpay_plan_id,
//         customer_notify: 1,
//         quantity: 1,
//       };

//       // Set total_count based on plan interval, if not 'lifetime'
//       if (plan.interval && plan.interval !== 'lifetime') {
//         subscriptionData.total_count = 12; // Default to 12 cycles for non-lifetime plans
//       } else if (plan.interval === 'lifetime') {
//         subscriptionData.total_count = 1; // For lifetime, typically one charge
//       }
      
//       // Log subscription data before sending to Razorpay
//       console.log("Sending subscription data to Razorpay:", JSON.stringify(subscriptionData, null, 2));
      
//       const subscription = await razorpay.subscriptions.create(subscriptionData);
//       console.log("Raw Razorpay subscription response:", JSON.stringify(subscription, null, 2));
      
//       console.log("✅ Subscription created:", {
//         id: subscription.id,
//         status: subscription.status,
//         plan_id: subscription.plan_id,
//         razorpay_plan_id_from_db: plan.razorpay_plan_id // Log the DB plan ID
//       });
      
//       // Save to database
//       console.log("💾 Saving to database...");
      
//       await db.query(
//         `INSERT INTO user_subscriptions 
//           (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date, created_at, updated_at)
//           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//           ON CONFLICT (user_id) DO UPDATE SET 
//             plan_id = EXCLUDED.plan_id,
//             razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
//             status = EXCLUDED.status,
//             current_token_balance = EXCLUDED.current_token_balance,
//             updated_at = CURRENT_TIMESTAMP`,
//         [
//           userId,
//           plan.id,
//           subscription.id,
//           subscription.status, // Use actual Razorpay status
//           plan.token_limit || 0,
//         ]
//       );
      
//       console.log("✅ Subscription saved to database");
      
//       // Return success response
//       const response = {
//         success: true,
//         subscription_id: subscription.id,
//         key: process.env.RAZORPAY_KEY_ID,
//         customer_id: customerId,
//         plan: {
//           id: plan.id,
//           name: plan.name || 'Unknown Plan',
//           description: plan.description || '',
//           price: plan.price,
//           currency: plan.currency || 'INR',
//           interval: plan.interval,
//           type: plan.type || 'standard',
//           features: plan.features || [],
//           document_limit: plan.document_limit,
//           ai_analysis_limit: plan.ai_analysis_limit,
//           token_limit: plan.token_limit,
//           carry_over_limit: plan.carry_over_limit,
//           limits: plan.limits || {},
//           razorpay_plan_id: plan.razorpay_plan_id,
//           created_at: plan.created_at,
//           updated_at: plan.updated_at,
//           is_active: plan.is_active
//         }
//       };
      
//       console.log("🎉 Returning success response to frontend:", JSON.stringify(response, null, 2));
//       console.log("Frontend should receive subscription_id:", response.subscription_id);
//       console.log("Final plan object in response:", JSON.stringify(response.plan, null, 2)); // Added log
      
//       return res.status(200).json(response);
      
//     } catch (subscriptionError) {
//       console.error("❌ Subscription creation failed:", subscriptionError);
      
//       // Log detailed error information
//       console.error("Full subscriptionError object (with all properties):", JSON.stringify(subscriptionError, Object.getOwnPropertyNames(subscriptionError), 2));
//       console.error("SubscriptionError instance of Error:", subscriptionError instanceof Error);
//       console.error("SubscriptionError.name:", subscriptionError.name);
//       console.error("SubscriptionError.message:", subscriptionError.message);
//       console.error("SubscriptionError.stack:", subscriptionError.stack);
//       console.error("SubscriptionError.statusCode:", subscriptionError.statusCode);
//       console.error("SubscriptionError.error (if exists):", subscriptionError.error);
      
//       let errorMessage = "Failed to create subscription";
//       let rawErrorDetails = {};

//       if (!subscriptionError) {
//         errorMessage = "An unknown error occurred during subscription creation (error object was null/undefined).";
//         rawErrorDetails = { message: errorMessage };
//       } else {
//         // Safely handle Razorpay API errors (which often have an 'error' object)
//         const razorpayErrorDetails = subscriptionError?.error;
//         if (razorpayErrorDetails && typeof razorpayErrorDetails === 'object') {
//           errorMessage = razorpayErrorDetails.description || razorpayErrorDetails.message || errorMessage;
//           rawErrorDetails.razorpay_error = razorpayErrorDetails;
//         }
//         // Handle general Error objects
//         else if (subscriptionError instanceof Error) {
//           errorMessage = subscriptionError.message;
//           rawErrorDetails.name = subscriptionError.name;
//           rawErrorDetails.message = subscriptionError.message;
//           rawErrorDetails.stack = subscriptionError.stack;
//         }
//         // Handle cases where error is a string or other primitive
//         else if (typeof subscriptionError === 'string') {
//           errorMessage = subscriptionError;
//         } else {
//           // Fallback for unexpected error types
//           errorMessage = "An unexpected error occurred during subscription creation.";
//           rawErrorDetails.unknown_error = subscriptionError;
//         }
        
//         // Include status code if available
//         if (subscriptionError?.statusCode) {
//           rawErrorDetails.statusCode = subscriptionError.statusCode;
//         }
        
//         // Ensure fullError is always an object, even if empty, using optional chaining
//         rawErrorDetails.fullError = {
//           name: subscriptionError?.name,
//           message: subscriptionError?.message,
//           stack: subscriptionError?.stack,
//           ...(razorpayErrorDetails && typeof razorpayErrorDetails === 'object' && { razorpay_error_details: razorpayErrorDetails })
//         };
//       }
      
//       return res.status(500).json({
//         success: false,
//         message: "Failed to create subscription",
//         error: errorMessage,
//         raw_error: JSON.stringify(rawErrorDetails, getCircularReplacer())
//       });
//     }
    
//   } catch (err) {
//     console.error("❌ Unexpected error in startSubscription:", err);
//     console.error("Stack trace:", err.stack);
//     console.error("Error type:", typeof err);
//     console.error("Error constructor:", err.constructor?.name);

//     let errorMessage = "Subscription initiation failed due to an unexpected error.";
//     let errorDetails = {
//       name: err?.name || "UnknownError",
//       message: err?.message || "No message available",
//       stack: err?.stack || "No stack trace available",
//       originalError: JSON.stringify(err, getCircularReplacer()) // Capture full error object
//     };
    
//     return res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error: {
//         message: errorMessage,
//         details: errorDetails
//       },
//       error_details: errorDetails, // For backward compatibility/detailed debugging
//       error_type: err?.constructor?.name || "Unknown"
//     });
//   }
// };

// // Helper function to handle circular references in JSON.stringify
// const getCircularReplacer = () => {
//   const seen = new WeakSet();
//   return (key, value) => {
//     if (typeof value === "object" && value !== null) {
//       if (seen.has(value)) {
//         return; // Circular reference found, discard key
//       }
//       seen.add(value);
//     }
//     return value;
//   };
// };

// const verifySubscription = async (req, res) => {
//   try {
//     console.log("🔥 Verifying subscription payment");
    
//     const userId = req.user?.id;
//     const { 
//       razorpay_payment_id, 
//       razorpay_subscription_id, 
//       razorpay_signature 
//     } = req.body;
    
//     console.log("Verification data received:", {
//       userId,
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       has_signature: !!razorpay_signature
//     });
    
//     if (!userId) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing payment verification data" 
//       });
//     }
    
//     // Verify signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
//       .digest('hex');
    
//     if (expectedSignature !== razorpay_signature) {
//       console.log("❌ Invalid signature");
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid payment signature" 
//       });
//     }
    
//     console.log("✅ Signature verified");
    
//     // Update subscription status in database
//     const updateResult = await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'active', 
//            razorpay_payment_id = $1,
//            activated_at = CURRENT_TIMESTAMP,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $2 AND razorpay_subscription_id = $3
//        RETURNING *`,
//       [razorpay_payment_id, userId, razorpay_subscription_id]
//     );
    
//     if (updateResult.rows.length === 0) {
//       console.log("❌ Subscription not found in database");
//       return res.status(404).json({ 
//         success: false,
//         message: "Subscription not found" 
//       });
//     }
    
//     console.log("✅ Subscription verified and activated");
    
//     return res.status(200).json({
//       success: true,
//       message: "Subscription verified successfully",
//       subscription: updateResult.rows[0]
//     });
    
//   } catch (err) {
//     console.error("❌ Verification error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Subscription verification failed",
//       error: err.message,
//     });
//   }
// };

// // Test endpoint to check plans
// const testPlans = async (req, res) => {
//   try {
//     console.log("🧪 Testing plan configuration...");
    
//     // Check database plans
//     const dbPlans = await db.query(
//       "SELECT id, name, razorpay_plan_id, price, interval, is_active FROM subscription_plans ORDER BY id"
//     );
    
//     console.log("Database plans:", dbPlans.rows);
    
//     // Check Razorpay plans
//     const rzpPlans = await razorpay.plans.all({ count: 10 });
    
//     console.log("Razorpay plans:", rzpPlans.items?.map(p => ({
//       id: p.id,
//       name: p.item?.name,
//       amount: p.item?.amount,
//       currency: p.item?.currency,
//       period: p.period
//     })));
    
//     return res.json({
//       success: true,
//       database_plans: dbPlans.rows,
//       razorpay_plans: rzpPlans.items?.length || 0,
//       razorpay_plan_details: rzpPlans.items?.map(p => ({
//         id: p.id,
//         name: p.item?.name,
//         amount: p.item?.amount,
//         currency: p.item?.currency,
//         period: p.period
//       }))
//     });
    
//   } catch (error) {
//     console.error("❌ Test failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Plan test failed",
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testRazorpayConnection,
// };

// async function testRazorpayConnection(req, res) {
//   try {
//     console.log("🧪 Testing Razorpay API connection...");
//     const plans = await razorpay.plans.all({ count: 1 }); // Fetch one plan to test connection
//     console.log("✅ Successfully connected to Razorpay API. Plans fetched:", plans.items.length);
//     return res.status(200).json({
//       success: true,
//       message: "Successfully connected to Razorpay API",
//       plans_count: plans.items.length,
//     });
//   } catch (error) {
//     console.error("❌ Failed to connect to Razorpay API:", error);
//     console.error("Full Razorpay connection error object:", JSON.stringify(error, null, 2));
//     return res.status(500).json({
//       success: false,
//       message: "Failed to connect to Razorpay API",
//       error: error.error ? (error.error.description || error.error.message || JSON.stringify(error.error)) : error.message || "Unknown Razorpay connection error",
//       raw_error: JSON.stringify(error) // Add raw error for more debugging
//     });
//   }
// }

// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const db = require("../config/db");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// const startSubscription = async (req, res) => {
//   try {
//     console.log("🔥 Starting subscription process");
//     console.log("Request body:", req.body);
//     console.log("User from auth:", req.user?.id);
    
//     const userId = req.user?.id;
//     const { plan_id } = req.body;
    
//     if (!userId) {
//       console.log("❌ No user ID");
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!plan_id) {
//       console.log("❌ No plan_id");
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing plan_id" 
//       });
//     }
    
//     console.log("✅ User ID:", userId, "Plan ID:", plan_id);
    
//     // Fetch plan from database
//     console.log("📦 Fetching plan from database...");
//     const planQuery = await db.query(
//       "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true", 
//       [plan_id]
//     );
    
//     console.log("Plan query result:", planQuery.rows);
    
//     if (planQuery.rows.length === 0) {
//       console.log("❌ Plan not found or inactive");
//       return res.status(404).json({ 
//         success: false,
//         message: "Plan not found or inactive" 
//       });
//     }
    
//     const plan = planQuery.rows[0];
//     console.log("📋 Plan details:", {
//       id: plan.id,
//       name: plan.name,
//       razorpay_plan_id: plan.razorpay_plan_id,
//       price: plan.price,
//       interval: plan.interval
//     });
    
//     // Check if plan has razorpay_plan_id
//     if (!plan.razorpay_plan_id) {
//       console.log("❌ Plan missing razorpay_plan_id");
//       return res.status(500).json({ 
//         success: false,
//         message: `Plan '${plan.name}' is not properly configured with Razorpay` 
//       });
//     }
    
//     // Get user details
//     console.log("👤 Fetching user details...");
//     const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    
//     if (userQuery.rows.length === 0) {
//       console.log("❌ User not found");
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }
    
//     const user = userQuery.rows[0];
//     console.log("👤 User details:", {
//       id: user.id,
//       name: user.name || user.username,
//       email: user.email,
//       existing_customer_id: user.razorpay_customer_id || 'none'
//     });
    
//     // Create or get Razorpay customer
//     let customerId = user.razorpay_customer_id;
    
//     if (!customerId) {
//       console.log("⚙️ Creating Razorpay customer...");
      
//       try {
//         const customerData = {
//           name: user.name || user.username || `User ${user.id}`,
//           email: user.email,
//           fail_existing: 0
//         };
        
//         // Add phone if available and valid
//         if (user.phone || user.contact) {
//           const phoneNumber = (user.phone || user.contact).toString().trim();
//           if (phoneNumber && phoneNumber.length >= 10) {
//             customerData.contact = phoneNumber;
//           }
//         }
        
//         console.log("Creating customer with:", customerData);
        
//         const customer = await razorpay.customers.create(customerData);
//         customerId = customer.id;
        
//         console.log("✅ Customer created:", customerId);
        
//         // Update user with customer ID
//         await db.query(
//           "UPDATE users SET razorpay_customer_id = $1 WHERE id = $2",
//           [customerId, userId]
//         );
        
//       } catch (customerError) {
//         console.error("❌ Customer creation failed:", customerError);
//         console.error("Customer error details:", {
//           message: customerError.message,
//           statusCode: customerError.statusCode,
//           error: customerError.error
//         });
        
//         return res.status(500).json({
//           success: false,
//           message: "Failed to create customer profile",
//           error: customerError.error?.description || customerError.message || "Customer creation failed"
//         });
//       }
//     }
    
//     // Validate Razorpay plan exists
//     console.log("🔍 Validating Razorpay plan exists...");
//     try {
//       const razorpayPlan = await razorpay.plans.fetch(plan.razorpay_plan_id);
//       console.log("✅ Razorpay plan found:", {
//         id: razorpayPlan.id,
//         name: razorpayPlan.item?.name,
//         amount: razorpayPlan.item?.amount,
//         currency: razorpayPlan.item?.currency
//       });
//     } catch (planFetchError) {
//       console.error("❌ Razorpay plan not found:", planFetchError);
//       return res.status(400).json({
//         success: false,
//         message: `Plan ${plan.razorpay_plan_id} not found in Razorpay. Please check plan configuration.`,
//         error: planFetchError.error?.description || planFetchError.message || "Plan validation failed"
//       });
//     }
    
//     // Create subscription
//     console.log("⚙️ Creating Razorpay subscription...");
//     console.log("Using plan_id:", plan.razorpay_plan_id);
    
//     try {
//       const subscriptionData = {
//         plan_id: plan.razorpay_plan_id,
//         customer_notify: 1,
//         quantity: 1,
//       };

//       // Set total_count based on plan interval
//       if (plan.interval && plan.interval !== 'lifetime') {
//         subscriptionData.total_count = 12; // Default to 12 cycles for non-lifetime plans
//       } else if (plan.interval === 'lifetime') {
//         subscriptionData.total_count = 1; // For lifetime, typically one charge
//       }
      
//       // Add customer_id if available
//       if (customerId) {
//         subscriptionData.customer_id = customerId;
//       }
      
//       // Log subscription data before sending to Razorpay
//       console.log("Sending subscription data to Razorpay:", JSON.stringify(subscriptionData, null, 2));
      
//       const subscription = await razorpay.subscriptions.create(subscriptionData);
//       console.log("Raw Razorpay subscription response:", JSON.stringify(subscription, null, 2));
      
//       console.log("✅ Subscription created:", {
//         id: subscription.id,
//         status: subscription.status,
//         plan_id: subscription.plan_id,
//         customer_id: subscription.customer_id,
//         razorpay_plan_id_from_db: plan.razorpay_plan_id
//       });
      
//       // Save to database
//       console.log("💾 Saving to database...");
      
//       await db.query(
//         `INSERT INTO user_subscriptions 
//           (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date, created_at, updated_at)
//           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//           ON CONFLICT (user_id) DO UPDATE SET 
//             plan_id = EXCLUDED.plan_id,
//             razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
//             status = EXCLUDED.status,
//             current_token_balance = EXCLUDED.current_token_balance,
//             updated_at = CURRENT_TIMESTAMP`,
//         [
//           userId,
//           plan.id,
//           subscription.id,
//           subscription.status, // Use actual Razorpay status
//           plan.token_limit || 0,
//         ]
//       );
      
//       console.log("✅ Subscription saved to database");
      
//       // Return success response
//       const response = {
//         success: true,
//         subscription_id: subscription.id,
//         key: process.env.RAZORPAY_KEY_ID,
//         customer_id: customerId,
//         plan_name: plan.name,
//         amount: plan.price * 100, // Convert to paise
//         currency: 'INR'
//       };
      
//       console.log("🎉 Returning success response to frontend:", JSON.stringify(response, null, 2));
//       console.log("Frontend should receive subscription_id:", response.subscription_id);
      
//       return res.status(200).json(response);
      
//     } catch (subscriptionError) {
//       console.error("❌ Subscription creation failed:", subscriptionError);
      
//       // Enhanced error logging
//       console.error("Subscription error type:", typeof subscriptionError);
//       console.error("Subscription error constructor:", subscriptionError.constructor?.name);
      
//       // Safely extract error information
//       let errorMessage = "Failed to create subscription";
//       let errorDetails = {};
      
//       if (subscriptionError) {
//         // Handle different error structures
//         if (subscriptionError.error) {
//           errorDetails.razorpay_error = subscriptionError.error;
//           errorMessage = subscriptionError.error.description || 
//                         subscriptionError.error.message || 
//                         errorMessage;
//         } else if (subscriptionError.message) {
//           errorMessage = subscriptionError.message;
//         }
        
//         if (subscriptionError.statusCode) {
//           errorDetails.status_code = subscriptionError.statusCode;
//         }
        
//         // Log all enumerable properties
//         for (let key in subscriptionError) {
//           if (subscriptionError.hasOwnProperty(key)) {
//             errorDetails[key] = subscriptionError[key];
//           }
//         }
//       }
      
//       console.error("Processed error details:", errorDetails);
      
//       return res.status(500).json({
//         success: false,
//         message: errorMessage,
//         error_details: errorDetails,
//         debug_info: {
//           plan_id: plan.razorpay_plan_id,
//           customer_id: customerId,
//           subscription_data: subscriptionData
//         }
//       });
//     }
    
//   } catch (err) {
//     console.error("❌ Unexpected error:", err);
//     console.error("Stack trace:", err.stack);
//     console.error("Error type:", typeof err);
//     console.error("Error constructor:", err.constructor?.name);
    
//     return res.status(500).json({
//       success: false,
//       message: "Subscription initiation failed",
//       error: err.message || "Unknown error occurred",
//       error_type: err.constructor?.name || "Unknown"
//     });
//   }
// };

// const verifySubscription = async (req, res) => {
//   try {
//     console.log("🔥 Verifying subscription payment");
    
//     const userId = req.user?.id;
//     const { 
//       razorpay_payment_id, 
//       razorpay_subscription_id, 
//       razorpay_signature 
//     } = req.body;
    
//     console.log("Verification data received:", {
//       userId,
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       has_signature: !!razorpay_signature
//     });
    
//     if (!userId) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing payment verification data" 
//       });
//     }
    
//     // Verify signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
//       .digest('hex');
    
//     if (expectedSignature !== razorpay_signature) {
//       console.log("❌ Invalid signature");
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid payment signature" 
//       });
//     }
    
//     console.log("✅ Signature verified");
    
//     // Update subscription status in database
//     const updateResult = await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'active', 
//            razorpay_payment_id = $1,
//            activated_at = CURRENT_TIMESTAMP,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $2 AND razorpay_subscription_id = $3
//        RETURNING *`,
//       [razorpay_payment_id, userId, razorpay_subscription_id]
//     );
    
//     if (updateResult.rows.length === 0) {
//       console.log("❌ Subscription not found in database");
//       return res.status(404).json({ 
//         success: false,
//         message: "Subscription not found" 
//       });
//     }
    
//     console.log("✅ Subscription verified and activated");
    
//     return res.status(200).json({
//       success: true,
//       message: "Subscription verified successfully",
//       subscription: updateResult.rows[0]
//     });
    
//   } catch (err) {
//     console.error("❌ Verification error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Subscription verification failed",
//       error: err.message || "Verification failed",
//     });
//   }
// };

// // Test endpoint to check plans
// const testPlans = async (req, res) => {
//   try {
//     console.log("🧪 Testing plan configuration...");
    
//     // Check database plans
//     const dbPlans = await db.query(
//       "SELECT id, name, razorpay_plan_id, price, interval, is_active FROM subscription_plans ORDER BY id"
//     );
    
//     console.log("Database plans:", dbPlans.rows);
    
//     // Check Razorpay plans with error handling
//     let razorpayPlans = [];
//     let razorpayError = null;
    
//     try {
//       const rzpPlans = await razorpay.plans.all({ count: 10 });
//       razorpayPlans = rzpPlans.items?.map(p => ({
//         id: p.id,
//         name: p.item?.name,
//         amount: p.item?.amount,
//         currency: p.item?.currency,
//         period: p.period
//       })) || [];
//     } catch (error) {
//       console.error("Failed to fetch Razorpay plans:", error);
//       razorpayError = error.message || "Failed to connect to Razorpay";
//     }
    
//     console.log("Razorpay plans:", razorpayPlans);
    
//     return res.json({
//       success: true,
//       database_plans: dbPlans.rows,
//       razorpay_plans: razorpayPlans.length,
//       razorpay_plan_details: razorpayPlans,
//       razorpay_error: razorpayError
//     });
    
//   } catch (error) {
//     console.error("❌ Test failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Plan test failed",
//       error: error.message || "Test failed"
//     });
//   }
// };

// async function testRazorpayConnection(req, res) {
//   try {
//     console.log("🧪 Testing Razorpay API connection...");
    
//     // Test API keys first
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
//       throw new Error("Razorpay API keys not configured properly");
//     }
    
//     console.log("API Keys configured:", {
//       key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + "...",
//       secret: process.env.RAZORPAY_SECRET ? "✓ Present" : "✗ Missing"
//     });
    
//     const plans = await razorpay.plans.all({ count: 1 }); // Fetch one plan to test connection
//     console.log("✅ Successfully connected to Razorpay API. Plans fetched:", plans.items?.length || 0);
    
//     return res.status(200).json({
//       success: true,
//       message: "Successfully connected to Razorpay API",
//       plans_count: plans.items?.length || 0,
//       api_status: "Connected"
//     });
    
//   } catch (error) {
//     console.error("❌ Failed to connect to Razorpay API:", error);
//     console.error("Connection error type:", typeof error);
//     console.error("Connection error constructor:", error.constructor?.name);
    
//     let errorMessage = "Failed to connect to Razorpay API";
//     let errorDetails = {};
    
//     if (error) {
//       if (error.error) {
//         errorDetails.razorpay_error = error.error;
//         errorMessage = error.error.description || error.error.message || errorMessage;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       if (error.statusCode) {
//         errorDetails.status_code = error.statusCode;
//       }
//     }
    
//     return res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error_details: errorDetails,
//       api_status: "Disconnected"
//     });
//   }
// }

// module.exports = {
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testRazorpayConnection,
// };

// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const db = require("../config/db");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// const startSubscription = async (req, res) => {
//   try {
//     console.log("🔥 Starting subscription process");
//     console.log("Request body:", req.body);
//     console.log("User from auth:", req.user?.id);
    
//     const userId = req.user?.id;
//     const { plan_id } = req.body;
    
//     if (!userId) {
//       console.log("❌ No user ID");
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!plan_id) {
//       console.log("❌ No plan_id");
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing plan_id" 
//       });
//     }
    
//     console.log("✅ User ID:", userId, "Plan ID:", plan_id);
    
//     // Fetch plan from database
//     console.log("📦 Fetching plan from database...");
//     const planQuery = await db.query(
//       "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true", 
//       [plan_id]
//     );
    
//     console.log("Plan query result:", planQuery.rows);
    
//     if (planQuery.rows.length === 0) {
//       console.log("❌ Plan not found or inactive");
//       return res.status(404).json({ 
//         success: false,
//         message: "Plan not found or inactive" 
//       });
//     }
    
//     const plan = planQuery.rows[0];
//     console.log("📋 Plan details:", {
//       id: plan.id,
//       name: plan.name,
//       razorpay_plan_id: plan.razorpay_plan_id,
//       price: plan.price,
//       interval: plan.interval
//     });
    
//     // Check if plan has razorpay_plan_id
//     if (!plan.razorpay_plan_id) {
//       console.log("❌ Plan missing razorpay_plan_id");
//       return res.status(500).json({ 
//         success: false,
//         message: `Plan '${plan.name}' is not properly configured with Razorpay` 
//       });
//     }
    
//     // Get user details
//     console.log("👤 Fetching user details...");
//     const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    
//     if (userQuery.rows.length === 0) {
//       console.log("❌ User not found");
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }
    
//     const user = userQuery.rows[0];
//     console.log("👤 User details:", {
//       id: user.id,
//       name: user.name || user.username,
//       email: user.email,
//       existing_customer_id: user.razorpay_customer_id || 'none'
//     });
    
//     // Create or get Razorpay customer
//     let customerId = user.razorpay_customer_id;
    
//     if (!customerId) {
//       console.log("⚙️ Creating Razorpay customer...");
      
//       try {
//         const customerData = {
//           name: user.name || user.username || `User ${user.id}`,
//           email: user.email,
//           fail_existing: 0
//         };
        
//         // Add phone if available and valid
//         if (user.phone || user.contact) {
//           const phoneNumber = (user.phone || user.contact).toString().trim();
//           if (phoneNumber && phoneNumber.length >= 10) {
//             customerData.contact = phoneNumber;
//           }
//         }
        
//         console.log("Creating customer with:", customerData);
        
//         const customer = await razorpay.customers.create(customerData);
//         customerId = customer.id;
        
//         console.log("✅ Customer created:", customerId);
        
//         // Update user with customer ID
//         await db.query(
//           "UPDATE users SET razorpay_customer_id = $1 WHERE id = $2",
//           [customerId, userId]
//         );
        
//       } catch (customerError) {
//         console.error("❌ Customer creation failed:", customerError);
//         console.error("Customer error details:", {
//           message: customerError.message,
//           statusCode: customerError.statusCode,
//           error: customerError.error
//         });
        
//         return res.status(500).json({
//           success: false,
//           message: "Failed to create customer profile",
//           error: customerError.error?.description || customerError.message || "Customer creation failed"
//         });
//       }
//     }
    
//     // Validate Razorpay plan exists
//     console.log("🔍 Validating Razorpay plan exists...");
//     try {
//       const razorpayPlan = await razorpay.plans.fetch(plan.razorpay_plan_id);
//       console.log("✅ Razorpay plan found:", {
//         id: razorpayPlan.id,
//         name: razorpayPlan.item?.name,
//         amount: razorpayPlan.item?.amount,
//         currency: razorpayPlan.item?.currency
//       });
//     } catch (planFetchError) {
//       console.error("❌ Razorpay plan not found:", planFetchError);
//       return res.status(400).json({
//         success: false,
//         message: `Plan ${plan.razorpay_plan_id} not found in Razorpay. Please check plan configuration.`,
//         error: planFetchError.error?.description || planFetchError.message || "Plan validation failed"
//       });
//     }
    
//     // Create subscription
//     console.log("⚙️ Creating Razorpay subscription...");
//     console.log("Using plan_id:", plan.razorpay_plan_id);
    
//     // Define subscription data outside try block to avoid scoping issues
//     const subscriptionData = {
//       plan_id: plan.razorpay_plan_id,
//       customer_notify: 1,
//       quantity: 1,
//     };

//     // Set total_count based on plan interval
//     if (plan.interval && plan.interval !== 'lifetime') {
//       subscriptionData.total_count = 12; // Default to 12 cycles for non-lifetime plans
//     } else if (plan.interval === 'lifetime') {
//       subscriptionData.total_count = 1; // For lifetime, typically one charge
//     }
    
//     // Add customer_id if available
//     if (customerId) {
//       subscriptionData.customer_id = customerId;
//     }
    
//     // Log subscription data before sending to Razorpay
//     console.log("Sending subscription data to Razorpay:", JSON.stringify(subscriptionData, null, 2));
    
//     try {
//       const subscription = await razorpay.subscriptions.create(subscriptionData);
//       console.log("Raw Razorpay subscription response:", JSON.stringify(subscription, null, 2));
      
//       console.log("✅ Subscription created:", {
//         id: subscription.id,
//         status: subscription.status,
//         plan_id: subscription.plan_id,
//         customer_id: subscription.customer_id,
//         razorpay_plan_id_from_db: plan.razorpay_plan_id
//       });
      
//       // Save to database
//       console.log("💾 Saving to database...");
      
//       await db.query(
//         `INSERT INTO user_subscriptions 
//           (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date, created_at, updated_at)
//           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//           ON CONFLICT (user_id) DO UPDATE SET 
//             plan_id = EXCLUDED.plan_id,
//             razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
//             status = EXCLUDED.status,
//             current_token_balance = EXCLUDED.current_token_balance,
//             updated_at = CURRENT_TIMESTAMP`,
//         [
//           userId,
//           plan.id,
//           subscription.id,
//           subscription.status, // Use actual Razorpay status
//           plan.token_limit || 0,
//         ]
//       );
      
//       console.log("✅ Subscription saved to database");
      
//       // Return success response
//       const response = {
//         success: true,
//         subscription_id: subscription.id,
//         key: process.env.RAZORPAY_KEY_ID,
//         customer_id: customerId,
//         plan_name: plan.name,
//         amount: plan.price * 100, // Convert to paise
//         currency: 'INR'
//       };
      
//       console.log("🎉 Returning success response to frontend:", JSON.stringify(response, null, 2));
//       console.log("Frontend should receive subscription_id:", response.subscription_id);
      
//       return res.status(200).json(response);
      
//     } catch (subscriptionError) {
//       console.error("❌ Subscription creation failed:", subscriptionError);
      
//       let errorMessage = "Unknown subscription error";
//       let rawErrorDetails = {};

//       if (subscriptionError) {
//         if (subscriptionError.error) {
//           errorMessage = subscriptionError.error.description || subscriptionError.error.message || errorMessage;
//           rawErrorDetails = subscriptionError.error;
//         } else if (subscriptionError.message) {
//           errorMessage = subscriptionError.message;
//         } else if (typeof subscriptionError === 'string') {
//           errorMessage = subscriptionError;
//         }
//         rawErrorDetails = { ...rawErrorDetails, ...subscriptionError }; // Include all properties of subscriptionError
//       }
      
//       return res.status(500).json({
//         success: false,
//         message: "Failed to create subscription",
//         error: errorMessage,
//         raw_error: JSON.stringify(rawErrorDetails, Object.getOwnPropertyNames(rawErrorDetails))
//       });
//     }
    
//   } catch (err) {
//     console.error("❌ Unexpected error:", err);
//     console.error("Stack trace:", err.stack);
//     console.error("Error type:", typeof err);
//     console.error("Error constructor:", err.constructor?.name);
    
//     return res.status(500).json({
//       success: false,
//       message: "Subscription initiation failed",
//       error: err.message || "Unknown error occurred",
//       error_type: err.constructor?.name || "Unknown"
//     });
//   }
// };

// const verifySubscription = async (req, res) => {
//   try {
//     console.log("🔥 Verifying subscription payment");
    
//     const userId = req.user?.id;
//     const { 
//       razorpay_payment_id, 
//       razorpay_subscription_id, 
//       razorpay_signature 
//     } = req.body;
    
//     console.log("Verification data received:", {
//       userId,
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       has_signature: !!razorpay_signature
//     });
    
//     if (!userId) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing payment verification data" 
//       });
//     }
    
//     // Verify signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
//       .digest('hex');
    
//     if (expectedSignature !== razorpay_signature) {
//       console.log("❌ Invalid signature");
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid payment signature" 
//       });
//     }
    
//     console.log("✅ Signature verified");
    
//     // Update subscription status in database
//     const updateResult = await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'active', 
//            razorpay_payment_id = $1,
//            activated_at = CURRENT_TIMESTAMP,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $2 AND razorpay_subscription_id = $3
//        RETURNING *`,
//       [razorpay_payment_id, userId, razorpay_subscription_id]
//     );
    
//     if (updateResult.rows.length === 0) {
//       console.log("❌ Subscription not found in database");
//       return res.status(404).json({ 
//         success: false,
//         message: "Subscription not found" 
//       });
//     }
    
//     console.log("✅ Subscription verified and activated");
    
//     return res.status(200).json({
//       success: true,
//       message: "Subscription verified successfully",
//       subscription: updateResult.rows[0]
//     });
    
//   } catch (err) {
//     console.error("❌ Verification error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Subscription verification failed",
//       error: err.message || "Verification failed",
//     });
//   }
// };

// // Test endpoint to check plans
// const testPlans = async (req, res) => {
//   try {
//     console.log("🧪 Testing plan configuration...");
    
//     // Check database plans
//     const dbPlans = await db.query(
//       "SELECT id, name, razorpay_plan_id, price, interval, is_active FROM subscription_plans ORDER BY id"
//     );
    
//     console.log("Database plans:", dbPlans.rows);
    
//     // Check Razorpay plans with error handling
//     let razorpayPlans = [];
//     let razorpayError = null;
    
//     try {
//       const rzpPlans = await razorpay.plans.all({ count: 10 });
//       razorpayPlans = rzpPlans.items?.map(p => ({
//         id: p.id,
//         name: p.item?.name,
//         amount: p.item?.amount,
//         currency: p.item?.currency,
//         period: p.period
//       })) || [];
//     } catch (error) {
//       console.error("Failed to fetch Razorpay plans:", error);
//       razorpayError = error.message || "Failed to connect to Razorpay";
//     }
    
//     console.log("Razorpay plans:", razorpayPlans);
    
//     return res.json({
//       success: true,
//       database_plans: dbPlans.rows,
//       razorpay_plans: razorpayPlans.length,
//       razorpay_plan_details: razorpayPlans,
//       razorpay_error: razorpayError
//     });
    
//   } catch (error) {
//     console.error("❌ Test failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Plan test failed",
//       error: error.message || "Test failed"
//     });
//   }
// };

// async function testRazorpayConnection(req, res) {
//   try {
//     console.log("🧪 Testing Razorpay API connection...");
    
//     // Test API keys first
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
//       throw new Error("Razorpay API keys not configured properly");
//     }
    
//     console.log("API Keys configured:", {
//       key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + "...",
//       secret: process.env.RAZORPAY_SECRET ? "✓ Present" : "✗ Missing"
//     });
    
//     const plans = await razorpay.plans.all({ count: 1 }); // Fetch one plan to test connection
//     console.log("✅ Successfully connected to Razorpay API. Plans fetched:", plans.items?.length || 0);
    
//     return res.status(200).json({
//       success: true,
//       message: "Successfully connected to Razorpay API",
//       plans_count: plans.items?.length || 0,
//       api_status: "Connected"
//     });
    
//   } catch (error) {
//     console.error("❌ Failed to connect to Razorpay API:", error);
//     console.error("Connection error type:", typeof error);
//     console.error("Connection error constructor:", error.constructor?.name);
    
//     let errorMessage = "Failed to connect to Razorpay API";
//     let errorDetails = {};
    
//     if (error) {
//       if (error.error) {
//         errorDetails.razorpay_error = error.error;
//         errorMessage = error.error.description || error.error.message || errorMessage;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       if (error.statusCode) {
//         errorDetails.status_code = error.statusCode;
//       }
//     }
    
//     return res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error_details: errorDetails,
//       api_status: "Disconnected"
//     });
//   }
// }

// module.exports = {
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testRazorpayConnection,
// };

// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const db = require("../config/db");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// const startSubscription = async (req, res) => {
//   try {
//     console.log("🔥 Starting subscription process");
//     console.log("Request body:", req.body);
//     console.log("User from auth:", req.user?.id);
    
//     const userId = req.user?.id;
//     const { plan_id } = req.body;
    
//     if (!userId) {
//       console.log("❌ No user ID");
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!plan_id) {
//       console.log("❌ No plan_id");
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing plan_id" 
//       });
//     }
    
//     console.log("✅ User ID:", userId, "Plan ID:", plan_id);
    
//     // Fetch plan from database
//     console.log("📦 Fetching plan from database...");
//     const planQuery = await db.query(
//       "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true", 
//       [plan_id]
//     );
    
//     console.log("Plan query result:", planQuery.rows);
    
//     if (planQuery.rows.length === 0) {
//       console.log("❌ Plan not found or inactive");
//       return res.status(404).json({ 
//         success: false,
//         message: "Plan not found or inactive" 
//       });
//     }
    
//     const plan = planQuery.rows[0];
//     console.log("📋 Plan details:", {
//       id: plan.id,
//       name: plan.name,
//       razorpay_plan_id: plan.razorpay_plan_id,
//       price: plan.price,
//       interval: plan.interval
//     });
    
//     // Check if plan has razorpay_plan_id
//     if (!plan.razorpay_plan_id) {
//       console.log("❌ Plan missing razorpay_plan_id");
//       return res.status(500).json({ 
//         success: false,
//         message: `Plan '${plan.name}' is not properly configured with Razorpay` 
//       });
//     }
    
//     // Get user details
//     console.log("👤 Fetching user details...");
//     const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    
//     if (userQuery.rows.length === 0) {
//       console.log("❌ User not found");
//       return res.status(404).json({ 
//         success: false,
//         message: "User not found" 
//       });
//     }
    
//     const user = userQuery.rows[0];
//     console.log("👤 User details:", {
//       id: user.id,
//       name: user.name || user.username,
//       email: user.email,
//       existing_customer_id: user.razorpay_customer_id || 'none'
//     });
    
//     // Create or get Razorpay customer
//     let customerId = user.razorpay_customer_id;
    
//     if (!customerId) {
//       console.log("⚙️ Creating Razorpay customer...");
      
//       try {
//         const customerData = {
//           name: user.name || user.username || `User ${user.id}`,
//           email: user.email,
//           fail_existing: 0
//         };
        
//         // Add phone if available and valid
//         if (user.phone || user.contact) {
//           const phoneNumber = (user.phone || user.contact).toString().trim();
//           if (phoneNumber && phoneNumber.length >= 10) {
//             customerData.contact = phoneNumber;
//           }
//         }
        
//         console.log("Creating customer with:", customerData);
        
//         const customer = await razorpay.customers.create(customerData);
//         customerId = customer.id;
        
//         console.log("✅ Customer created:", customerId);
        
//         // Update user with customer ID
//         await db.query(
//           "UPDATE users SET razorpay_customer_id = $1 WHERE id = $2",
//           [customerId, userId]
//         );
        
//       } catch (customerError) {
//         console.error("❌ Customer creation failed:", customerError);
//         console.error("Customer error details:", {
//           message: customerError.message,
//           statusCode: customerError.statusCode,
//           error: customerError.error
//         });
        
//         return res.status(500).json({
//           success: false,
//           message: "Failed to create customer profile",
//           error: customerError?.error?.description || customerError?.message || "Customer creation failed"
//         });
//       }
//     }
    
//     // Validate Razorpay plan exists
//     console.log("🔍 Validating Razorpay plan exists...");
//     console.log(`Attempting to fetch Razorpay plan with ID: ${plan.razorpay_plan_id}`);

//     if (!plan.razorpay_plan_id || typeof plan.razorpay_plan_id !== 'string') {
//       console.error("❌ Invalid or missing Razorpay plan ID in database:", plan.razorpay_plan_id);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid plan configuration: Razorpay plan ID is missing or malformed.",
//         razorpay_plan_id: plan.razorpay_plan_id
//       });
//     }

//     try {
//       const razorpayPlan = await razorpay.plans.fetch(plan.razorpay_plan_id);
//       console.log("✅ Razorpay plan found:", {
//         id: razorpayPlan.id,
//         name: razorpayPlan.item?.name,
//         amount: razorpayPlan.item?.amount,
//         currency: razorpayPlan.item?.currency
//       });
//     } catch (planFetchError) {
//       console.error("❌ Razorpay plan not found or API error:", planFetchError);
//       console.error("Full planFetchError object:", JSON.stringify(planFetchError, Object.getOwnPropertyNames(planFetchError), 2));

//       let planErrorMessage = "Plan validation failed";
//       let planErrorDetails = {};

//       if (planFetchError instanceof TypeError) {
//         // Handle TypeError specifically, as it doesn't have a .error property
//         planErrorMessage = planFetchError.message;
//         planErrorDetails.fullError = {
//           name: planFetchError.name,
//           message: planFetchError.message,
//           stack: planFetchError.stack
//         };
//       } else if (planFetchError) {
//         // Handle standard Razorpay API errors or other errors
//         if (planFetchError.error && typeof planFetchError.error === 'object') {
//           planErrorMessage = planFetchError.error.description || planFetchError.error.message || planErrorMessage;
//           planErrorDetails.razorpay_error = planFetchError.error;
//         } else if (planFetchError.message) {
//           planErrorMessage = planFetchError.message;
//         } else if (typeof planFetchError === 'string') {
//           planErrorMessage = planFetchError;
//         }
        
//         if (planFetchError.statusCode) {
//           planErrorDetails.statusCode = planFetchError.statusCode;
//         }
        
//         planErrorDetails.fullError = {
//           name: planFetchError?.name,
//           message: planFetchError?.message,
//           stack: planFetchError?.stack,
//           ...(planFetchError.error && typeof planFetchError.error === 'object' && { razorpay_error_details: planFetchError.error })
//         };
//       }
      
//       return res.status(400).json({
//         success: false,
//         message: `Plan ${plan.razorpay_plan_id} not found in Razorpay. Please check plan configuration.`,
//         error: {
//           message: planErrorMessage,
//           details: planErrorDetails.fullError || {} // Ensure error is an object
//         },
//         error_details: planErrorDetails, // Keep for debugging
//         razorpay_plan_id: plan.razorpay_plan_id // Include the problematic plan ID
//       });
//     }
    
//     // Create subscription
//     console.log("⚙️ Creating Razorpay subscription...");
//     console.log("Using plan_id:", plan.razorpay_plan_id);
    
//     // Define subscription data outside try block to avoid scoping issues
//     const subscriptionData = {
//       plan_id: plan.razorpay_plan_id,
//       customer_notify: 1,
//       quantity: 1,
//     };

//     // Set total_count based on plan interval
//     if (plan.interval && plan.interval !== 'lifetime') {
//       subscriptionData.total_count = 12; // Default to 12 cycles for non-lifetime plans
//     } else if (plan.interval === 'lifetime') {
//       subscriptionData.total_count = 1; // For lifetime, typically one charge
//     }
    
//     // Add customer_id if available
//     // Add customer_id if available, ensuring it's a string
//     if (customerId) {
//       subscriptionData.customer_id = String(customerId);
//     }
    
//     // Log subscription data before sending to Razorpay
//     console.log("Sending subscription data to Razorpay:", JSON.stringify(subscriptionData, null, 2));
    
//     try {
//       const subscription = await razorpay.subscriptions.create(subscriptionData);
//       console.log("✅ Raw Razorpay subscription response (success):", JSON.stringify(subscription, null, 2));
      
//       console.log("✅ Subscription created successfully:", {
//         id: subscription.id,
//         status: subscription.status,
//         plan_id: subscription.plan_id,
//         customer_id: subscription.customer_id,
//         razorpay_plan_id_from_db: plan.razorpay_plan_id
//       });
      
//       // Save to database
//       console.log("💾 Saving to database...");
      
//       await db.query(
//         `INSERT INTO user_subscriptions 
//           (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date, created_at, updated_at)
//           VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//           ON CONFLICT (user_id) DO UPDATE SET 
//             plan_id = EXCLUDED.plan_id,
//             razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
//             status = EXCLUDED.status,
//             current_token_balance = EXCLUDED.current_token_balance,
//             updated_at = CURRENT_TIMESTAMP`,
//         [
//           userId,
//           plan.id,
//           subscription.id,
//           subscription.status, // Use actual Razorpay status
//           plan.token_limit || 0,
//         ]
//       );
      
//       console.log("✅ Subscription saved to database");
      
//       // Return success response
//       const response = {
//         success: true,
//         subscription_id: subscription.id,
//         key: process.env.RAZORPAY_KEY_ID,
//         customer_id: customerId,
//         plan: {
//           name: plan.name || 'Unknown Plan', // Provide a default name if plan.name is null
//           amount: plan.price * 100, // Convert to paise
//           currency: 'INR'
//         }
//       };
      
//       console.log("🎉 Returning success response to frontend:", JSON.stringify(response, null, 2));
//       console.log("Frontend should receive subscription_id:", response.subscription_id);
//       console.log("Final plan object in response:", JSON.stringify(response.plan, null, 2)); // Added log
      
//       return res.status(200).json(response);
      
//     } catch (subscriptionError) {
//       console.error("❌ Subscription creation failed:", subscriptionError);
//       console.error("Subscription error stack:", subscriptionError.stack);
      
//       let errorMessage = "Failed to create subscription";
//       let rawErrorDetails = {};

//       // Safely extract error information
//       if (subscriptionError) {
//         // Handle Razorpay API errors
//         // Safely handle Razorpay API errors (which often have an 'error' object)
//         if (subscriptionError && subscriptionError.error) {
//           errorMessage = subscriptionError.error.description || subscriptionError.error.message || errorMessage;
//           rawErrorDetails.razorpay_error = subscriptionError.error;
//         }
//         // Handle general Error objects
//         else if (subscriptionError instanceof Error) {
//           errorMessage = subscriptionError.message;
//           rawErrorDetails.name = subscriptionError.name;
//           rawErrorDetails.message = subscriptionError.message;
//           rawErrorDetails.stack = subscriptionError.stack;
//         }
//         // Handle cases where error is a string
//         else if (typeof subscriptionError === 'string') {
//           errorMessage = subscriptionError;
//         }
        
//         // Include status code if available
//         if (subscriptionError && subscriptionError.statusCode) {
//           rawErrorDetails.statusCode = subscriptionError.statusCode;
//         }
        
//         // Ensure fullError is always an object, even if empty
//         rawErrorDetails.fullError = {
//           name: subscriptionError?.name,
//           message: subscriptionError?.message,
//           stack: subscriptionError?.stack,
//           // Add other relevant properties if they exist directly on subscriptionError
//           ...(subscriptionError && subscriptionError.error && { razorpay_error_details: subscriptionError.error })
//         };
//       }
      
//       return res.status(500).json({
//         success: false,
//         message: "Failed to create subscription",
//         error: errorMessage,
//         raw_error: JSON.stringify(rawErrorDetails, Object.getOwnPropertyNames(rawErrorDetails))
//       });
//     }
    
//   } catch (err) {
//     console.error("❌ Unexpected error in startSubscription:", err);
//     console.error("Stack trace:", err.stack);
//     console.error("Error type:", typeof err);
//     console.error("Error constructor:", err.constructor?.name);

//     let errorMessage = "Subscription initiation failed due to an unexpected error.";
//     let errorDetails = {
//       name: err?.name || "UnknownError",
//       message: err?.message || "No message available",
//       stack: err?.stack || "No stack trace available",
//       originalError: JSON.stringify(err, Object.getOwnPropertyNames(err)) // Capture full error object
//     };
    
//     return res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error: {
//         message: errorMessage,
//         details: errorDetails
//       },
//       error_details: errorDetails, // For backward compatibility/detailed debugging
//       error_type: err?.constructor?.name || "Unknown"
//     });
//   }
// };

// const verifySubscription = async (req, res) => {
//   try {
//     console.log("🔥 Verifying subscription payment");
    
//     const userId = req.user?.id;
//     const { 
//       razorpay_payment_id, 
//       razorpay_subscription_id, 
//       razorpay_signature 
//     } = req.body;
    
//     console.log("Verification data received:", {
//       userId,
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       has_signature: !!razorpay_signature
//     });
    
//     if (!userId) {
//       return res.status(401).json({ 
//         success: false,
//         message: "Unauthorized user" 
//       });
//     }
    
//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Missing payment verification data" 
//       });
//     }
    
//     // Verify signature
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
//       .digest('hex');
    
//     if (expectedSignature !== razorpay_signature) {
//       console.log("❌ Invalid signature");
//       console.log("Expected:", expectedSignature);
//       console.log("Received:", razorpay_signature);
//       return res.status(400).json({ 
//         success: false,
//         message: "Invalid payment signature" 
//       });
//     }
    
//     console.log("✅ Signature verified");
    
//     // Update subscription status in database
//     const updateResult = await db.query(
//       `UPDATE user_subscriptions 
//        SET status = 'active', 
//            razorpay_payment_id = $1,
//            activated_at = CURRENT_TIMESTAMP,
//            updated_at = CURRENT_TIMESTAMP
//        WHERE user_id = $2 AND razorpay_subscription_id = $3
//        RETURNING *`,
//       [razorpay_payment_id, userId, razorpay_subscription_id]
//     );
    
//     if (updateResult.rows.length === 0) {
//       console.log("❌ Subscription not found in database");
//       return res.status(404).json({ 
//         success: false,
//         message: "Subscription not found" 
//       });
//     }
    
//     console.log("✅ Subscription verified and activated");
    
//     return res.status(200).json({
//       success: true,
//       message: "Subscription verified successfully",
//       subscription: updateResult.rows[0]
//     });
    
//   } catch (err) {
//     console.error("❌ Verification error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Subscription verification failed",
//       error: err?.message || "Verification failed",
//     });
//   }
// };

// // Test endpoint to check plans
// const testPlans = async (req, res) => {
//   try {
//     console.log("🧪 Testing plan configuration...");
    
//     // Check database plans
//     const dbPlans = await db.query(
//       "SELECT id, name, razorpay_plan_id, price, interval, is_active FROM subscription_plans ORDER BY id"
//     );
    
//     console.log("Database plans:", dbPlans.rows);
    
//     // Check Razorpay plans with error handling
//     let razorpayPlans = [];
//     let razorpayError = null;
    
//     try {
//       const rzpPlans = await razorpay.plans.all({ count: 10 });
//       razorpayPlans = rzpPlans.items?.map(p => ({
//         id: p.id,
//         name: p.item?.name,
//         amount: p.item?.amount,
//         currency: p.item?.currency,
//         period: p.period
//       })) || [];
//     } catch (error) {
//       console.error("Failed to fetch Razorpay plans:", error);
//       razorpayError = error?.message || "Failed to connect to Razorpay";
//     }
    
//     console.log("Razorpay plans:", razorpayPlans);
    
//     return res.json({
//       success: true,
//       database_plans: dbPlans.rows,
//       razorpay_plans: razorpayPlans.length,
//       razorpay_plan_details: razorpayPlans,
//       razorpay_error: razorpayError
//     });
    
//   } catch (error) {
//     console.error("❌ Test failed:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Plan test failed",
//       error: error?.message || "Test failed"
//     });
//   }
// };

// async function testRazorpayConnection(req, res) {
//   try {
//     console.log("🧪 Testing Razorpay API connection...");
    
//     // Test API keys first
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
//       throw new Error("Razorpay API keys not configured properly");
//     }
    
//     console.log("API Keys configured:", {
//       key_id: process.env.RAZORPAY_KEY_ID?.substring(0, 10) + "...",
//       secret: process.env.RAZORPAY_SECRET ? "✓ Present" : "✗ Missing"
//     });
    
//     const plans = await razorpay.plans.all({ count: 1 }); // Fetch one plan to test connection
//     console.log("✅ Successfully connected to Razorpay API. Plans fetched:", plans.items?.length || 0);
    
//     return res.status(200).json({
//       success: true,
//       message: "Successfully connected to Razorpay API",
//       plans_count: plans.items?.length || 0,
//       api_status: "Connected"
//     });
    
//   } catch (error) {
//     console.error("❌ Failed to connect to Razorpay API:", error);
//     console.error("Connection error type:", typeof error);
//     console.error("Connection error constructor:", error.constructor?.name);
    
//     let errorMessage = "Failed to connect to Razorpay API";
//     let errorDetails = {};
    
//     if (error) {
//       if (error.error) {
//         errorDetails.razorpay_error = error.error;
//         errorMessage = error.error.description || error.error.message || errorMessage;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       if (error.statusCode) {
//         errorDetails.status_code = error.statusCode;
//       }
//     }
    
//     return res.status(500).json({
//       success: false,
//       message: errorMessage,
//       error_details: errorDetails,
//       api_status: "Disconnected"
//     });
//   }
// }

// module.exports = {
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testRazorpayConnection,
// };


// backend/controllers/paymentController.js

// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const db = require("../config/db");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// const getCircularReplacer = () => {
//   const seen = new WeakSet();
//   return (key, value) => {
//     if (typeof value === "object" && value !== null) {
//       if (seen.has(value)) return;
//       seen.add(value);
//     }
//     return value;
//   };
// };

// const startSubscription = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { plan_id } = req.body;
//     if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });
//     if (!plan_id) return res.status(400).json({ success: false, message: "Missing plan_id" });

//     const planQuery = await db.query("SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true", [plan_id]);
//     if (planQuery.rows.length === 0) return res.status(404).json({ success: false, message: "Plan not found or inactive" });
//     const plan = planQuery.rows[0];
//     if (!plan.razorpay_plan_id) return res.status(500).json({ success: false, message: `Plan '${plan.name}' is not properly configured with Razorpay` });

//     const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
//     if (userQuery.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
//     const user = userQuery.rows[0];

//     let customerId = user.razorpay_customer_id;
//     if (!customerId) {
//       try {
//         const customerData = { name: user.name || user.username || `User ${user.id}`, email: user.email, fail_existing: 0 };
//         if (user.phone || user.contact) customerData.contact = user.phone || user.contact;
//         const customer = await razorpay.customers.create(customerData);
//         customerId = customer.id;
//         await db.query("UPDATE users SET razorpay_customer_id = $1 WHERE id = $2", [customerId, userId]);
//       } catch (customerError) {
//         return res.status(500).json({ success: false, message: "Failed to create customer profile", error: customerError?.message || "Unknown customer creation error" });
//       }
//     }

//     let subscription;
//     try {
//       const subscriptionData = {
//         plan_id: plan.razorpay_plan_id,
//         customer_notify: 1,
//         quantity: 1,
//       };
//       if (plan.interval !== 'lifetime') subscriptionData.total_count = 12;
//       else subscriptionData.total_count = 1;

//       // Add customer_id if available, ensuring it's a string
//       if (customerId) {
//         subscriptionData.customer_id = String(customerId);
//       }

//       subscription = await razorpay.subscriptions.create(subscriptionData);

//       if (!subscription || typeof subscription !== 'object' || !subscription.id) {
//         throw new Error("Invalid or null subscription response from Razorpay.");
//       }

//     } catch (err) {
//       const safeError = {
//         name: err?.name || "UnknownError",
//         message: err?.message || "Subscription creation failed",
//         stack: err?.stack || "No stack",
//         raw: err
//       };

//       if (err?.error && typeof err.error === 'object') {
//         safeError.razorpay_error = err.error;
//       }

//       return res.status(500).json({
//         success: false,
//         message: "Failed to create subscription",
//         error: safeError.message,
//         raw_error: JSON.stringify(safeError, getCircularReplacer())
//       });
//     }

//     await db.query(
//       `INSERT INTO user_subscriptions 
//         (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date, created_at, updated_at)
//        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
//        ON CONFLICT (user_id) DO UPDATE SET 
//          plan_id = EXCLUDED.plan_id,
//          razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
//          status = EXCLUDED.status,
//          current_token_balance = EXCLUDED.current_token_balance,
//          updated_at = CURRENT_TIMESTAMP`,
//       [userId, plan.id, subscription.id, subscription.status, plan.token_limit || 0]
//     );

//     return res.status(200).json({
//       success: true,
//       subscription_id: subscription.id,
//       key: process.env.RAZORPAY_KEY_ID,
//       customer_id: customerId,
//       plan
//     });

//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Subscription initiation failed due to an unexpected error.",
//       error: err?.message || "Unknown error",
//       raw_error: JSON.stringify(err, getCircularReplacer())
//     });
//   }
// };

// const verifySubscription = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
//     if (!userId || !razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Missing verification data" });
//     }
//     const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(`${razorpay_payment_id}|${razorpay_subscription_id}`).digest('hex');
//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Invalid payment signature" });
//     }
//     const updateResult = await db.query(
//       `UPDATE user_subscriptions SET status = 'active', razorpay_payment_id = $1, activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND razorpay_subscription_id = $3 RETURNING *`,
//       [razorpay_payment_id, userId, razorpay_subscription_id]
//     );
//     if (updateResult.rows.length === 0) return res.status(404).json({ success: false, message: "Subscription not found" });
//     return res.status(200).json({ success: true, message: "Subscription verified successfully", subscription: updateResult.rows[0] });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: "Subscription verification failed", error: err.message });
//   }
// };

// const testPlans = async (req, res) => {
//   try {
//     const dbPlans = await db.query("SELECT id, name, razorpay_plan_id, price, interval, is_active FROM subscription_plans ORDER BY id");
//     const rzpPlans = await razorpay.plans.all({ count: 10 });
//     return res.json({
//       success: true,
//       database_plans: dbPlans.rows,
//       razorpay_plans: rzpPlans.items?.length || 0,
//       razorpay_plan_details: rzpPlans.items?.map(p => ({ id: p.id, name: p.item?.name, amount: p.item?.amount, currency: p.item?.currency, period: p.period }))
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Plan test failed", error: error.message });
//   }
// };

// const testRazorpayConnection = async (req, res) => {
//   try {
//     const plans = await razorpay.plans.all({ count: 1 });
//     return res.status(200).json({
//       success: true,
//       message: "Successfully connected to Razorpay API",
//       plans_count: plans.items.length,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to connect to Razorpay API",
//       error: error.error?.description || error.message,
//       raw_error: JSON.stringify(error)
//     });
//   }
// };

// module.exports = {
//   startSubscription,
//   verifySubscription,
//   testPlans,
//   testRazorpayConnection,
// };

// backend/controllers/paymentController.js

const Razorpay = require("razorpay");
const crypto = require("crypto");
const db = require("../config/db");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  };
};

const startSubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { plan_id } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized user" });
    if (!plan_id) return res.status(400).json({ success: false, message: "Missing plan_id" });

    const planQuery = await db.query("SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true", [plan_id]);
    if (planQuery.rows.length === 0) return res.status(404).json({ success: false, message: "Plan not found or inactive" });
    const plan = planQuery.rows[0];
    if (!plan.razorpay_plan_id) return res.status(500).json({ success: false, message: `Plan '${plan.name}' is not properly configured with Razorpay` });

    const userQuery = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (userQuery.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    const user = userQuery.rows[0];

    let customerId = user.razorpay_customer_id;
    if (!customerId) {
      try {
        const customerData = { name: user.name || user.username || `User ${user.id}`, email: user.email, fail_existing: 0 };
        if (user.phone || user.contact) customerData.contact = user.phone || user.contact;
        const customer = await razorpay.customers.create(customerData);
        customerId = customer.id;
        await db.query("UPDATE users SET razorpay_customer_id = $1 WHERE id = $2", [customerId, userId]);
      } catch (customerError) {
        return res.status(500).json({ success: false, message: "Failed to create customer profile", error: customerError?.message || "Unknown customer creation error" });
      }
    }

    let subscription;
    try {
      const subscriptionData = {
        plan_id: plan.razorpay_plan_id,
        customer_notify: 1,
        quantity: 1,
        customer_id: String(customerId)
      };

      if (plan.interval !== 'lifetime') subscriptionData.total_count = 12;
      else subscriptionData.total_count = 1;

      console.log("📦 Subscription Payload:", subscriptionData);

      subscription = await razorpay.subscriptions.create(subscriptionData);

      if (!subscription || typeof subscription !== 'object' || !subscription.id) {
        throw new Error("Invalid or null subscription response from Razorpay.");
      }

    } catch (err) {
      const safeError = {
        name: err?.name || "UnknownError",
        message: err?.message || "Subscription creation failed",
        stack: err?.stack || "No stack",
        raw: err
      };

      if (err?.error && typeof err.error === 'object') {
        safeError.razorpay_error = err.error;
      }

      console.error("❌ Razorpay Subscription Error:", JSON.stringify(safeError, getCircularReplacer(), 2));

      return res.status(500).json({
        success: false,
        message: "Failed to create subscription",
        error: safeError.message,
        raw_error: JSON.stringify(safeError, getCircularReplacer())
      });
    }

    await db.query(
      `INSERT INTO user_subscriptions 
        (user_id, plan_id, razorpay_subscription_id, status, current_token_balance, last_reset_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET 
         plan_id = EXCLUDED.plan_id,
         razorpay_subscription_id = EXCLUDED.razorpay_subscription_id,
         status = EXCLUDED.status,
         current_token_balance = EXCLUDED.current_token_balance,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, plan.id, subscription.id, subscription.status, plan.token_limit || 0]
    );

    return res.status(200).json({
      success: true,
      subscription_id: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
      customer_id: customerId,
      plan
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Subscription initiation failed due to an unexpected error.",
      error: err?.message || "Unknown error",
      raw_error: JSON.stringify(err, getCircularReplacer())
    });
  }
};

const verifySubscription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    if (!userId || !razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing verification data" });
    }
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(`${razorpay_payment_id}|${razorpay_subscription_id}`).digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
    const updateResult = await db.query(
      `UPDATE user_subscriptions SET status = 'active', razorpay_payment_id = $1, activated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND razorpay_subscription_id = $3 RETURNING *`,
      [razorpay_payment_id, userId, razorpay_subscription_id]
    );
    if (updateResult.rows.length === 0) return res.status(404).json({ success: false, message: "Subscription not found" });
    return res.status(200).json({ success: true, message: "Subscription verified successfully", subscription: updateResult.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Subscription verification failed", error: err.message });
  }
};

const testPlans = async (req, res) => {
  try {
    const dbPlans = await db.query("SELECT id, name, razorpay_plan_id, price, interval, is_active FROM subscription_plans ORDER BY id");
    const rzpPlans = await razorpay.plans.all({ count: 10 });
    return res.json({
      success: true,
      database_plans: dbPlans.rows,
      razorpay_plans: rzpPlans.items?.length || 0,
      razorpay_plan_details: rzpPlans.items?.map(p => ({ id: p.id, name: p.item?.name, amount: p.item?.amount, currency: p.item?.currency, period: p.period }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Plan test failed", error: error.message });
  }
};

const testRazorpayConnection = async (req, res) => {
  try {
    const plans = await razorpay.plans.all({ count: 1 });
    return res.status(200).json({
      success: true,
      message: "Successfully connected to Razorpay API",
      plans_count: plans.items.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to connect to Razorpay API",
      error: error.error?.description || error.message,
      raw_error: JSON.stringify(error)
    });
  }
};

module.exports = {
  startSubscription,
  verifySubscription,
  testPlans,
  testRazorpayConnection,
};