import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/authContext.jsx";
import { TOAST_CONFIG } from "./config/theme.config.js";

// ✅ Create the TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 🔐 AUTH GLOBAL */}
    <AuthProvider>

      {/* 🔄 DATA FETCHING */}
      <QueryClientProvider client={queryClient}>

        {/* 🔔 TOASTER GLOBAL - Configuración centralizada */}
        <Toaster
          position={TOAST_CONFIG.position}
          toastOptions={{
            duration: TOAST_CONFIG.duration,
            style: TOAST_CONFIG.style,
          }}
        />

        <App />
      </QueryClientProvider>

    </AuthProvider>
  </StrictMode>
);
