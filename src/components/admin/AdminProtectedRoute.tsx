import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { isAdminEmail } from '../../utils/admin';
import { auth } from '../../lib/firebase';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading, profile } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(() => {
    const initialUser = user || auth.currentUser;
    if (initialUser && isAdminEmail(initialUser.email)) return true;
    return null;
  });
  const location = useLocation();

  const activeUser = user || auth.currentUser;

  React.useEffect(() => {
    const checkAdmin = async () => {
      const current = user || auth.currentUser;
      if (!current) {
        if (!loading) {
          setIsAdmin(false);
        }
        return;
      }
      if (isAdminEmail(current.email)) {
        setIsAdmin(true);
        return;
      }
      if (profile?.role === 'super_admin' || profile?.role === 'admin') {
        setIsAdmin(true);
        return;
      }
      try {
        const idTokenResult = await current.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user, loading, profile]);

  if ((loading && !activeUser) || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!activeUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // If authenticated user is not an admin, redirect to trading dashboard, not login
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
