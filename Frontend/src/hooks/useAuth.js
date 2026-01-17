import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import auth from '../firebase.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔗 API URL configurada:', API_URL);

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
  const [error, setError] = useState(null);

  // 🔐 Sincronizar JWT con localStorage
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem('jwtToken', jwtToken);
    } else {
      localStorage.removeItem('jwtToken');
    }
  }, [jwtToken]);

  // 🔐 Monitorear cambios de autenticación en Firebase
  useEffect(() => {
    console.log('📡 Configurando onAuthStateChanged...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 onAuthStateChanged disparado. Usuario:', firebaseUser?.email || 'ninguno');
      
      if (firebaseUser) {
        try {
          // Obtener ID Token de Firebase
          const idToken = await firebaseUser.getIdToken();
          console.log('✅ Firebase ID Token obtenido');

          // Enviar al backend para obtener JWT propio
          console.log('📤 Enviando al backend:', `${API_URL}/users/login`);
          
          // Agregar timeout de 10 segundos
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ JWT recibido del backend:', data.user);
            setJwtToken(data.token);
            setUser(data.user);
            setError(null);
          } else {
            const errorText = await response.text();
            console.error('❌ Error en login:', response.status, errorText);
            setError(`Error: ${response.status} - ${errorText}`);
            setUser(null);
            setJwtToken(null);
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.error('❌ Timeout: El servidor no respondió');
            setError('Timeout: El servidor no respondió (verifica que está corriendo)');
          } else {
            console.error('❌ Error obteniendo JWT:', error.message);
            setError(`Error de conexión: ${error.message}`);
          }
          setUser(null);
          setJwtToken(null);
        }
      } else {
        console.log('🚪 Usuario deslogueado');
        setUser(null);
        setJwtToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔐 Login con email y password
  const login = async (email, password) => {
    console.log('🔐 Intentando login con:', email);
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase login exitoso:', result.user.email);
      // Firebase Auth dispara onAuthStateChanged automáticamente
      return result.user;
    } catch (error) {
      console.error('❌ Error Firebase login:', error.message);
      setError(error.message);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  // 📝 Registro de nuevo usuario
  const register = async (email, password, displayName) => {
    console.log('📝 Intentando registrar:', email);
    setLoading(true);
    setError(null);
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Usuario creado en Firebase:', firebaseUser.uid);

      // (Opcional) guardar el nombre en el perfil de Firebase
      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // 2. Obtener Firebase ID Token
      const idToken = await firebaseUser.getIdToken();

      // Timeout (10s) para evitar que el fetch se quede colgado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/auth/firebase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const registerData = await response.json();
      console.log('✅ Usuario registrado en backend. Rol:', registerData.user.role);

      // 4. Hacer login automáticamente
      const loginResponse = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        console.log('✅ JWT obtenido después del registro');
        setJwtToken(data.token);
        setUser(data.user);
      }

      return firebaseUser;
    } catch (error) {
      console.error('❌ Error en registro:', error.message);
      setError(error.message);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  // 🔐 Login / Registro con Google (Popup)
  // Nota: onAuthStateChanged se encarga de pedir el JWT al backend.
  const loginWithGoogle = async () => {
    console.log('🔐 Intentando login con Google...');
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google signInWithPopup exitoso:', result.user.email);
      return result.user;
    } catch (error) {
      console.error('❌ Error login con Google:', error.message);
      setError(error.message);
      setLoading(false);
      throw new Error(error.message);
    }
  };

  // 🔐 Reset de password
  const resetPassword = async (email) => {
    console.log('🔐 Reset password para:', email);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Email de reset enviado');
    } catch (error) {
      console.error('❌ Error reset password:', error.message);
      setError(error.message);
      throw new Error(error.message);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    console.log('🚪 Logout...');
    try {
      await signOut(auth);
      setUser(null);
      setJwtToken(null);
      setError(null);
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error logout:', error.message);
      setError(error.message);
      throw new Error(error.message);
    }
  };

  return {
    user,
    loading,
    jwtToken,
    error,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    logout,
    isAuthenticated: !!user
  };
};