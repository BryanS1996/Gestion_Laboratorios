import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes';

function App() {
  return (
    <>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
    <ToastContainer position="top-right" />
    </>
  );
}

export default App;