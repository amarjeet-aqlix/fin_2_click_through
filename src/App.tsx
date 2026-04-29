import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { CustomerDetail } from './views/CustomerDetail';
import { Analysis } from './views/Analysis';
import { Settings } from './views/Settings';
import { CustomerPortal } from './views/CustomerPortal';
import { CustomerDataForm } from './views/CustomerDataForm';
import { ConsultationDoc } from './views/ConsultationDoc';
import { FirstLogin } from './views/FirstLogin';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route path="/dashboard" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <Dashboard />
      </ProtectedRoute>
    } />

    <Route path="/customers" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <Dashboard />
      </ProtectedRoute>
    } />

    <Route path="/customers/:id" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <CustomerDetail />
      </ProtectedRoute>
    } />

    <Route path="/analysis" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <Analysis />
      </ProtectedRoute>
    } />

    <Route path="/analysis/:id" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <Analysis />
      </ProtectedRoute>
    } />

    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />

    <Route path="/portal" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerPortal />
      </ProtectedRoute>
    } />

    <Route path="/consultation/:id" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <CustomerDataForm />
      </ProtectedRoute>
    } />

    <Route path="/documentation/:id" element={
      <ProtectedRoute allowedRoles={['admin', 'consultant']}>
        <ConsultationDoc />
      </ProtectedRoute>
    } />

    <Route path="/first-login" element={
      <ProtectedRoute>
        <FirstLogin />
      </ProtectedRoute>
    } />

    <Route path="/" element={<DefaultRedirect />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
);

export default App;
