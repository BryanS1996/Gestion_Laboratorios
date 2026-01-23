import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Crear el cliente de TanStack Query
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
    <QueryClientProvider client={queryClient}>

      {/* 🔔 TOASTER GLOBAL */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#1e293b",
            boxShadow: "0 10px 25px rgba(0,0,0,.1)",
          },
        }}
      />

      <App />
    </QueryClientProvider>
  </StrictMode>
);
