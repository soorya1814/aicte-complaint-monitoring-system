import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/common/Spinner';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { ComplaintsList } from './pages/ComplaintsList';
import { ComplaintDetail } from './pages/ComplaintDetail';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { Departments } from './pages/Departments';
import { Institutions } from './pages/Institutions';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';
import { Profile } from './pages/Profile';
import { AccessDenied } from './pages/AccessDenied';
import { NotFound } from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner size="lg" className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Institutional Application Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="complaints" element={<ComplaintsList />} />
        <Route path="complaints/new" element={<SubmitComplaint />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        
        {/* Officer & Admin Protected */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="institutions"
          element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <Institutions />
            </ProtectedRoute>
          }
        />

        {/* Admin Strictly Protected */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        {/* General Authenticated */}
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
export default App;
