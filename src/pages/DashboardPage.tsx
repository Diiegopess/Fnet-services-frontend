import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../domains/auth/AuthContext';
import { User, Users, FileText, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <ShieldCheck className="w-5 h-5 text-green-500 bg-white rounded-full absolute bottom-0 right-0 border-2 border-white" />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {user?.full_name || 'Usuario'}!
          </h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="mt-2 inline-flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.is_superuser
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {user?.is_superuser ? 'Administrador' : 'Usuario Estándar'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/users"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Módulo de Usuarios</h2>
              <p className="text-sm text-gray-500">
                Consulta y gestiona las cuentas de usuario del sistema.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/audit"
          className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Logs de Auditoría</h2>
              <p className="text-sm text-gray-500">
                Supervisa eventos, accesos y exporta los registros en CSV.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;