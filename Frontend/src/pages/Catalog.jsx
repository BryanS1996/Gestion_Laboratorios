import { useState, useEffect } from 'react';
import ReservationModal from '../components/ReservationModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState('');

  const handleReserveClick = (labName) => {
    if (user?.role !== 'student') {
      alert('Solo los estudiantes pueden hacer reservas.');
      return;
    }
    setSelectedLab(labName);
    setModalOpen(true);
  };

  const handleReserve = (reservationData) => {
    // Aquí puedes enviar la reserva al backend
    console.log('Reserva realizada:', reservationData);
    alert(`Reserva confirmada para ${reservationData.labName} el ${reservationData.date} a las ${reservationData.time} por ${reservationData.duration} hora(s).`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Catálogo de Laboratorios
        </h1>
        <p className="text-slate-600 mb-8">
          {user ? (
            <>
              Bienvenido, {user.name || 'Usuario'} ({user.role || 'user'}). 
              {user.role === 'student' && (
                <button
                  onClick={() => navigate('/mis-reservas')}
                  className="ml-4 text-blue-600 underline hover:text-blue-800"
                >
                  Ver Mis Reservas
                </button>
              )}
              <button 
                onClick={async () => { await logout(); navigate('/login'); }} 
                className="ml-4 text-red-600 underline hover:text-red-800"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>Bienvenido. <button onClick={() => navigate('/login')} className="text-blue-600 underline">Inicia sesión</button> para reservar laboratorios.</>
          )}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjetas de laboratorios simuladas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800">Laboratorio de Computación</h3>
            <p className="text-slate-600 mt-2">Equipos modernos para desarrollo de software.</p>
            <button 
              onClick={() => handleReserveClick('Laboratorio de Computación')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reservar
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800">Laboratorio de Redes</h3>
            <p className="text-slate-600 mt-2">Herramientas para configuración de redes.</p>
            <button 
              onClick={() => handleReserveClick('Laboratorio de Redes')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reservar
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800">Laboratorio de Software</h3>
            <p className="text-slate-600 mt-2">Entorno para testing y desarrollo.</p>
            <button 
              onClick={() => handleReserveClick('Laboratorio de Software')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
      <ReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        labName={selectedLab}
        onReserve={handleReserve}
      />
    </div>
  );
};

export default Catalog;