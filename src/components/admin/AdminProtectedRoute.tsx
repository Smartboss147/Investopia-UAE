import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

// Admin access comes ONLY from the real Firebase custom claim (admin: true),
// verified via a freshly-refreshed ID token. No email is ever hardcoded here,
// and a Firestore document field is never trusted for this decision (any
// client could otherwise write a 'role' field to their own profile document).
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
        // Force a refresh so a just-granted claim is picked up without
        // requiring a manual sign-out/sign-in.
        const idTokenResult = await user.getIdTokenResult(true);
        setIsAdmin(!!idTokenResult.claims.admin);
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

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
