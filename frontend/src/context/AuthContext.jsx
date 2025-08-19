import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // Initialize token from localStorage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would typically check for a token in localStorage or a cookie
    // and validate it with your backend to determine if the user is authenticated.
    // For now, we'll simulate a loaded state.
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you would decode the token or verify it with your backend
      // to get actual user data. For now, we'll use a placeholder.
      setUser({ id: '123', name: 'Authenticated User', email: 'user@example.com', contact: '1234567890' }); // Placeholder user with more details
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password') { // Replace with actual authentication logic
          const newToken = 'dummy-jwt-token'; // Replace with actual JWT from backend
          const userData = { id: '123', name: 'Test User', email: 'test@example.com', contact: '9876543210' }; // Replace with actual user data from backend
          setToken(newToken);
          setUser(userData);
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(userData)); // Store user data
          resolve({ success: true, user: userData, token: newToken });
        } else {
          resolve({ success: false, message: 'Invalid credentials' });
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};