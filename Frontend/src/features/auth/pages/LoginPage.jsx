import { Link } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { Button, Card } from '../../../shared/components';
import { useLoginPage } from '../hooks/useLoginPage';

export default function LoginPage() {
  const vm = useLoginPage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#d3b11d]">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-xl">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">FI</span>
          </div>
          <h1 className="text-gray-800 font-medium">Sistema de Laboratorios</h1>
          <p className="text-gray-500 text-sm">Facultad de Ingeniería</p>
        </div>

        <form onSubmit={vm.handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-500">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={vm.formData.email}
                onChange={vm.handleChange}
                className="w-full pl-12 pr-4 py-3 border rounded-2xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={vm.formData.password}
                onChange={vm.handleChange}
                className="w-full pl-12 pr-4 py-3 border rounded-2xl"
                required
              />
            </div>
          </div>

          {vm.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{vm.error}</div>
          )}

          <Button
            type="submit"
            disabled={vm.loading}
            variant="blue"
            className="w-full justify-center py-3"
          >
            {vm.loading ? "Ingresando..." : "Iniciar Sesión"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => vm.setShowForgotPassword(true)}
            className="w-full text-sm justify-center text-blue-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-600 font-medium">Regístrate aquí</Link>
          </p>
        </div>
      </Card>

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
