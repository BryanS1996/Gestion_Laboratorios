// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

// App-wide utility classes (btn-primary, input, etc.)
// Keeping this import here ensures styles are applied across every screen.
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
