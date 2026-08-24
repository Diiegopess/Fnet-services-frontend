import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../authService';
import { useAuth } from '../AuthContext';

export const GoogleLoginButton: React.FC = () => {
  const { login } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const token = credentialResponse.credential;
        if (!token) return;
        try {
          const resp = await loginWithGoogle(token);
          login(resp);
        } catch (error) {
          console.error('Error al autenticar en el backend:', error);
        }
      }}
      onError={() => console.error('Google Login failed')}
    />
  );
};

export default GoogleLoginButton;