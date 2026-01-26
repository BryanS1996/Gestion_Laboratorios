import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(
    localStorage.getItem("jwtToken")
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧠 evita múltiples llamadas al backend
  const hasFetchedProfile = useRef(false);

  /* ============================
     🔐 Sincronizar JWT
     ============================ */
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem("jwtToken", jwtToken);
    } else {
      localStorage.removeItem("jwtToken");
    }
  }, [jwtToken]);

  /* ============================
     🔐 Firebase Auth Listener (UNO SOLO)
     ============================ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        hasFetchedProfile.current = false;
        setUser(null);
        setJwtToken(null);
        setLoading(false);
        return;
      }

      // ⚠️ evita múltiples /users/login
      if (hasFetchedProfile.current) return;

      try {
        hasFetchedProfile.current = true;

        const idToken = await firebaseUser.getIdToken();

        const res = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const data = await res.json();

        setUser({
          ...data.user,
          role: String(data.user?.role || 'student').trim().toLowerCase(),
        });
        
        setJwtToken(data.token);
      } catch (err) {
        console.error("Auth error:", err);
        setError(err);
        setUser(null);
        setJwtToken(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ============================
     🔐 Helpers
     ============================ */
  const isAuthenticated = !!user && !loading;
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const isProfessor = user?.role === "professor";


  /* ============================
     🔐 Actions
     ============================ */
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider());

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  };

  const resetPassword = (email) =>
    sendPasswordResetEmail(auth, email);

  const logout = async () => {
    hasFetchedProfile.current = false;
    await signOut(auth);
    setUser(null);
    setJwtToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        loading,
        error,

        // roles
        isAuthenticated,
        isAdmin,
        isStudent,
        isProfessor,

        // actions
        login,
        loginWithGoogle,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
