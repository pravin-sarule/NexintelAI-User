import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfileMenu = () => {
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState('Free plan'); // Default plan

  useEffect(() => {
    const fetchUserPlan = () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.plan) {
        setUserPlan(userInfo.plan);
      } else {
        setUserPlan('Free plan'); // Fallback if no plan is set
      }
    };

    fetchUserPlan(); // Fetch plan on component mount

    // Listen for custom event to update plan dynamically
    window.addEventListener('userInfoUpdated', fetchUserPlan);

    return () => {
      window.removeEventListener('userInfoUpdated', fetchUserPlan);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from local storage
    localStorage.removeItem('userInfo'); // Clear user info as well
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-500">
            <span className="font-medium leading-none text-white">PS</span>
          </span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">pravin.sarule@nexintelai.com</div>
          <div className="text-sm text-gray-500">Personal</div>
          <div className="text-xs text-gray-400">{userPlan}</div>
        </div>
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Settings
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Language
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Get help
            </a>
          </li>
          <li>
            <button onClick={() => navigate('/subscription-plans')} className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Upgrade plan
            </button>
          </li>
          <li>
            <a href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Learn more
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          </li>
          <li>
            <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              Log out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default UserProfileMenu;