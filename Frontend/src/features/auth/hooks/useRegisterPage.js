import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from '../../../hooks/useForm';

export function useRegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, handleChange, resetForm } = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (values.password !== values.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    try {
      await register(values.email, values.password, values.name);
      resetForm();
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Error registrando');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Error con Google');
    } finally {
      setLoading(false);
    }
  };

  return { values, handleChange, error, loading, handleSubmit, handleGoogleRegister };
}
