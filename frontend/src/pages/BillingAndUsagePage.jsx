

import React, { useState } from 'react';
import { CreditCard, Users, Calendar, TrendingUp, Download, Settings } from 'lucide-react';

const BillingAndUsagePage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const currentPlan = {
    tier: 'Pro',
    type: 'Business',
    billingCycle: 'Monthly',
    price: 99.99,
    nextBillingDate: '2025-09-21',
    seats: 5,
    usedSeats: 3
  };

  const usageLimits = {
    basic: { documents: 10, queries: 100, storage: 1 },
    pro: { documents: 50, queries: 500, storage: 10 },
    enterprise: { documents: 'Unlimited', queries: 'Unlimited', storage: 100 }
  };

  const currentUsage = {
    documents: 32,
    queries: 287,
    storage: 6.8,
    apiCalls: 1250
  };

  const planHistory = [
    { date: '2025-08-21', plan: 'Pro Business Monthly', amount: 99.99, status: 'Paid', invoice: 'INV-2025-08-001' },
    { date: '2025-07-21', plan: 'Pro Business Monthly', amount: 99.99, status: 'Paid', invoice: 'INV-2025-07-001' },
    { date: '2025-06-21', plan: 'Basic Individual Monthly', amount: 19.99, status: 'Paid', invoice: 'INV-2025-06-001' },
    { date: '2025-05-21', plan: 'Basic Individual Monthly', amount: 19.99, status: 'Paid', invoice: 'INV-2025-05-001' }
  ];

  const pricingPlans = [
    {
      tier: 'Basic',
      individual: { monthly: 19.99, quarterly: 53.97, yearly: 191.90 },
      business: { monthly: 39.99, quarterly: 107.97, yearly: 383.90 }
    },
    {
      tier: 'Pro',
      individual: { monthly: 49.99, quarterly: 134.97, yearly: 479.90 },
      business: { monthly: 99.99, quarterly: 269.97, yearly: 959.90 }
    },
    {
      tier: 'Enterprise',
      individual: { monthly: 199.99, quarterly: 539.97, yearly: 1919.90 },
      business: { monthly: 399.99, quarterly: 1079.97, yearly: 3839.90 }
    }
  ];

  const getUsagePercentage = (used, limit) => {
    if (limit === 'Unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
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
          <TabButton id="plans" label="Subscription Plans" icon={CreditCard} />
          <TabButton id="history" label="Billing Records" icon={Download} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                  <div className="text-2xl font-bold text-gray-900">{currentPlan.tier}</div>
                </div>
                <div className="border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 font-medium mb-2">ACCOUNT TYPE</div>
                  <div className="text-2xl font-bold text-gray-900">{currentPlan.type}</div>
                </div>
                <div className="border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 font-medium mb-2">BILLING CYCLE</div>
                  <div className="text-2xl font-bold text-gray-900">{currentPlan.billingCycle}</div>
                </div>
                <div className="border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 font-medium mb-2">MONTHLY COST</div>
                  <div className="text-2xl font-bold text-gray-900">${currentPlan.price}</div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Next Billing Date:</span> <span className="font-semibold text-gray-900">{currentPlan.nextBillingDate}</span></div>
                  <div><span className="text-gray-500">Team Utilization:</span> <span className="font-semibold text-gray-900">{currentPlan.usedSeats}/{currentPlan.seats} seats</span></div>
                </div>
              </div>
            </div>

            {/* Usage Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Utilization</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {Object.entries(currentUsage).map(([key, value]) => {
                  const limit = usageLimits[currentPlan.tier.toLowerCase()][key] || 'N/A';
                  const percentage = getUsagePercentage(value, limit);
                  
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          {key === 'apiCalls' ? 'API Calls' : key}
                        </span>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded px-2 py-1">
                          {limit === 'Unlimited' ? 'UNLIMITED' : `${percentage.toFixed(0)}% USED`}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {key === 'storage' ? `${value} GB` : value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {limit === 'Unlimited' ? 'No restrictions' : `of ${limit}${key === 'storage' ? ' GB' : ''} limit`}
                      </div>
                      {limit !== 'Unlimited' && (
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 bg-gray-900 rounded-full transition-all"
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
        {activeTab === 'usage' && (
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(currentUsage).map(([feature, usage]) => {
                    const limit = usageLimits[currentPlan.tier.toLowerCase()][feature];
                    const percentage = getUsagePercentage(usage, limit);
                    const status = percentage >= 90 ? 'Critical' : percentage >= 70 ? 'High' : 'Normal';
                    
                    return (
                      <tr key={feature} className="hover:bg-gray-50">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-base font-semibold text-gray-900 capitalize">
                            {feature === 'apiCalls' ? 'API Calls' : feature}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-medium">
                          {feature === 'storage' ? `${usage} GB` : usage.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700">
                          {limit === 'Unlimited' ? 'Unlimited' : `${limit}${feature === 'storage' ? ' GB' : ''}`}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700">
                          {limit === 'Unlimited' ? 'N/A' : `${percentage.toFixed(1)}%`}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-base font-semibold text-gray-900">{status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscription Plans Tab */}
        {activeTab === 'plans' && (
          <div className="bg-white border border-gray-300 rounded-lg">
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Subscription Plans</h2>
              <p className="text-gray-600">Comprehensive pricing matrix for all plan tiers and billing configurations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Plan Tier</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Individual Monthly</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Individual Quarterly</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Individual Yearly</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Business Monthly</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Business Quarterly</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Business Yearly</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pricingPlans.map((plan) => (
                    <tr key={plan.tier} className={`hover:bg-gray-50 ${currentPlan.tier === plan.tier ? 'bg-gray-100' : ''}`}>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-base font-bold text-gray-900">{plan.tier}</div>
                          {currentPlan.tier === plan.tier && (
                            <span className="ml-3 px-3 py-1 text-xs bg-black text-white font-medium rounded">ACTIVE</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center font-medium">${plan.individual.monthly}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center font-medium">${plan.individual.quarterly}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center font-medium">${plan.individual.yearly}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center font-medium">${plan.business.monthly}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center font-medium">${plan.business.quarterly}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-center font-medium">${plan.business.yearly}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        {currentPlan.tier === plan.tier ? (
                          <button className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800 transition-colors">Modify Plan</button>
                        ) : (
                          <button className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800 transition-colors">Select Plan</button>
                        )}
                      </td>
                    </tr>
                  ))}
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
              <button className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center">
                <Download size={18} className="mr-2" />
                Export Records
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Transaction Date</th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Subscription Plan</th>
                    <th className="px-8 py-4 text-right text-sm font-bold text-gray-900 uppercase tracking-wide">Amount</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Payment Status</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Invoice Number</th>
                    <th className="px-8 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {planHistory.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-medium">{record.date}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-900 font-semibold">{record.plan}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 text-right font-medium">${record.amount}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                          <span className="px-3 py-1 text-sm font-bold bg-gray-100 text-gray-900 rounded">
                          {record.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-base text-gray-700 font-mono text-center">{record.invoice}</td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        <button className="bg-black text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-800 transition-colors mr-2">Download</button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded hover:bg-gray-50 transition-colors">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingAndUsagePage;