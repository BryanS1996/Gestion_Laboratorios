import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_-gMRIamdeyttTuWGa7YcUQ8C3vgpoUE",
  authDomain: "gestion-laboratorios.firebaseapp.com",
  projectId: "gestion-laboratorios",
  storageBucket: "gestion-laboratorios.firebasestorage.app",
  messagingSenderId: "230449857766",
  appId: "1:230449857766:web:7d6e44bf4653d8260d2727",
  measurementId: "G-GCLGXN3NFG"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export default app;