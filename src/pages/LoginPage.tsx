import React from 'react';
import LoginForm from '../domains/auth/components/LoginForm';
import GoogleLoginButton from '../domains/auth/components/GoogleLoginButton';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Fnet Services
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestión de servicios en dispositivos de Fortinet
          </p>
        </div>

        {/* Presentación del formulario con su propio hook */}
        <LoginForm />

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200" />
          <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-medium">
            o
          </span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;