import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toastSuccess, toastError, toastInfo } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('aicte_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const res = await authApi.getMe();
        if (res.data?.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('aicte_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        localStorage.removeItem('aicte_user');
        localStorage.removeItem('aicte_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('aicte_token', res.data.token);
        }
        localStorage.setItem('aicte_user', JSON.stringify(res.data.user));
        toastSuccess(`Welcome back, ${res.data.user.name}`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toastError(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authApi.register(formData);
      if (res.data.success) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('aicte_token', res.data.token);
        }
        localStorage.setItem('aicte_user', JSON.stringify(res.data.user));
        toastSuccess('Registration successful! Welcome to AICTE Grievance Portal.');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toastError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('aicte_token');
      localStorage.removeItem('aicte_user');
      setUser(null);
      toastInfo('Logged out of session.');
    }
  };

  // Quick 1-click Demo Account Switcher
  const quickDemoLogin = async (role) => {
    let email = 'admin@aicte.gov.in';
    if (role === 'officer') email = 'officer.ab@aicte.gov.in';
    if (role === 'institution') email = 'principal@dtie.edu.in';

    return await login(email, 'Password@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
