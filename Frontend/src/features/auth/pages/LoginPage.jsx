import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { Button, Card } from '../../../shared/components';
import { useLoginPage } from '../hooks/useLoginPage';

// IMPORT THE IMAGE
import logoUce from '../../../assets/logo_uce2.png';

export default function LoginPage() {
  const vm = useLoginPage();

  return (
    // MAIN CONTAINER with App Background
    // Using the same gradient as the main app: from-slate-800 via-blue-900 to-slate-800
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800">

      {/* --- MAIN CARD --- */}
      <Card className="w-full max-w-md p-8 rounded-3xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-blue-900/20 animate-fade-in relative z-10">

        {/* Header with Logo and Title */}
        <div className="flex flex-col items-center mb-8 animate-slide-in">
          <div className="mb-4">
            <img src={logoUce} alt="UCE Logo" className="w-24 h-24 object-contain mx-auto drop-shadow-sm" />
          </div>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Sistema de Laboratorios
          </h1>
          <p className="text-slate-300 text-sm font-medium">
            Facultad de Ingeniería - UCE
          </p>
        </div>

        {/* Form */}
        <form onSubmit={vm.handleSubmit} className="space-y-5">

          {/* User/Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Usuario</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="tu.correo@uce.edu.ec"
                value={vm.formData.email}
                onChange={vm.handleChange}
                // Input style: Dark background to match card theme
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-2xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 backdrop-blur-sm"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 ml-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={vm.formData.password}
                onChange={vm.handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 hover:bg-slate-100"
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {vm.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl backdrop-blur-sm animate-fade-in">
              {vm.error}
            </div>
          )}

          {/* Main Login Button */}
          <Button
            type="submit"
            disabled={vm.loading}
            className="w-full justify-center py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold tracking-wide rounded-2xl transition-all duration-300 shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-800/60 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {vm.loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Ingresando...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={() => vm.setShowForgotPassword(true)}
            className="w-full text-sm text-center text-blue-400 hover:text-blue-300 font-medium transition-colors mt-2"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-800/40 text-slate-400 uppercase tracking-wider font-medium">¿Nuevo aquí?</span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group font-semibold"
          >
            <span>Crear una cuenta</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </Card>

      {/* Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={vm.showForgotPassword}
        onClose={() => vm.setShowForgotPassword(false)}
        email={vm.forgotEmail}
        onEmail={vm.setForgotEmail}
        onSubmit={vm.handleForgotPassword}
      />
    </div>
  );
}