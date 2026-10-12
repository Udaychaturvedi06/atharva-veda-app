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
      } catch (e) {
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
      // Offline fallback: if backend is unreachable, allow seamless demo login
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        const fallbackUser = { username: username.trim(), role: 'user', isOffline: true };
        const dummyToken = 'offline_token_' + Date.now();
        setToken(dummyToken);
        setUser(fallbackUser);
        localStorage.setItem('sutra_token', dummyToken);
        localStorage.setItem('sutra_user', JSON.stringify(fallbackUser));
        return { success: true };
      }
      return { success: false, error: err.message };
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
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        const fallbackUser = { username: username.trim(), role: 'user', isOffline: true };
        const dummyToken = 'offline_token_' + Date.now();
        setToken(dummyToken);
        setUser(fallbackUser);
        localStorage.setItem('sutra_token', dummyToken);
        localStorage.setItem('sutra_user', JSON.stringify(fallbackUser));
        return { success: true };
      }
      return { success: false, error: err.message };
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
    } catch (e) {
      const guestId = Math.floor(1000 + Math.random() * 9000);
      const guestUser = { username: `Seeker_${guestId}`, role: 'user', isGuest: true };
      const dummyToken = 'guest_token_' + Date.now();
      setToken(dummyToken);
      setUser(guestUser);
      localStorage.setItem('sutra_token', dummyToken);
      localStorage.setItem('sutra_user', JSON.stringify(guestUser));
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
