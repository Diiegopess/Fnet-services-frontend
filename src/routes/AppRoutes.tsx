import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../domains/auth/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { AuditPage } from '../pages/AuditPage';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Ruta autenticada base (cualquier usuario activo) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas administrativas exclusivas (is_superuser: true) */}
      <Route
        path="/users"
        element={
          <ProtectedRoute requireSuperuser>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedRoute requireSuperuser>
            <AuditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;