import { useState, useEffect } from 'react';

const Catalog = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Catálogo de Laboratorios
        </h1>
        <p className="text-slate-600 mb-8">
          Bienvenido, {user?.name || 'Usuario'} ({user?.role || 'user'}). Aquí puedes ver los laboratorios disponibles.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjetas de laboratorios simuladas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800">Laboratorio de Computación</h3>
            <p className="text-slate-600 mt-2">Equipos modernos para desarrollo de software.</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Reservar
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800">Laboratorio de Redes</h3>
            <p className="text-slate-600 mt-2">Herramientas para configuración de redes.</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Reservar
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-800">Laboratorio de Software</h3>
            <p className="text-slate-600 mt-2">Entorno para testing y desarrollo.</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Reservar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;