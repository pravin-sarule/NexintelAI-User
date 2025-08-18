import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Here you would typically check for a token in localStorage or a cookie
    // and validate it with your backend to determine if the user is authenticated.
    // For now, we'll simulate a loaded state.
    const token = localStorage.getItem('authToken');
    if (token) {
      // In a real app, decode token or verify with backend
      setUser({ username: 'testuser' }); // Placeholder user
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password') {
          const userData = { username: 'testuser', email };
          setUser(userData);
          localStorage.setItem('authToken', 'dummy-token');
          resolve({ success: true, user: userData });
        } else {
          resolve({ success: false, message: 'Invalid credentials' });
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};