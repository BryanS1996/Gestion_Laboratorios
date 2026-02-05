import { Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Configuracion = () => {
  const [config, setConfig] = useState({
    nombreSistema: "Sistema de Laboratorios",
    emailContacto: "admin@laboratorios.edu",
    horaApertura: "08:00",
    horaCierre: "18:00",
    duracionReserva: 60,
    maxReservasUsuario: 3,
    permitirMismoDia: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    const toastId = toast.loading("Saving configuration...");

    try {
      // 🔒 Connect to backend here later
      await new Promise((res) => setTimeout(res, 800)); // Simulation

      console.log("Configuration saved:", config);

      toast.success("Configuration saved successfully", {
        id: toastId,
      });
    } catch (error) {
      toast.error("Error saving configuration", {
        id: toastId,
      });
    }
  };

  // Reusable input style to match your screenshot (Dark bg, White text)
  const inputClassName = "w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";

  // Reusable label style (Dark text to be visible on white card)
  const labelClassName = "text-slate-800 font-semibold text-sm mb-2 block";

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Configuración del Sistema
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Define los parámetros generales del sistema de laboratorios
        </p>
      </div>

      {/* GENERAL SETTINGS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-6 text-lg">
          Configuración General
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Nombre del sistema</label>
            <input
              name="nombreSistema"
              value={config.nombreSistema}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Correo de contacto</label>
            <input
              type="email"
              name="emailContacto"
              value={config.emailContacto}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      {/* SCHEDULE SETTINGS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-6 text-lg">
          Horarios del Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClassName}>Hora de apertura</label>
            <input
              type="time"
              name="horaApertura"
              value={config.horaApertura}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Hora de cierre</label>
            <input
              type="time"
              name="horaCierre"
              value={config.horaCierre}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Duración por reserva</label>
            <select
              name="duracionReserva"
              value={config.duracionReserva}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1 hora 30 min</option>
            </select>
          </div>
        </div>
      </section>

      {/* RESERVATION RULES */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="font-bold text-slate-900 mb-6 text-lg">
          Reglas de Reservas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className={labelClassName}>Máx. reservas por usuario</label>
            <input
              type="number"
              min={1}
              name="maxReservasUsuario"
              value={config.maxReservasUsuario}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="permitirMismoDia"
              name="permitirMismoDia"
              checked={config.permitirMismoDia}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="permitirMismoDia" className="text-sm font-medium text-slate-700 cursor-pointer">
              Permitir reservas el mismo día
            </label>
          </div>
        </div>
      </section>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
        >
          <Save size={20} />
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default Configuracion;