import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import app from '../firebase'; // 👈 default import, NO { auth }

export const useAuth = () => {
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

  // 🔧 BYPASS SOLO EN DESARROLLO
  if (isDevBypass) {
    return {
      user: {
        uid: 'dev-admin',
        email: 'admin@dev.local',
        role: 'admin',
      },
      jwtToken: 'DEV_TOKEN',
      loading: false,
      isAuthenticated: true,
      logout: () => {},
    };
  }

  const auth = getAuth(app); // 👈 crear auth desde app

  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setJwtToken(null);
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      setJwtToken(token);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'admin', // o lo que tengas en tu backend
      });

      setLoading(false);
    });

    return () => unsub();
  }, [auth]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setJwtToken(null);
  };

  return {
    user,
    jwtToken,
    loading,
    isAuthenticated: !!user,
    logout,
  };
};