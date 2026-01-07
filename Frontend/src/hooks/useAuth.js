import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import auth from '../firebase.js';

// Función auxiliar para determinar rol basado en email
const getUserRole = (email) => {
  if (!email) return 'user';
  const emailLower = email.toLowerCase();
  
  if (emailLower.includes('admin')) return 'admin';
  if (emailLower.includes('profe') || emailLower.includes('profesor')) return 'professor';
  if (emailLower.includes('est') || emailLower.includes('student')) return 'student';
  
  return 'user'; // Rol por defecto
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: getUserRole(firebaseUser.email) // Determinar rol basado en email
        });
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
    // Firebase maneja el estado automáticamente via onAuthStateChanged
  };

  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Opcional: actualizar displayName
      await user.updateProfile({ displayName: name });
      const role = getUserRole(user.email);
      return { user, role };
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getToken = () => token;

  return {
    user,
    loading,
    login,
    register,
    resetPassword,
    logout,
    isAuthenticated: !!user,
    token: getToken,
  };
};