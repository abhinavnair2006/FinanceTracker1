import { useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContextValue';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const getStoredUser = () => {
  const userData = localStorage.getItem('user');
  if (!localStorage.getItem('token') || !userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
