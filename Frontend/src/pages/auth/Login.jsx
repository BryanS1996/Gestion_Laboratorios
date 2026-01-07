import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, X, Mail } from 'lucide-react';
import { useAuth, useForm } from '../../hooks';

const Login = () => {
  const navigate = useNavigate();
  const { login, resetPassword, user, loading: authLoading } = useAuth();
  const { values: formData, handleChange } = useForm({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Redirigir basado en rol después de login
  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') {
        navigate('/admin/usuarios');
      } else {
        navigate('/catalogo');
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      // La redirección se maneja en useEffect basado en el rol del usuario
    } catch (error) {
      console.error('Login error:', error);
      setError('Credenciales incorrectas o error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }
    
    try {
      await resetPassword(forgotEmail);
      setForgotMessage('Se ha enviado un enlace de recuperación a tu correo.');
    } catch (error) {
      setForgotMessage('Error al enviar el correo de recuperación. Verifica tu email.');
    }
    
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotEmail('');
      setForgotMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* SECCIÓN 1: Logo y Títulos (Igual a la imagen) */}
        <div className="flex flex-col items-center mb-8">
            {/* Logo FI Azul */}
            <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                <span className="text-white text-3xl font-bold tracking-wider">FI</span>
            </div>
            
            <h1 className="text-gray-800 text-lg font-medium">Sistema de Laboratorios</h1>
            <p className="text-gray-500 text-sm mt-1">Facultad de Ingeniería</p>
        </div>

        {/* SECCIÓN 2: Tarjeta Blanca del Formulario */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Usuario/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Usuario</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Ingresa tu usuario"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all text-gray-700 placeholder-gray-400"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all text-gray-700 placeholder-gray-400"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 flex items-center gap-2 animate-fade-in">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>

          </form>
        </div>
        
        {/* Enlace para registrarse */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
        
        {/* Footer pequeño */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">© 2026 Universidad Central del Ecuador</p>
        </div>
      </div>

      {/* Modal de Recuperar Contraseña (Mantenido igual pero con estilos actualizados) */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-scale-up">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recuperar Acceso</h3>
                <p className="text-sm text-gray-500 mt-2 px-4">
                    Ingresa tu correo institucional y te enviaremos las instrucciones.
                </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="usuario@uce.edu.ec"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {forgotMessage && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-200 text-center">
                  {forgotMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-xl transition-all"
              >
                Enviar Enlace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;