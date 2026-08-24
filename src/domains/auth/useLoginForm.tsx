import { useState } from 'react';
import { useAuth } from './AuthContext';
import { loginWithCredentials } from './authService';

export const useLoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const resp = await loginWithCredentials({ email, password });
      await login(resp);
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Credenciales incorrectas. Intenta nuevamente.';
      setErrorMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    errorMessage,
    handleSubmit,
  };
};