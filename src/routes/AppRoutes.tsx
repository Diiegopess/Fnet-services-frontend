import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../domains/auth/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { ActivityPage } from '../pages/ActivityPage';
import { ClientsPage } from '../pages/ClientsPage';
import { DevicesPage } from '../pages/DevicesPage';
import { HardeningPage } from '../pages/HardeningPage';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta Pública / Autenticación */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Rutas Protegidas Estándar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <DevicesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hardening"
        element={
          <ProtectedRoute>
            <HardeningPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas Protegidas Administrador / Superusuario */}
      <Route
        path="/users"
        element={
          <ProtectedRoute requireSuperuser>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <ProtectedRoute requireSuperuser>
            <ActivityPage />
          </ProtectedRoute>
        }
      />

      {/* Redirección de Retrocompatibilidad de /audit a /activities */}
      <Route
        path="/audit"
        element={<Navigate to="/activities" replace />}
      />

      {/* Ruta Comodín (Catch-all) */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;