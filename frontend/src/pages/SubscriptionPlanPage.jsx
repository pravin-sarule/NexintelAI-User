import React, { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext

const SubscriptionPlanPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' or 'yearly'
  const [planType, setPlanType] = useState('individual'); // 'individual' or 'team'
  const [plans, setPlans] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false); // State to control payment form visibility
  const [selectedPlan, setSelectedPlan] = useState(null); // State to store the selected plan

  useEffect(() => {
    // Simulate fetching data from an administrative backend
    // In a real application, this would be an API call:
    // fetch('/api/plans')
    //   .then(response => response.json())
    //   .then(data => setPlans(data))
    //   .catch(error => console.error('Error fetching plans:', error));

    const fetchedPlans = [
      {
        id: 'free',
        name: 'Free',
        tagline: 'Meet Claude',
        icon: (
          <svg className="h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12h-4m-7 0h-4M7.21 14.77l-2.832 4.904A2 2 0 011.91 21h16.18a2 2 0 001.728-3.224L12.79 8.23" />
          </svg>
        ),
        prices: {
          monthly: '$0',
          yearly: '$0',
        },
        features: [
          'Chat with Claude on web, iOS, and Android',
          'Write, edit, and create content',
          'Analyze text and upload images',
          'Generate code and visualize data',
          'Get web search results inside chat',
        ],
        buttonText: 'Use Claude for free',
        buttonClass: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
      },
      {
        id: 'pro',
        name: 'Pro',
        tagline: 'Research, code, and organize',
        icon: (
          <svg className="h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12h-4m-7 0h-4M7.21 14.77l-2.832 4.904A2 2 0 011.91 21h16.18a2 2 0 001.728-3.224L12.79 8.23" />
          </svg>
        ),
        prices: {
          monthly: '$20',
          yearly: '$17', // Billed annually
        },
        features: [
          'Everything in Free and:',
          'More usage than Free*',
          'Access more Claude models',
          'Unlimited Projects to organize chats',
          'Unlock deep Research tools',
          'Use extended thinking for complex work',
          'Connect Google Workspace: email, calendar, and docs',
          'Integrations with remote MCP',
        ],
        buttonText: 'Get Pro plan',
        buttonClass: 'bg-gray-900 text-white hover:bg-gray-800',
      },
      {
        id: 'max',
        name: 'Max',
        tagline: 'Higher limits, priority access',
        icon: (
          <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L21 12h-4m-7 0h-4M7.21 14.77l-2.832 4.904A2 2 0 011.91 21h16.18a2 2 0 001.728-3.224L12.79 8.23" />
          </svg>
        ),
        prices: {
          monthly: 'From $100',
          yearly: 'From $90', // Billed annually
        },
        features: [
          'Everything in Pro, plus:',
          'Choose 5x or 20x more usage than Pro*',
          'Higher output limits for all tasks',
          'Early access to advanced Claude features',
          'Priority access at high traffic times',
          'Includes Claude Code',
        ],
        buttonText: 'Get Max plan',
        buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
        highlightClass: 'border-2 border-blue-500 shadow-lg',
      },
    ];
    setPlans(fetchedPlans);
  }, []);

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = (planName) => {
    // Update user's plan in local storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      userInfo.plan = planName;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      // Dispatch a custom event to notify other components (like UserProfileMenu)
      // that user info has changed. This is a workaround if direct context update isn't feasible.
      window.dispatchEvent(new CustomEvent('userInfoUpdated'));
    }
    // Optionally, navigate away or show a success message
    navigate('/dashboard'); // Redirect to dashboard after successful payment
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
          Plans that grow with you
        </h1>

        {/* Plan Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium rounded-l-md ${
                planType === 'individual'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-500`}
              onClick={() => setPlanType('individual')}
            >
              Individual
            </button>
            <button
              type="button"
              className={`-ml-px py-2 px-4 text-sm font-medium rounded-r-md ${
                planType === 'team'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-500`}
              onClick={() => setPlanType('team')}
            >
              Team & Enterprise
            </button>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium rounded-l-md ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-500`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`-ml-px py-2 px-4 text-sm font-medium rounded-r-md ${
                billingCycle === 'yearly'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-500`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md p-8 flex flex-col ${plan.highlightClass || ''}`}
            >
              <div className="flex-shrink-0 mb-4">{plan.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{plan.tagline}</p>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.prices[billingCycle]}
                </span>
                {plan.prices[billingCycle] !== '$0' && (
                  <span className="ml-1 text-gray-500 text-base">
                    {billingCycle === 'monthly' ? '/ month billed monthly' : '/ month billed annually'}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3 px-6 rounded-md text-base font-medium transition-colors duration-200 ${plan.buttonClass}`}
                disabled={plan.id === 'free'} // Disable button for free plan
              >
                {plan.buttonText}
              </button>
              <div className="mt-8 flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPaymentForm && selectedPlan && (
        <PaymentForm
          plan={selectedPlan}
          onClose={handleClosePaymentForm}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default SubscriptionPlanPage;