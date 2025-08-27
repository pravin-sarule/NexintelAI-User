// frontend_api_examples.js

const BASE_URL = 'http://localhost:3000'; // Replace with your actual backend URL
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with a valid JWT token for an authenticated user

// Helper function to make authenticated API calls
async function fetchAuthenticated(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// 1. Fetch User Resource Utilization
async function fetchUserUtilization() {
    try {
        console.log('Fetching user resource utilization...');
        const data = await fetchAuthenticated('/api/user-resources/resource-utilization');
        console.log('User Utilization Data:', data);
        // Example of how to use the data in your frontend:
        // const { planDetails, resourceUtilization } = data;
        // console.log('Current Plan:', planDetails.plan_name);
        // console.log('Tokens Remaining:', resourceUtilization.tokens.remaining);
        // console.log('Tokens Expiration Date:', resourceUtilization.tokens.expiration_date);
        // console.log('Latest Token Usage:', resourceUtilization.tokens.latest_usage_details);
        // console.log('Storage Used:', resourceUtilization.storage.used_gb);
        return data;
    } catch (error) {
        console.error('Error fetching user utilization:', error);
    }
}

// 2. Fetch User Transaction History
async function fetchUserTransactions() {
    try {
        console.log('Fetching user transaction history...');
        const data = await fetchAuthenticated('/api/user-resources/transactions');
        console.log('User Transactions Data:', data);
        // Example of how to use the data in your frontend:
        // data.transactions.forEach(transaction => {
        //     console.log(`Type: ${transaction.type}, Date: ${new Date(transaction.transaction_date).toLocaleString()}, Details: ${transaction.action_description || transaction.status}`);
        //     if (transaction.type === 'payment') {
        //         console.log(`  Amount: ${transaction.amount} ${transaction.currency}, Status: ${transaction.status}, Method: ${transaction.payment_method}`);
        //         console.log(`  Razorpay Payment ID: ${transaction.razorpay_payment_id}, Order ID: ${transaction.razorpay_order_id}, Signature: ${transaction.razorpay_signature}`);
        //         console.log(`  Invoice Link: ${transaction.invoice_link}`);
        //     }
        // });
        return data;
    } catch (error) {
        console.error('Error fetching user transactions:', error);
    }
}

// 3. Fetch Plan and Resource Details (General)
async function fetchPlanAndResourceDetails() {
    try {
        console.log('Fetching all plan and resource details...');
        const data = await fetchAuthenticated('/api/user-resources/plan-details');
        console.log('Plan and Resource Details (All):', data);
        // Example of how to use the data in your frontend:
        // const { activePlan, allPlanConfigurations } = data;
        // console.log('Active Plan:', activePlan?.plan_name || 'None');
        // allPlanConfigurations.forEach(plan => {
        //     console.log(`Plan: ${plan.name}, Active: ${plan.is_active_plan ? 'Yes' : 'No'}, Token Limit: ${plan.token_limit}`);
        // });
        return data;
    } catch (error) {
        console.error('Error fetching plan and resource details:', error);
    }
}

// 4. Fetch Plan and Resource Details (Specific Service)
async function fetchPlanAndResourceDetailsForService(serviceName) {
    try {
        console.log(`Fetching plan and resource details for service: ${serviceName}...`);
        const data = await fetchAuthenticated(`/api/user-resources/plan-details?service=${serviceName}`);
        console.log(`Plan and Resource Details (${serviceName}):`, data);
        // Example of how to use the data in your frontend:
        // const { activePlan, resourceUtilization } = data;
        // console.log('Active Plan:', activePlan?.plan_name || 'None');
        // console.log(`Utilization for ${serviceName}:`, resourceUtilization[serviceName]);
        return data;
    } catch (error) {
        console.error(`Error fetching plan and resource details for ${serviceName}:`, error);
    }
}

// Example Usage (call these functions in your frontend components/pages)
// Make sure to replace 'YOUR_JWT_TOKEN_HERE' with an actual token.
// fetchUserUtilization();
// fetchUserTransactions();
// fetchPlanAndResourceDetails();
// fetchPlanAndResourceDetailsForService('documents');
// fetchPlanAndResourceDetailsForService('queries');
// fetchPlanAndResourceDetailsForService('storage');