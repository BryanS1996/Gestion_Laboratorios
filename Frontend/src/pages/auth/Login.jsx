import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, X, Mail } from "lucide-react";
import { useAuth, useForm } from "../../hooks";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, resetPassword, user, loading: authLoading } = useAuth();
  const { values: formData, handleChange } = useForm({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ ESTADO FALTANTE
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  /* 🔁 REDIRECCIÓN SEGÚN ROL */
  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/catalogo");
      }
    }
  }, [user, authLoading, navigate]);

  /* 🔐 LOGIN */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);

    } catch (err) {
      setError("Credenciales incorrectas");
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  /* 🔁 RECUPERAR CONTRASEÑA */
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }

    const t = toast.loading("Enviando enlace de recuperación...");

    try {
      await resetPassword(forgotEmail);
      toast.success("Revisa tu correo 📧", { id: t });

      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail("");
      }, 1500);
    } catch (err) {
      toast.error("Error al enviar el correo", { id: t });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#d3b11d]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-bold">FI</span>
          </div>
          <h1 className="text-gray-800 font-medium">
            Sistema de Laboratorios
          </h1>
          <p className="text-gray-500 text-sm">
            Facultad de Ingeniería
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-500">Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border rounded-2xl"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-500">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border rounded-2xl"
                required
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* REGISTER */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* MODAL RECUPERAR CONTRASEÑA */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                autoComplete="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-3 border rounded-xl"
                placeholder="usuario@uce.edu.ec"
                required
              />
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl">
                Enviar enlace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
