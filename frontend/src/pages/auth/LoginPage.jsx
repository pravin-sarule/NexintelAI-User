import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Shield } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { useFileManager } from '../../context/FileManagerContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const navigate = useNavigate(); // Add this line back
  const { setAuthToken } = useFileManager();

  const validateEmail = (email) => {
    if (!email) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email address is invalid.';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required.';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation feedback
    if (name === 'email') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: validateEmail(value),
      }));
    } else if (name === 'password') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: validatePassword(value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:3000/api/auth/login',
        { email: formData.email, password: formData.password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.status === 200) {
        toast.success('Login successful!');
        const { token, user } = res.data;
        setAuthToken(token); // Use FileManagerContext's setAuthToken
        localStorage.setItem('user', JSON.stringify(user)); // Keep this for user data
        window.dispatchEvent(new Event('userUpdated'));
        setLoginSuccess(true); // Set success flag
        navigate('/dashboard');
      } else {
        toast.error(res.data.message || 'Login failed.');
      }
    } catch (error) {
      if (loginSuccess) {
        // If login was already successful, do not show error toast
        return;
      }

      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 403) {
          toast.error('Your account has been blocked due to violations.');
        } else if (error.response.status === 400) {
          toast.error('Invalid credentials. Please try again.');
        } else {
          toast.error(error.response.data.message || 'An unexpected error occurred.');
        }
      } else if (error.request) {
        // Request was made but no response was received
        toast.error('Network error. Please check your internet connection.');
        console.error('Network error:', error.message);
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error('An unexpected error occurred. Please try again.');
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-gray-800">
              Log in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or <Link to="/register" className="font-medium text-gray-700 hover:text-gray-800">create a new account</Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div className="mt-4">
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </span>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="#" className="font-medium text-gray-700 hover:text-gray-800">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;

