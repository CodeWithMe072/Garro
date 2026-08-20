import { API_BASE } from '../config/api';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { disconnectSocket } from '../utils/socket';
import PageLoader from '../components/PageLoader';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const triggerRefresh = async () => {
    try {
            const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      console.error('Failed to trigger background refresh:', err);
    }
    return false;
  };

  useEffect(() => {
    const checkRefreshOnMount = async () => {
      const success = await triggerRefresh();
      if (!success) {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          try {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Failed to parse stored user', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };

    checkRefreshOnMount();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh token every 14 minutes
    const interval = setInterval(async () => {
      const success = await triggerRefresh();
      if (!success) {
        logout();
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {})
        },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Failed to logout on server:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('pending_quote_data');
      sessionStorage.clear();

      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      setUser(null);
      setIsAuthenticated(false);
      disconnectSocket();
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
