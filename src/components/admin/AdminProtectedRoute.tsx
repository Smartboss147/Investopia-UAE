import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const idTokenResult = await user.getIdTokenResult();
        const isHardcodedAdmin = 
          user.email === 'smartboss08161156487@gmail.com' || 
          user.email === 'smartcompany112234@gmail.com' || 
          user.email === 'prince.hamad.managementhmdzs@gmail.com';
        setIsAdmin(!!idTokenResult.claims.admin || isHardcodedAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
