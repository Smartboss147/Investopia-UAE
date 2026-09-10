import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';
import { isAdminEmail } from '../utils/admin';

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
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !auth.currentUser);

  const signOut = async () => {
    await auth.signOut();
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const activeUser = user || auth.currentUser;

  useEffect(() => {
    if (!activeUser) return;

    const profileRef = doc(db, 'users', activeUser.uid);
    const unsubscribeProfile = onSnapshot(profileRef, async (snapshot) => {
      const isSystemAdmin = isAdminEmail(activeUser.email);
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        if (isSystemAdmin && data.role !== 'super_admin') {
          try {
            const { setDoc } = await import('firebase/firestore');
            await setDoc(profileRef, { role: 'super_admin' }, { merge: true });
            data.role = 'super_admin';
          } catch (err) {
            console.warn('Could not update admin role:', err);
          }
        }
        setProfile(data);
        setLoading(false);
      } else {
        // Auto-provision profile if document does not exist yet
        try {
          const { setDoc } = await import('firebase/firestore');
          const newProf: UserProfile = {
            uid: activeUser.uid,
            email: activeUser.email || '',
            displayName: activeUser.displayName || activeUser.email?.split('@')[0] || 'User',
            balance: 0,
            status: 'active',
            currency: 'USD',
            ...(isSystemAdmin ? { role: 'super_admin' } : {}),
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
  }, [activeUser?.uid]);

  return (
    <AuthContext.Provider value={{ user: activeUser, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
