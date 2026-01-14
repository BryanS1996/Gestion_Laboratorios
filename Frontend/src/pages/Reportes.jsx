import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  AlertTriangle,
  Send,
  History,
  CheckCircle,
  Clock,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';

// Ajustamos la URL para que apunte a tu backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reportes = () => {
  const { jwtToken } = useAuth();

  // Estado para la lista de reportes y formulario
  const [misReportes, setMisReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Archivo de imagen (opcional)
  const [imagen, setImagen] = useState(null);

  // Estado del formulario
  const [form, setForm] = useState({
    titulo: '',
    laboratorioNombre: '',
    laboratorioId: '',
    descripcion: ''
  });

  // Bucket privado: cache de URLs firmadas por reporte
  const [signedUrls, setSignedUrls] = useState({});
  const [loadingImg, setLoadingImg] = useState({});

  // Mapa para autocompletar ID cuando eligen un nombre (opcional)
  const laboratoriosMap = {
    'Laboratorio de Redes': 'LAB-REDES',
    'Laboratorio de Software': 'LAB-SOFT',
    'Laboratorio de Hardware': 'LAB-HARD',
    'Laboratorio General': 'LAB-GEN'
  };

  // 1) CARGAR REPORTES DEL BACKEND (MongoDB)
  const cargarReportes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reportes/mis-reportes`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();

      if (res.ok) {
        const lista = Array.isArray(data) ? data : (data.data || []);
        setMisReportes(lista);
      } else {
        console.error("Error backend:", data);
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken) cargarReportes();
  }, [jwtToken]);

  // 2) Obtener URL firmada (bucket privado) y guardarla en cache
  const obtenerUrlFirmada = async (reporteId) => {
    if (signedUrls[reporteId]) return signedUrls[reporteId];

    try {
      setLoadingImg(prev => ({ ...prev, [reporteId]: true }));

      const res = await fetch(`${API_URL}/reportes/${reporteId}/imagen-url`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo obtener la imagen");
        return null;
      }

      setSignedUrls(prev => ({ ...prev, [reporteId]: data.url }));
      return data.url;
    } catch (err) {
      console.error(err);
      alert("Error de conexión obteniendo imagen");
      return null;
    } finally {
      setLoadingImg(prev => ({ ...prev, [reporteId]: false }));
    }
  };

  // Manejar cambio en el select de laboratorio
  const handleLabChange = (e) => {
    const nombre = e.target.value;
    setForm({
      ...form,
      laboratorioNombre: nombre,
      laboratorioId: laboratoriosMap[nombre] || 'LAB-OTRO'
    });
  };

  // 3) ENVIAR REPORTE (multipart/form-data para enviar imagen)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.descripcion || !form.titulo || !form.laboratorioNombre) {
      return alert("⚠️ Por favor completa todos los campos.");
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("laboratorioNombre", form.laboratorioNombre);
      formData.append("laboratorioId", form.laboratorioId);
      formData.append("descripcion", form.descripcion);

      if (imagen) {
        // Debe coincidir con upload.single("imagen") en el backend
        formData.append("imagen", imagen);
      }

      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`
        },
        body: formData
      });

      if (res.ok) {
        alert("✅ Reporte enviado exitosamente. ¡Gracias!");
        setForm({ titulo: '', laboratorioNombre: '', laboratorioId: '', descripcion: '' });
        setImagen(null);
        await cargarReportes();
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error || 'No se pudo enviar'}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4) ELIMINAR REPORTE (y backend borra imagen en Backblaze si existe)
  const handleDelete = async (reporteId) => {
    const ok = confirm("🗑️ ¿Eliminar este reporte definitivamente? (También se eliminará la imagen si existe)");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/reportes/${reporteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });

      if (res.ok) {
        // limpiar cache de url firmada si estaba visible
        setSignedUrls(prev => {
          const copy = { ...prev };
          delete copy[reporteId];
          return copy;
        });
        setMisReportes(prev => prev.filter(r => r._id !== reporteId));
      } else {
        const errorData = await res.json();
        alert(`❌ Error al eliminar: ${errorData.error || 'No se pudo eliminar'}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión con el servidor.");
    }
  };

  // 5) Toggle mostrar/ocultar imagen (inline)
  const toggleImagenInline = async (rep) => {
    const id = rep._id;

    // Si ya está visible, ocultar
    if (signedUrls[id]) {
      setSignedUrls(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    // Si no está visible, pedir URL firmada y mostrar
    await obtenerUrlFirmada(id);
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
                onChange={e => setForm({ ...form, titulo: e.target.value })}
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
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            {/* === INPUT IMAGEN === */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adjuntar Imagen (opcional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-all">
                  <ImageIcon size={18} className="text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {imagen ? "Cambiar imagen" : "Agregar imagen"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                {imagen && (
                  <button
                    type="button"
                    onClick={() => setImagen(null)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                    title="Quitar imagen"
                  >
                    Quitar
                  </button>
                )}
              </div>

              {imagen && (
                <p className="mt-2 text-xs text-slate-500">
                  Archivo seleccionado: <span className="font-semibold">{imagen.name}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform active:scale-95
                ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
            >
              <Send size={20} />
              {submitting ? "Enviando..." : "Enviar Reporte"}
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
              {misReportes.map((rep) => {
                const hasImage = !!rep.imageKey; // 🔐 bucket privado => usamos imageKey
                const isImgVisible = !!signedUrls[rep._id];

                return (
                  <div
                    key={rep._id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                        {rep.titulo || 'Sin título'}
                      </h3>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${rep.estado === 'pendiente'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            : rep.estado === 'resuelto'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          {rep.estado ? rep.estado.toUpperCase() : 'ENVIADO'}
                        </span>

                        {/* BOTÓN ELIMINAR */}
                        <button
                          onClick={() => handleDelete(rep._id)}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all"
                          title="Eliminar reporte"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-3 leading-relaxed text-sm">
                      {rep.descripcion}
                    </p>

                    {/* 🔐 Bucket privado: Botón ver/ocultar imagen + mostrar inline */}
                    {hasImage && (
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() => toggleImagenInline(rep)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {loadingImg[rep._id] ? (
                            <>Cargando imagen...</>
                          ) : isImgVisible ? (
                            <>
                              <EyeOff size={16} />
                              Ocultar imagen
                            </>
                          ) : (
                            <>
                              <Eye size={16} />
                              Ver imagen
                            </>
                          )}
                        </button>

                        {isImgVisible && (
                          <div className="mt-3">
                            <img
                              src={signedUrls[rep._id]}
                              alt="Imagen del reporte"
                              className="max-h-52 w-full rounded-xl border border-slate-200 object-cover"
                              loading="lazy"
                              onError={() => {
                                // Si expira la URL (5 min), la quitamos para que el usuario vuelva a pedirla
                                setSignedUrls(prev => {
                                  const copy = { ...prev };
                                  delete copy[rep._id];
                                  return copy;
                                });
                              }}
                            />
                            <p className="mt-2 text-xs text-slate-400">
                              *La imagen es privada y se muestra con un enlace temporal.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3 mt-2">
                      <span className="font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {rep.laboratorioNombre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {rep.fechaCreacion ? new Date(rep.fechaCreacion).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reportes;
