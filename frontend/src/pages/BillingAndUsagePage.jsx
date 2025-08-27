import React, { useState, useEffect } from 'react';
import { CreditCard, Users, Calendar, TrendingUp, Download, Settings, AlertCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../services/api'; // Import the API service

const BillingAndUsagePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(null); // Will now hold activePlan, resourceUtilization, allPlanConfigurations
  const [allPlans, setAllPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [latestPayment, setLatestPayment] = useState(null); // New state for latest payment
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  // Fetch plan details, all available plans, and user's active subscription
  const fetchPlanData = async () => {
    try {
      setLoadingPlans(true);
      setLoadingSubscription(true);
      setError(null);

      console.log('Fetching all plan and resource details...');
      const data = await api.getUserPlanDetails(); // Use the new API service method
      
      console.log('Fetched plan and resource details (all):', data);
      console.log('allPlanConfigurations from API:', data.allPlanConfigurations);
      console.log('activePlan from API:', data.activePlan);
      console.log('resourceUtilization from API:', data.resourceUtilization);
      console.log('latestPayment from API:', data.latestPayment); // Log latestPayment

      setPlanData(data); // Set the entire response data
      setAllPlans(data.allPlanConfigurations || []);
      setUserSubscription(data.activePlan || null);
      setLatestPayment(data.latestPayment || null); // Set latest payment

    } catch (err) {
      setError(`Failed to fetch plan data: ${err.message}`);
      console.error('Error fetching plan data:', err);
      if (err.message.includes('Authentication required') || err.message.includes('session has expired')) {
        localStorage.clear();
        sessionStorage.clear();
        // Optionally redirect to login
        // window.location.href = '/login'; 
      }
    } finally {
      setLoadingPlans(false);
      setLoadingSubscription(false);
    }
  };

  // Fetch user transactions (now payment history)
  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      console.log('Fetching user payment history...');
      const data = await api.fetchPaymentHistory(); // Use the new API service method
      
      console.log('Fetched payment history data:', data);
      if (data.data && Array.isArray(data.data)) { // Assuming data.data is the array of payments
        data.data.forEach((t, i) => console.log(`Payment Transaction ${i}:`, t)); // Detailed log for debugging
        setTransactions(data.data);
      } else {
        console.warn('No payment history array found in response');
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(`Failed to fetch payment history: ${err.message}`);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPlanData(),
          fetchTransactions(),
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const getUsagePercentage = (used, limit) => {
    if (limit === 'Unlimited' || limit === null || limit === undefined || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'INR') => { // Added currency parameter
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-3 font-medium transition-colors border rounded-lg ${
        activeTab === id
          ? 'bg-black text-white border-black'
          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Icon size={18} className="mr-2" />
      {label}
    </button>
  );

  const getTransactionAmountDisplay = (transaction) => {
    // For payment history, amount is in smallest unit, so divide by 100
    if (transaction.amount) {
      return formatCurrency(parseFloat(transaction.amount) || 0, transaction.currency || 'INR');
    }
    return 'N/A'; 
  };

  const exportTransactionsToCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = [
      'Date', 'Description', 'Amount', 'Currency', 'Status', 'Payment Method', 'Invoice Number', 'Transaction Type', 'Razorpay Payment ID', 'Razorpay Order ID', 'Subscription ID'
    ];
    
    const csvRows = transactions.map(transaction => {
      const description = transaction.plan_name || 'Subscription Payment'; // Use plan_name for description
      const amountDisplay = getTransactionAmountDisplay(transaction);
      const currency = transaction.currency || 'INR';
      const status = transaction.payment_status || 'N/A'; // Use payment_status
      const paymentMethod = transaction.payment_method || 'N/A';
      const invoiceNumber = transaction.razorpay_payment_id || transaction.payment_id || 'N/A'; // Use razorpay_payment_id or payment_id for invoice
      const type = 'payment'; // Assuming payment history items are always payments

      return [
        formatDate(transaction.payment_date || transaction.transaction_date), // Use payment_date for payment history
        `"${description.replace(/"/g, '""')}"`,
        amountDisplay,
        currency,
        status,
        paymentMethod,
        invoiceNumber,
        type,
        transaction.razorpay_payment_id || 'N/A',
        transaction.razorpay_order_id || 'N/A', // Keep razorpay_order_id for completeness if available
        transaction.user_subscription_id || 'N/A' // Use user_subscription_id
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [
      headers.map(header => `"${header}"`).join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'transactions_history.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadReceipt = (transaction) => {
    const amountDisplay = getTransactionAmountDisplay(transaction);
    const paymentMethodDisplay = transaction.payment_method || 'N/A';

    const receiptHtml = `
      <div style="font-family: 'Arial', sans-serif; padding: 40px; max-width: 750px; margin: auto; border: 1px solid #cccccc; border-radius: 10px; background-color: #f9f9f9; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #333333;">
          <img src="https://www.nexintelai.com/assets/img/Ai%20logo-01.png" alt="NexintelAI Logo" style="width: 180px; margin-bottom: 20px;"/>
          <h1 style="color: #333333; font-size: 32px; margin: 0;">OFFICIAL PAYMENT RECEIPT</h1>
          <p style="color: #666666; font-size: 16px; margin-top: 10px;">Thank you for your recent payment.</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px 0; color: #555; width: 40%; font-weight: bold;">Receipt Number:</td>
              <td style="padding: 10px 0; color: #333;">${transaction.razorpay_payment_id || transaction.payment_id || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Date:</td>
              <td style="padding: 10px 0; color: #333;">${formatDate(transaction.payment_date || transaction.transaction_date)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Description:</td>
              <td style="padding: 10px 0; color: #333;">${transaction.plan_name || 'Subscription Payment'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Payment Method:</td>
              <td style="padding: 10px 0; color: #333;">${paymentMethodDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Payment Status:</td>
              <td style="padding: 10px 0; color: #333;">${transaction.payment_status || 'N/A'}</td>
            </tr>
            ${transaction.razorpay_payment_id ? `
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Razorpay Payment ID:</td>
              <td style="padding: 10px 0; color: #333;">${transaction.razorpay_payment_id}</td>
            </tr>
            ` : ''}
            ${transaction.razorpay_order_id ? `
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Razorpay Order ID:</td>
              <td style="padding: 10px 0; color: #333;">${transaction.razorpay_order_id}</td>
            </tr>
            ` : ''}
            ${transaction.user_subscription_id ? `
            <tr>
              <td style="padding: 10px 0; color: #555; font-weight: bold;">Subscription ID:</td>
              <td style="padding: 10px 0; color: #333;">${transaction.user_subscription_id}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="border-top: 2px solid #333333; padding-top: 25px; margin-top: 30px; text-align: right;">
          <p style="font-size: 24px; color: #333333; margin: 0;"><strong>TOTAL PAID:</strong> ${amountDisplay}</p>
          <p style="font-size: 16px; color: #28a745; margin-top: 10px;"><strong>Payment Status:</strong> ${transaction.payment_status || 'N/A'}</p>
        </div>
        
        <p style="text-align: center; margin-top: 50px; color: #888888; font-size: 13px;">This is an electronically generated receipt and does not require a signature.</p>
        <p style="text-align: center; color: #aaaaaa; font-size: 12px;">Generated on ${formatDate(new Date())}</p>
      </div>
    `;

    html2pdf().from(receiptHtml).set({
      margin: 1,
      filename: `receipt_${transaction.id || transaction.razorpay_payment_id || 'unknown'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // Added useCORS: true
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      <span className="ml-3 text-gray-600">Loading data...</span>
    </div>
  );

  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <h3 className="text-red-800 font-medium">Error loading data</h3>
      </div>
      <p className="text-red-700 mt-2">{error}</p>
      {error && (error.includes('Authentication required') || error.includes('session has expired')) ? (
        <div className="mt-4">
          <p className="text-sm text-red-600 mb-2">Please ensure you are logged in and try again.</p>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-2"
          >
            Refresh Page
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            fetchPlanData();
            fetchTransactions();
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );

  if (error && !planData) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Usage Dashboard</h1>
            <p className="text-gray-600">Comprehensive subscription management and usage analytics</p>
          </div>
          <ErrorMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Usage Dashboard</h1>
          <p className="text-gray-600">Comprehensive subscription management and usage analytics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" icon={TrendingUp} />
          <TabButton id="usage" label="Usage Analytics" icon={Calendar} />
          <TabButton id="history" label="Billing Records" icon={Download} />
        </div>

        {loading || loadingPlans || loadingSubscription ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && planData && userSubscription && (
              <div className="space-y-8">
                {/* Current Plan Details */}
                <div className="bg-white border border-gray-300 rounded-lg p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Subscription</h2>
                      <p className="text-gray-600">Current plan configuration and billing details</p>
                    </div>
                    <button className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center">
                      <Settings size={18} className="mr-2" />
                      Manage Subscription
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="text-sm text-gray-500 font-medium mb-2">PLAN TIER</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userSubscription.plan_name || userSubscription.name || 'Basic'}
                      </div>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <div className="text-sm text-gray-500 font-medium mb-2">ACCOUNT TYPE</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userSubscription.type || userSubscription.accountType || 'Individual'}
                      </div>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <div className="text-sm text-gray-500 font-medium mb-2">BILLING CYCLE</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userSubscription.interval || userSubscription.billingCycle || userSubscription.billing_cycle || 'Monthly'}
                      </div>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <div className="text-sm text-gray-500 font-medium mb-2">MONTHLY COST</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userSubscription.price || userSubscription.cost ? 
                          formatCurrency(userSubscription.price ?? userSubscription.cost, userSubscription.currency) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Next Billing Date:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {formatDate(userSubscription.end_date || userSubscription.nextBillingDate || userSubscription.next_billing_date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {userSubscription.subscription_status || userSubscription.status || (userSubscription.is_active ? 'Active' : 'Inactive')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Plan Started:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {formatDate(userSubscription.start_date || userSubscription.startDate || userSubscription.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latest Payment Details */}
                {latestPayment && (
                  <div className="bg-white border border-gray-300 rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Payment</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="border border-gray-200 rounded-lg p-6">
                        <div className="text-sm text-gray-500 font-medium mb-2">AMOUNT</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(parseFloat(latestPayment.amount) / 100, latestPayment.currency)}
                        </div>
                      </div>
                      <div className="border border-gray-200 p-6">
                        <div className="text-sm text-gray-500 font-medium mb-2">PAYMENT METHOD</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {latestPayment.payment_method || 'N/A'}
                        </div>
                      </div>
                      <div className="border border-gray-200 p-6">
                        <div className="text-sm text-gray-500 font-medium mb-2">STATUS</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {latestPayment.status || 'N/A'}
                        </div>
                      </div>
                      <div className="border border-gray-200 p-6">
                        <div className="text-sm text-gray-500 font-medium mb-2">PAYMENT DATE</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatDate(latestPayment.payment_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Usage Summary */}
                <div className="bg-white border border-gray-300 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Utilization</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    {planData.resourceUtilization && Object.entries(planData.resourceUtilization).map(([key, resourceData]) => {
                      const used = resourceData?.total_used || resourceData?.used_gb || 0;
                      const limit = resourceData?.limit || resourceData?.limit_gb;
                      const percentage = parseFloat(resourceData?.percentage_used) || getUsagePercentage(used, limit); // Parse to float
                      
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded px-2 py-1">
                              {limit === 'Unlimited' || limit === null || limit === undefined ? 'UNLIMITED' : `${percentage.toFixed(0)}% USED`}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {key.toLowerCase().includes('storage') ? `${used} GB` : used.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {limit === 'Unlimited' || limit === null || limit === undefined
                              ? 'No restrictions'
                              : `of ${limit.toLocaleString()}${key.toLowerCase().includes('storage') ? ' GB' : ''} limit`
                            }
                          </div>
                          {limit !== 'Unlimited' && limit !== null && limit !== undefined && (
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  percentage >= 90 ? 'bg-red-500' :
                                  percentage >= 70 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Usage Analytics Tab */}
            {activeTab === 'usage' && planData && planData.resourceUtilization && (
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="p-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Usage Analytics</h2>
                  <p className="text-gray-600">Comprehensive breakdown of feature utilization and consumption metrics</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Feature</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Current Usage</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Plan Allocation</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Utilization Rate</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Status</th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {planData.resourceUtilization && Object.entries(planData.resourceUtilization).map(([feature, resourceData]) => {
                        const used = resourceData?.total_used || resourceData?.used_gb || 0;
                        const limit = resourceData?.limit || resourceData?.limit_gb;
                        const percentage = parseFloat(resourceData?.percentage_used) || getUsagePercentage(used, limit); // Parse to float
                        const status = percentage >= 90 ? 'Critical' : percentage >= 70 ? 'High' : 'Normal';
                        
                        return (
                          <tr key={feature} className="hover:bg-gray-50">
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-base font-semibold text-gray-900">
                                {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-medium">
                              {feature.toLowerCase().includes('storage') ? `${used} GB` : used.toLocaleString()}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700">
                              {limit === 'Unlimited' || limit === null || limit === undefined
                                ? 'Unlimited'
                                : `${limit.toLocaleString()}${feature.toLowerCase().includes('storage') ? ' GB' : ''}`
                              }
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700">
                              {limit === 'Unlimited' || limit === null || limit === undefined ? 'N/A' : `${percentage.toFixed(1)}%`}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`px-3 py-1 text-sm font-bold rounded ${
                                status === 'Critical' ? 'text-red-600' :
                                status === 'High' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                              {formatDate(resourceData?.latest_usage_details?.latest_usage_date || resourceData?.expiration_date) || 'Recently'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Billing Records Tab */}
            {activeTab === 'history' && (
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="p-8 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Transaction History</h2>
                    <p className="text-gray-600">Complete record of payments, invoices, and subscription changes</p>
                  </div>
                  <button
                    onClick={exportTransactionsToCSV}
                    className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                  >
                    <Download size={18} className="mr-2" />
                    Export Records
                  </button>
                </div>
                
                {loadingTransactions ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    {transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transaction History</h3>
                        <p className="text-gray-600">Your transaction history will appear here once you make your first payment.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Date</th>
                            <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Description</th>
                            <th className="px-8 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-wide">Amount</th>
                            <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Status</th>
                            <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Payment Method</th>
                            <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Invoice</th>
                            <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {transactions.map((transaction, index) => (
                            <tr key={`${transaction.id || 'no-id'}-${transaction.razorpay_payment_id || 'no-razorpay'}-${index}`} className="hover:bg-gray-50">
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-medium">
                                {formatDate(transaction.payment_date || transaction.transaction_date)}
                              </td>
                              <td className="px-8 py-6 text-base text-gray-900 font-semibold">
                                {transaction.plan_name || 'Subscription Payment'}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-right font-medium">
                                {getTransactionAmountDisplay(transaction)}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-center">
                                <span className={`px-3 py-1 text-sm font-bold rounded ${
                                  transaction.payment_status === 'captured'
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.payment_status === 'pending' || transaction.payment_status === 'authorized'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.payment_status || 'N/A'}
                                </span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center">
                                {transaction.payment_method || 'N/A'}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-mono text-center">
                                {transaction.razorpay_payment_id || transaction.payment_id || 'N/A'}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-center">
                                {transaction.invoice_link && (
                                  <a
                                    href={transaction.invoice_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800 transition-colors mr-2"
                                  >
                                    View Invoice
                                  </a>
                                )}
                                <button
                                  onClick={() => downloadReceipt(transaction)}
                                  className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
                                >
                                  Download Receipt
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BillingAndUsagePage;