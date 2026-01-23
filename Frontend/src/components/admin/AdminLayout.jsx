import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from "../../hooks/useAuth";

const AdminLayout = () => {
  const welcomeShown = useRef(false);

  const [open, setOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user && !welcomeShown.current) {
      toast.dismiss();
      toast.success("Bienvenido 👋", {
        duration: 2000,
      });

      welcomeShown.current = true;
    }
  }, [user]);


  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP BAR (solo mobile) */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b bg-white shrink-0">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <span className="font-semibold">Admin Panel</span>
        </div>

        {/* PÁGINAS ADMIN (SCROLL AQUÍ) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;