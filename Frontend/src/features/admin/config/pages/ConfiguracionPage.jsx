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
    const toastId = toast.loading("Guardando configuración...");

    try {
        // 🔒 aquí luego conectas al backend
        await new Promise((res) => setTimeout(res, 800)); // simulación

        console.log("Configuración guardada:", config);

        toast.success("Configuración guardada correctamente", {
        id: toastId,
        });
    } catch (error) {
        toast.error("Error al guardar la configuración", {
        id: toastId,
        });
    }
    };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Configuración del Sistema
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Define los parámetros generales del sistema de laboratorios
        </p>
      </div>

      {/* GENERAL */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">
          Configuración General
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre del sistema</label>
            <input
              name="nombreSistema"
              value={config.nombreSistema}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Correo de contacto</label>
            <input
              type="email"
              name="emailContacto"
              value={config.emailContacto}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">
          Horarios del Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Hora de apertura</label>
            <input
              type="time"
              name="horaApertura"
              value={config.horaApertura}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Hora de cierre</label>
            <input
              type="time"
              name="horaCierre"
              value={config.horaCierre}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="label">Duración por reserva</label>
            <select
              name="duracionReserva"
              value={config.duracionReserva}
              onChange={handleChange}
              className="input"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1 hora 30 min</option>
            </select>
          </div>
        </div>
      </section>

      {/* REGLAS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">
          Reglas de Reservas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="label">Máx. reservas por usuario</label>
            <input
              type="number"
              min={1}
              name="maxReservasUsuario"
              value={config.maxReservasUsuario}
              onChange={handleChange}
              className="input"
            />
          </div>

          <label className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              name="permitirMismoDia"
              checked={config.permitirMismoDia}
              onChange={handleChange}
              className="checkbox"
            />
            <span className="text-sm text-slate-700">
              Permitir reservas el mismo día
            </span>
          </label>
        </div>
      </section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default Configuracion;
