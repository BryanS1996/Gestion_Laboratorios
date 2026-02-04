import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from '../../../hooks/useForm';

export function useLoginPage() {
  const navigate = useNavigate();
  const { login, resetPassword, user, loading: authLoading } = useAuth();
  const { values: formData, handleChange } = useForm({ email: '', password: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/catalogo');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError('Credenciales incorrectas');
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }

    const t = toast.loading('Enviando enlace de recuperación...');
    try {
      await resetPassword(forgotEmail);
      toast.success('Revisa tu correo 📧', { id: t });
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
      }, 1500);
    } catch (err) {
      toast.error('Error al enviar el correo', { id: t });
    }
  };

  return {
    formData,
    handleChange,
    loading,
    error,
    showForgotPassword,
    setShowForgotPassword,
    forgotEmail,
    setForgotEmail,
    handleSubmit,
    handleForgotPassword,
  };
}
