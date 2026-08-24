import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../domains/auth/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-lg text-blue-600">
              AppLogs
            </span>
            <div className="flex space-x-2">
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>

              {/* Enlaces protegidos por RBAC exclusivos para Administradores */}
              {user.is_superuser && (
                <>
                  <NavLink to="/users" className={navLinkClasses}>
                    Usuarios
                  </NavLink>
                  <NavLink to="/audit" className={navLinkClasses}>
                    Auditoría
                  </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-800">
                {user.full_name}
              </span>
              <span className="text-[11px] text-gray-500 hidden sm:inline-block">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200/60"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;