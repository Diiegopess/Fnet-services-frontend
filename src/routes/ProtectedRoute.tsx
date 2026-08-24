import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../domains/auth/AuthContext';
import Spinner from '../shared/components/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperuser?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSuperuser = false,
}) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  // Si no está autenticado, va al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere privilegios de superusuario y no los tiene, redirige a dashboard
  if (requireSuperuser && !user.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;