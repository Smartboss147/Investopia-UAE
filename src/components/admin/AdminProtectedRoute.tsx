import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { isAdminEmail } from '../../utils/admin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading, profile } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      if (isAdminEmail(user.email)) {
        setIsAdmin(true);
        return;
      }
      if (profile?.role === 'super_admin' || profile?.role === 'admin') {
        setIsAdmin(true);
        return;
      }
      try {
        const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, profile]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
