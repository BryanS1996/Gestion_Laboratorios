import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const useAuth = () => {
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

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
        role: 'admin',
      });

      setLoading(false);
    });

    return () => unsub();
  }, []);

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
