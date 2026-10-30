import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sutra_token');
    const savedUser = localStorage.getItem('sutra_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sutra_token');
        localStorage.removeItem('sutra_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sutra_token', data.token);
      localStorage.setItem('sutra_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      // Truthful error reporting: Do not fake successful logins when server is unreachable or rejects
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.name === 'TypeError';
      return {
        success: false,
        error: isNetworkError
          ? 'Authentication service is unreachable. Please verify your connection or explore as Guest.'
          : (err.message || 'Login failed. Please check your credentials.')
      };
    }
  };

  const register = async (username, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sutra_token', data.token);
      localStorage.setItem('sutra_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      const isNetworkError = err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.name === 'TypeError';
      return {
        success: false,
        error: isNetworkError
          ? 'Registration service is unreachable. Please verify your connection or explore as Guest.'
          : (err.message || 'Registration failed.')
      };
    }
  };

  const loginAsGuest = async () => {
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sutra_token', data.token);
      localStorage.setItem('sutra_user', JSON.stringify(data.user));
      return { success: true };
    } catch {
      // Explicit offline demo guest mode: Visibly labeled, never masquerades as a verified account or JWT
      const guestId = Math.floor(1000 + Math.random() * 9000);
      const offlineGuestUser = {
        username: `Guest_${guestId}`,
        role: 'guest',
        isGuest: true,
        isOfflineDemo: true
      };
      const demoToken = 'demo_guest_offline_' + Date.now();
      setToken(demoToken);
      setUser(offlineGuestUser);
      localStorage.setItem('sutra_token', demoToken);
      localStorage.setItem('sutra_user', JSON.stringify(offlineGuestUser));
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sutra_token');
    localStorage.removeItem('sutra_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
