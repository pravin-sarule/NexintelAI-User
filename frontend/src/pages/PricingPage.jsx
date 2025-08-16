import React from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <h3 className="text-3xl sm:text-4xl font-semibold text-center text-gray-800 mb-12">Flexible Pricing Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gray-400 text-center">
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Free</h4>
            <p className="text-5xl font-extrabold text-gray-700 mb-6">$0<span className="text-xl text-gray-500">/month</span></p>
            <ul className="text-gray-700 text-left mb-8 space-y-3">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Limited Document Uploads</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Basic AI Summarization</li>
              <li className="flex items-center"><span className="text-red-500 mr-2">✖</span> Document Drafting</li>
              <li className="flex items-center"><span className="text-red-500 mr-2">✖</span> Priority Support</li>
            </ul>
            <Link to="/register" className="block w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200" target="_blank" rel="noopener noreferrer">
              Sign Up - Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-white p-8 rounded-xl shadow-xl border-t-4 border-gray-700 text-center transform scale-105">
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Premium</h4>
            <p className="text-5xl font-extrabold text-gray-700 mb-6">$49<span className="text-xl text-gray-500">/month</span></p>
            <ul className="text-gray-700 text-left mb-8 space-y-3">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Unlimited Document Uploads</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Advanced AI Analysis</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Basic Document Drafting</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Standard Support</li>
            </ul>
            <Link to="/register" className="block w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition-colors duration-200" target="_blank" rel="noopener noreferrer">
              Choose Premium
            </Link>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-gray-400 text-center">
            <h4 className="text-3xl font-bold text-gray-900 mb-4">Enterprise</h4>
            <p className="text-5xl font-extrabold text-gray-700 mb-6">$99<span className="text-xl text-gray-500">/month</span></p>
            <ul className="text-gray-700 text-left mb-8 space-y-3">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> All Premium Features</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Custom AI Models</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Advanced Document Drafting</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Dedicated Account Manager</li>
            </ul>
            <Link to="/register" className="block w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200" target="_blank" rel="noopener noreferrer">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;