import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { AlertTriangle, Send, History, CheckCircle, Clock, XCircle } from 'lucide-react';

// Ajustamos la URL para que apunte a tu backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reportes = () => {
  const { jwtToken } = useAuth();
  
  // Estado para la lista de reportes y formulario
  const [misReportes, setMisReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    titulo: '',
    laboratorioNombre: '',
    laboratorioId: '', 
    descripcion: ''
  });

  // Mapa para autocompletar ID cuando eligen un nombre (opcional)
  const laboratoriosMap = {
    'Laboratorio de Redes': 'LAB-REDES',
    'Laboratorio de Software': 'LAB-SOFT',
    'Laboratorio de Hardware': 'LAB-HARD',
    'Laboratorio General': 'LAB-GEN'
  };

  // 1. CARGAR REPORTES DEL BACKEND (MongoDB)
  const cargarReportes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reportes/mis-reportes`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        // Si el backend devuelve { data: [...] }, usamos eso. Si devuelve array directo, usamos data.
        const lista = Array.isArray(data) ? data : (data.data || []);
        setMisReportes(lista);
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al inicio
  useEffect(() => {
    if (jwtToken) cargarReportes();
  }, [jwtToken]);

  // Manejar cambio en el select
  const handleLabChange = (e) => {
    const nombre = e.target.value;
    setForm({
      ...form,
      laboratorioNombre: nombre,
      laboratorioId: laboratoriosMap[nombre] || 'LAB-OTRO'
    });
  };

  // 2. ENVIAR REPORTE AL BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.titulo || !form.laboratorioNombre) {
      return alert("⚠️ Por favor completa todos los campos.");
    }

    try {
      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("✅ Reporte enviado exitosamente. ¡Gracias!");
        setForm({ titulo: '', laboratorioNombre: '', laboratorioId: '', descripcion: '' }); // Limpiar
        cargarReportes(); // Recargar la lista para ver el nuevo
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error || 'No se pudo enviar'}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* === COLUMNA IZQUIERDA: FORMULARIO === */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-6">
          <div className="flex items-center gap-3 mb-6 text-red-600 border-b border-slate-100 pb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Reportar Incidente</h2>
              <p className="text-sm text-slate-500">Ayúdanos a mantener los laboratorios funcionando</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título Breve</label>
              <input 
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Ej: Proyector no da imagen"
                value={form.titulo}
                onChange={e => setForm({...form, titulo: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Laboratorio</label>
              <select 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={form.laboratorioNombre}
                onChange={handleLabChange}
              >
                <option value="">Selecciona una ubicación...</option>
                <option value="Laboratorio de Redes">Laboratorio de Redes</option>
                <option value="Laboratorio de Software">Laboratorio de Software</option>
                <option value="Laboratorio de Hardware">Laboratorio de Hardware</option>
                <option value="Laboratorio General">Laboratorio General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción del Problema</label>
              <textarea 
                rows="5"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                placeholder="Describe qué equipo falla, número de máquina, mensajes de error..."
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform active:scale-95"
            >
              <Send size={20} />
              Enviar Reporte
            </button>
          </form>
        </div>

        {/* === COLUMNA DERECHA: HISTORIAL === */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2 text-slate-800">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <History size={24} />
            </div>
            <h2 className="text-2xl font-bold">Mis Reportes</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10 text-slate-400">
                <p className="animate-pulse">Conectando con MongoDB...</p>
            </div>
          ) : misReportes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                <CheckCircle size={32} />
              </div>
              <p className="text-slate-500 font-medium">No has reportado ningún fallo.</p>
              <p className="text-slate-400 text-sm">¡Todo parece funcionar bien!</p>
            </div>
          ) : (
            <div className="space-y-4 h-[calc(100vh-150px)] overflow-y-auto pr-2 custom-scrollbar">
              {misReportes.map((rep) => (
                <div key={rep._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                        {rep.titulo || 'Sin título'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      rep.estado === 'pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      rep.estado === 'resuelto' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {rep.estado ? rep.estado.toUpperCase() : 'ENVIADO'}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                    {rep.descripcion}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3 mt-2">
                    <span className="font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {rep.laboratorioNombre}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(rep.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;