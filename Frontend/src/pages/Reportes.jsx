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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reportes = () => {
  const { jwtToken } = useAuth();

  const [misReportes, setMisReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagen, setImagen] = useState(null);

  const [form, setForm] = useState({
    titulo: '',
    laboratorioNombre: '',
    laboratorioId: '',
    descripcion: ''
  });

  const laboratoriosMap = {
    'Laboratorio de Redes': 'LAB-REDES',
    'Laboratorio de Software': 'LAB-SOFT',
    'Laboratorio de Hardware': 'LAB-HARD',
    'Laboratorio General': 'LAB-GEN'
  };

  const [signedUrls, setSignedUrls] = useState({});
  const [loadingImg, setLoadingImg] = useState({});

  const cargarReportes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reportes/mis-reportes`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();

      const lista = Array.isArray(data) ? data : (data.data || []);
      setMisReportes(lista);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken) cargarReportes();
  }, [jwtToken]);

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
      alert("Error obteniendo imagen");
      return null;
    } finally {
      setLoadingImg(prev => ({ ...prev, [reporteId]: false }));
    }
  };

  const handleLabChange = (e) => {
    const nombre = e.target.value;
    setForm({
      ...form,
      laboratorioNombre: nombre,
      laboratorioId: laboratoriosMap[nombre] || 'LAB-OTRO'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.descripcion || !form.titulo || !form.laboratorioNombre) {
      return alert("⚠️ Completa todos los campos.");
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("laboratorioNombre", form.laboratorioNombre);
      formData.append("laboratorioId", form.laboratorioId);
      formData.append("descripcion", form.descripcion);

      if (imagen) {
        formData.append("imagen", imagen);
      }

      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwtToken}` },
        body: formData
      });

      if (res.ok) {
        alert("✅ Reporte enviado");
        setForm({ titulo: '', laboratorioNombre: '', laboratorioId: '', descripcion: '' });
        setImagen(null);
        await cargarReportes();
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error || 'No se pudo enviar'}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reporteId) => {
    const ok = confirm("🗑️ ¿Eliminar este reporte?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/reportes/${reporteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      });

      if (res.ok) {
        setSignedUrls(prev => {
          const copy = { ...prev };
          delete copy[reporteId];
          return copy;
        });
        setMisReportes(prev => prev.filter(r => r._id !== reporteId));
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.error || 'No se pudo eliminar'}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error al eliminar");
    }
  };

  const toggleImagenInline = async (rep) => {
    const id = rep._id;

    if (signedUrls[id]) {
      setSignedUrls(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    await obtenerUrlFirmada(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULARIO */}
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
            <input type="text" placeholder="Título" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} className="w-full border p-3 rounded-xl" />

            <select value={form.laboratorioNombre} onChange={handleLabChange} className="w-full border p-3 rounded-xl">
              <option value="">Selecciona laboratorio</option>
              {Object.keys(laboratoriosMap).map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>

            <textarea rows={4} placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full border p-3 rounded-xl" />

            {/* Imagen */}
            <div>
              <label className="block mb-1 text-sm font-medium">Imagen (opcional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />
              {imagen && (
                <p className="mt-2 text-xs text-slate-500">Seleccionada: <strong>{imagen.name}</strong></p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl"
            >
              {submitting ? "Enviando..." : "Enviar Reporte"}
            </button>
          </form>
        </div>

        {/* LISTADO */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Mis Reportes</h2>
          {loading ? (
            <p className="text-center text-slate-400 py-10 animate-pulse">Cargando...</p>
          ) : misReportes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <CheckCircle size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No has reportado ningún fallo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {misReportes.map((rep) => {
                const isImgVisible = !!signedUrls[rep._id];
                return (
                  <div key={rep._id} className="bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">{rep.titulo}</h3>
                      <button onClick={() => handleDelete(rep._id)} title="Eliminar" className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-slate-600 mt-2">{rep.descripcion}</p>

                    {rep.imageKey && (
                      <div className="mt-3">
                        <button onClick={() => toggleImagenInline(rep)} className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium">
                          {loadingImg[rep._id] ? "Cargando..." : isImgVisible ? <><EyeOff size={16}/> Ocultar imagen</> : <><Eye size={16}/> Ver imagen</>}
                        </button>

                        {isImgVisible && (
                          <div className="mt-3">
                            <img
                              src={signedUrls[rep._id]}
                              alt="Reporte"
                              className="rounded-xl max-h-52 border object-cover w-full"
                              onError={() => setSignedUrls(prev => {
                                const copy = { ...prev };
                                delete copy[rep._id];
                                return copy;
                              })}
                            />
                            <p className="mt-2 text-xs text-slate-400">*La imagen es privada y se muestra con un enlace temporal.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-slate-400 border-t pt-2 mt-4">
                      <span className="bg-slate-100 px-2 py-1 rounded font-medium text-slate-600">{rep.laboratorioNombre}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/> {new Date(rep.fechaCreacion).toLocaleDateString()}</span>
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
