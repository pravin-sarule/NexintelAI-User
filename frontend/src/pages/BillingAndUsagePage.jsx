

import React, { useState, useEffect } from 'react';
import { CreditCard, Users, Calendar, TrendingUp, Download, Settings, AlertCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const BillingAndUsagePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [resourceUtilizationData, setResourceUtilizationData] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingResourceUtilization, setLoadingResourceUtilization] = useState(false);

  // API configuration
  const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000';
  
  const getAuthToken = () => {
    // Try different possible token keys in localStorage
    const possibleKeys = ['authToken', 'token', 'accessToken', 'jwt', 'auth_token', 'access_token'];
    
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) {
        console.log(`Found token with key: ${key}`);
        return token;
      }
    }
    
    // Log all localStorage keys for debugging
    console.log('Available localStorage keys:', Object.keys(localStorage));
    console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
    
    return null;
  };

  // Helper function to make authenticated API calls
  const fetchAuthenticated = async (endpoint, options = {}) => {
    const token = getAuthToken();
    if (!token) {
      // Don't throw error immediately, try to get token from a login redirect or show login prompt
      console.warn('No authentication token found. Please log in.');
      setError('Authentication required. Please log in to view your billing information.');
      return null;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired or invalid
          localStorage.clear(); // Clear potentially invalid tokens
          sessionStorage.clear();
          setError('Your session has expired. Please log in again.');
          return null;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  };

  // Fetch plan details, all available plans, and user's active subscription
  const fetchPlanData = async () => {
    try {
      setLoadingPlans(true);
      setLoadingSubscription(true);
      setError(null);

      console.log('Fetching all plan and resource details...');
      const data = await fetchAuthenticated('/api/user-resources/plan-details');
      
      if (!data) {
        // fetchAuthenticated returned null due to auth issues
        return;
      }
      
      console.log('Fetched plan and resource details (all):', data);
      console.log('allPlanConfigurations from API:', data.allPlanConfigurations);
      console.log('activePlan from API:', data.activePlan);

      setPlanData(data);
      setAllPlans(data.allPlanConfigurations || []);
      setUserSubscription(data.activePlan || null);

    } catch (err) {
      setError(`Failed to fetch plan data: ${err.message}`);
      console.error('Error fetching plan data:', err);
    } finally {
      setLoadingPlans(false);
      setLoadingSubscription(false);
    }
  };

  // Fetch user transactions
  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      console.log('Fetching user transaction history...');
      const data = await fetchAuthenticated('/api/user-resources/transactions');
      
      if (!data) {
        // fetchAuthenticated returned null due to auth issues
        return;
      }
      
      console.log('Fetched transactions data:', data);
      
      // Handle the transactions array properly
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(`Failed to fetch transactions: ${err.message}`);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Fetch user resource utilization
  const fetchResourceUtilization = async () => {
    try {
      setLoadingResourceUtilization(true);
      console.log('Fetching user resource utilization...');
      const data = await fetchAuthenticated('/api/user-resources/resource-utilization');
      
      if (!data) {
        // fetchAuthenticated returned null due to auth issues
        return;
      }
      
      console.log('Fetched resource utilization data:', data);
      
      // Handle the resource utilization data structure
      setResourceUtilizationData(data.resourceUtilization || data.planDetails || null);
    } catch (err) {
      console.error('Error fetching resource utilization:', err);
      setError(`Failed to fetch resource utilization: ${err.message}`);
    } finally {
      setLoadingResourceUtilization(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPlanData(),
          fetchTransactions(),
          fetchResourceUtilization()
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
    if (limit === 'Unlimited' || limit === null || limit === undefined) return 0;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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

  const exportTransactionsToCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = [
      'Date', 'Description', 'Amount', 'Currency', 'Status', 'Payment Method', 'Invoice Number', 'Transaction Type'
    ];
    
    const csvRows = transactions.map(transaction => {
      const description = transaction.description || transaction.plan || transaction.action_description || 'Subscription Payment';
      const amount = transaction.amount || 0;
      const currency = transaction.currency || 'INR';
      const status = transaction.status || 'Completed';
      const paymentMethod = transaction.payment_method || 'N/A';
      const invoiceNumber = transaction.invoiceNumber || transaction.invoice || transaction.razorpay_order_id || `INV-${transaction.id}`;
      const type = transaction.type || 'N/A';

      return [
        formatDate(transaction.transaction_date),
        `"${description.replace(/"/g, '""')}"`,
        amount,
        currency,
        status,
        paymentMethod,
        invoiceNumber,
        type
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
    const receiptHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 700px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; font-size: 32px; margin-bottom: 10px;">NexintelAI</h1>
          <p style="color: #7f8c8d; font-size: 16px;">Payment Receipt</p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #555; width: 40%;"><strong>Transaction ID:</strong></td>
              <td style="padding: 8px 0; color: #333;">${transaction.id || transaction.razorpay_payment_id || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; color: #333;">${formatDate(transaction.transaction_date)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555;"><strong>Description:</strong></td>
              <td style="padding: 8px 0; color: #333;">${transaction.description || transaction.plan || transaction.action_description || 'Subscription Payment'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0; color: #333;">${transaction.payment_method || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555;"><strong>Invoice Number:</strong></td>
              <td style="padding: 8px 0; color: #333;">${transaction.invoiceNumber || transaction.invoice || transaction.razorpay_order_id || `INV-${transaction.id}`}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555;"><strong>Transaction Type:</strong></td>
              <td style="padding: 8px 0; color: #333;">${transaction.type || 'N/A'}</td>
            </tr>
            ${transaction.razorpay_payment_id ? `
            <tr>
              <td style="padding: 8px 0; color: #555;"><strong>Razorpay Payment ID:</strong></td>
              <td style="padding: 8px 0; color: #333;">${transaction.razorpay_payment_id}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; text-align: right;">
          <p style="font-size: 20px; color: #2c3e50; margin: 0;"><strong>Total Amount:</strong> ${transaction.amount ? formatCurrency(transaction.amount) : 'Free'}</p>
          <p style="font-size: 16px; color: #27ae60; margin-top: 5px;"><strong>Status:</strong> ${transaction.status || 'Completed'}</p>
        </div>
        
        <p style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 14px;">Thank you for your business!</p>
        <p style="text-align: center; color: #95a5a6; font-size: 12px;">Generated on ${formatDate(new Date())}</p>
      </div>
    `;

    html2pdf().from(receiptHtml).set({
      margin: 1,
      filename: `receipt_${transaction.id || transaction.razorpay_payment_id || 'unknown'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
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
      {error.includes('Authentication required') || error.includes('session has expired') ? (
        <div className="mt-4">
          <p className="text-sm text-red-600 mb-2">Please ensure you are logged in and try again.</p>
          <button
            onClick={() => {
              // Refresh the page or redirect to login
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-2"
          >
            Refresh Page
          </button>
          <button
            onClick={() => {
              // Clear any invalid tokens and redirect to login
              localStorage.clear();
              sessionStorage.clear();
              // Replace with your actual login route
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
            fetchResourceUtilization();
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );

  if (error && !planData && !resourceUtilizationData) {
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
                        {userSubscription.accountType || 'Individual'}
                      </div>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <div className="text-sm text-gray-500 font-medium mb-2">BILLING CYCLE</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userSubscription.billingCycle || userSubscription.billing_cycle || 'Monthly'}
                      </div>
                    </div>
                    <div className="border border-gray-200 p-6">
                      <div className="text-sm text-gray-500 font-medium mb-2">MONTHLY COST</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userSubscription.price || userSubscription.cost ? formatCurrency(userSubscription.price ?? userSubscription.cost) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Next Billing Date:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {formatDate(userSubscription.nextBillingDate || userSubscription.next_billing_date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {userSubscription.status || (userSubscription.is_active ? 'Active' : 'Inactive')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Plan Started:</span>{' '}
                        <span className="font-semibold text-gray-900">
                          {formatDate(userSubscription.startDate || userSubscription.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Summary */}
                <div className="bg-white border border-gray-300 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Utilization</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    {(planData.resourceUtilization || resourceUtilizationData) && Object.entries(planData.resourceUtilization || resourceUtilizationData).map(([key, resourceData]) => {
                      const used = resourceData?.used || resourceData?.used_gb || 0;
                      const limit = resourceData?.limit || resourceData?.remaining;
                      const percentage = getUsagePercentage(used, limit);
                      
                      return (
                        <div key={key} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded px-2 py-1">
                              {limit === 'Unlimited' || limit === null ? 'UNLIMITED' : `${percentage.toFixed(0)}% USED`}
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
                          {limit !== 'Unlimited' && limit !== null && (
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
            {activeTab === 'usage' && (planData || resourceUtilizationData) && (
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
                      {(planData?.resourceUtilization || resourceUtilizationData) && Object.entries(planData?.resourceUtilization || resourceUtilizationData).map(([feature, resourceData]) => {
                        const used = resourceData?.used || resourceData?.used_gb || 0;
                        const limit = resourceData?.limit || resourceData?.remaining;
                        const percentage = getUsagePercentage(used, limit);
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
                              {limit === 'Unlimited' || limit === null ? 'N/A' : `${percentage.toFixed(1)}%`}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`text-base font-semibold ${
                                status === 'Critical' ? 'text-red-600' :
                                status === 'High' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-base text-gray-500">
                              {formatDate(resourceData?.lastUpdated || resourceData?.expiration_date) || 'Recently'}
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
                            <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Invoice</th>
                            <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {transactions.map((transaction, index) => (
                            <tr key={`${transaction.id || 'no-id'}-${transaction.razorpay_payment_id || 'no-razorpay'}-${index}`} className="hover:bg-gray-50">
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-medium">
                                {formatDate(transaction.transaction_date)}
                              </td>
                              <td className="px-8 py-6 text-base text-gray-900 font-semibold">
                                {transaction.description || transaction.plan || transaction.action_description || 'Subscription Payment'}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-right font-medium">
                                {transaction.amount ? formatCurrency(transaction.amount) : 'Free'}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-center">
                                <span className={`px-3 py-1 text-sm font-bold rounded ${
                                  transaction.status === 'Paid' || transaction.status === 'Completed' || transaction.status === 'captured'
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === 'Pending' || transaction.status === 'authorized'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.status || 'Completed'}
                                </span>
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-mono text-center">
                                {transaction.invoiceNumber || transaction.invoice || transaction.razorpay_order_id || `INV-${transaction.id}`}
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
