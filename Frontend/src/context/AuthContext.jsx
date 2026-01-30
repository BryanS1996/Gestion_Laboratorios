import { createContext, useEffect, useState, useRef } from "react";
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

  // Read token from localStorage on boot
  const [jwtToken, setJwtToken] = useState(localStorage.getItem("jwtToken"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent multiple /users/login calls
  const hasFetchedProfile = useRef(false);
  const lastUid = useRef(null);

  /* ============================
     Sync JWT to localStorage
  ============================ */
  useEffect(() => {
    if (jwtToken) localStorage.setItem("jwtToken", jwtToken);
    else localStorage.removeItem("jwtToken");
  }, [jwtToken]);

  /* ============================
     Firebase Auth Listener
  ============================ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          hasFetchedProfile.current = false;
          lastUid.current = null;
          setUser(null);
          setJwtToken(null);
          setLoading(false);
          return;
        }

        // If user changed, allow fetching again
        if (lastUid.current !== firebaseUser.uid) {
          lastUid.current = firebaseUser.uid;
          hasFetchedProfile.current = false;
        }

        // Avoid duplicate calls, but NEVER leave loading stuck
        if (hasFetchedProfile.current) {
          setLoading(false);
          return;
        }

        hasFetchedProfile.current = true;

        const idToken = await firebaseUser.getIdToken();

        const res = await fetch(`${API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Login failed");

        setUser({
          ...data.user,
          role: String(data.user?.role || "student").trim().toLowerCase(),
        });

        setJwtToken(data.token);
        setError(null);
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
     Helpers
  ============================ */

  // IMPORTANT: allow auth if token exists (prevents Stripe redirect -> login loop)
  const isAuthenticated = (!!jwtToken || !!user) && !loading;

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const isProfessor = user?.role === "professor";

  /* ============================
     Actions
  ============================ */
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider());

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred.user;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const logout = async () => {
    hasFetchedProfile.current = false;
    lastUid.current = null;
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
