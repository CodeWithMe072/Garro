import { API_BASE } from '../config/api';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { disconnectSocket } from '../utils/socket';

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
            await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {
      console.error('Failed to logout on server:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      disconnectSocket();
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
