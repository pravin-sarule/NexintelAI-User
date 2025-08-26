import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('AuthContext: Initializing token from localStorage:', storedToken);
    return storedToken;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('AuthContext: useEffect - storedToken:', storedToken);
    if (storedToken && storedToken !== token) { // Only update if different to avoid infinite loops
      setToken(storedToken);
      // In a real app, you would decode the token or verify it with your backend
      // to get actual user data.
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('AuthContext: Failed to parse user from localStorage', e);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    } else if (!storedToken && token) {
      // If token was in state but not in localStorage, clear state
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, [token]); // Depend on token to react to external changes

  const login = async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password') {
          const newToken = 'dummy-jwt-token';
          const userData = { id: '123', name: 'Test User', email: 'test@example.com', contact: '9876543210' };
          setToken(newToken);
          setUser(userData);
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('AuthContext: Login successful, new token set:', newToken);
          resolve({ success: true, user: userData, token: newToken });
        } else {
          console.log('AuthContext: Login failed for email:', email);
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
    console.log('AuthContext: User logged out, token cleared.');
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