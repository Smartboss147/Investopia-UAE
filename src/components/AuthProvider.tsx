import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await auth.signOut();
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(profileRef, async (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
        setLoading(false);
      } else {
        // Auto-provision profile if document does not exist yet
        try {
          const { setDoc } = await import('firebase/firestore');
          const newProf: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            balance: 0,
            status: 'active',
            currency: 'USD',
            createdAt: Date.now()
          };
          await setDoc(profileRef, newProf, { merge: true });
          setProfile(newProf);
        } catch (e) {
          console.warn('Could not auto-provision profile:', e);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      }
    }, (error) => {
      console.warn('Firestore profile listener notice:', error);
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
