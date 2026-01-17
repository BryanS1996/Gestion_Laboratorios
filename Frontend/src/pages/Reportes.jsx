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
  const [signedUrls, setSignedUrls] = useState({});
  const [loadingImg, setLoadingImg] = useState({});

  const laboratoriosMap = {
    'Laboratorio de Redes': 'LAB-REDES',
    'Laboratorio de Software': 'LAB-SOFT',
    'Laboratorio de Hardware': 'LAB-HARD',
    'Laboratorio General': 'LAB-GEN'
  };

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
      return alert("⚠️ Por favor completa todos los campos.");
    }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("laboratorioNombre", form.laboratorioNombre);
      formData.append("laboratorioId", form.laboratorioId);
      formData.append("descripcion", form.descripcion);
      if (imagen) formData.append("imagen", imagen);
      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwtToken}` },
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

  const handleDelete = async (reporteId) => {
    const ok = confirm("🗑️ ¿Eliminar este reporte definitivamente?");
    if (!ok) return;
    try {
      const res = await fetch(`${API_URL}/reportes/${reporteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` }
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
        alert(`❌ Error al eliminar: ${errorData.error || 'No se pudo eliminar'}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión con el servidor.");
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
    <div className="min-h-screen bg-slate-50 p-6 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ... FORMULARIO OMITIDO PARA BREVEDAD ... */}

        <div className="space-y-4 h-[calc(100vh-150px)] overflow-y-auto pr-2 custom-scrollbar">
          {misReportes.map((rep) => {
            const hasImage = !!rep.imageKey;
            const isImgVisible = !!signedUrls[rep._id];

            return (
              <div key={rep._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                {/* ... Título y botones ... */}

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
                        <><EyeOff size={16} /> Ocultar imagen</>
                      ) : (
                        <><Eye size={16} /> Ver imagen</>
                      )}
                    </button>

                    {/* 🦴 Skeleton Loader implementado aquí */}
                    {loadingImg[rep._id] && (
                      <div className="mt-3 h-52 w-full rounded-xl bg-slate-200 animate-pulse"></div>
                    )}

                    {isImgVisible && !loadingImg[rep._id] && (
                      <div className="mt-3">
                        <img
                          src={signedUrls[rep._id]}
                          alt="Imagen del reporte"
                          className="max-h-52 w-full rounded-xl border border-slate-200 object-cover"
                          loading="lazy"
                          onError={() => {
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
