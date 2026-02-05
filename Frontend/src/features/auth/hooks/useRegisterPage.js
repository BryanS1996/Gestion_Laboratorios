import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from '../../../hooks/useForm';
import toast from 'react-hot-toast';

export function useRegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const isSubmitting = useRef(false);

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

    // Prevent double submission
    if (isSubmitting.current) {
      return;
    }

    setError('');
    setLoading(true);
    isSubmitting.current = true;

    if (values.password !== values.confirmPassword) {
      const msg = 'Las contraseñas no coinciden';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    if (values.password.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    try {
      await register(values.email, values.password, values.name);

      toast.success('Cuenta creada correctamente 🎉');
      resetForm();

      navigate('/login');

    } catch (err) {
      let message = 'Error al crear la cuenta';

      // Firebase error mapping
      if (err.code === 'auth/email-already-in-use') {
        message = 'El correo ya está registrado';
      } else if (err.code === 'auth/weak-password') {
        message = 'La contraseña es demasiado débil';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Correo inválido';
      }

      setError(message);
      toast.error(message);

    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      toast.success('Cuenta creada con Google 🎉');
      navigate('/');
    } catch (err) {
      const msg = 'No se pudo registrar con Google';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    handleChange,
    error,
    loading,
    handleSubmit,
    handleGoogleRegister,
  };
}