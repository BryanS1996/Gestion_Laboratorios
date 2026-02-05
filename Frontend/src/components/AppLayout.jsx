import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      toast.dismiss();
      toast.success("Bienvenido 👋", {
        duration: 2000,
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex bg-transparent">
      
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        
        {/* TOP BAR MOBILE */}
        {/* Slightly translucent top bar so the gradient remains visible */}
        <div className="lg:hidden flex items-center gap-2 p-4 border-b border-white/60 bg-white/70 backdrop-blur">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <span className="font-semibold">Sistema de Laboratorios</span>
        </div>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
