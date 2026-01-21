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
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ============================
     🔐 Sincronizar JWT
     ============================ */
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem('jwtToken', jwtToken);
    } else {
      localStorage.removeItem('jwtToken');
    }
  }, [jwtToken]);

  /* ============================
     🔐 Firebase Auth Listener
     ============================ */
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setJwtToken(null);
      setLoading(false);
      return;
    }

    const idToken = await firebaseUser.getIdToken();

    // aquí llamas a tu backend
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const data = await res.json();
    setUser(data.user);
    setJwtToken(data.token);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  /* ============================
     🔐 Auth helpers
     ============================ */
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  /* ============================
     🔐 Actions
     ============================ */
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  };

  const resetPassword = (email) =>
    sendPasswordResetEmail(auth, email);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setJwtToken(null);
  };

  /* ============================
     🚀 API
     ============================ */
  return {
    user,
    jwtToken,
    loading,
    error,

    // roles
    isAuthenticated,
    isAdmin,
    isStudent,

    // actions
    login,
    loginWithGoogle,
    register,
    resetPassword,
    logout,
  };
};
