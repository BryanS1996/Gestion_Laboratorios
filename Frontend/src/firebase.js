import { initializeApp } from 'firebase/app';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

console.log('Firebase auth initialized:', auth);

export default auth;