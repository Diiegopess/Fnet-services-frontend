import React from 'react';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './domains/auth/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import Navbar from './shared/components/Navbar';
import { GOOGLE_CLIENT_ID } from './core/config';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;
