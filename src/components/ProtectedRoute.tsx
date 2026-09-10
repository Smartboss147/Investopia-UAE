import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { isAdminEmail } from '../utils/admin';
import { auth } from '../lib/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const activeUser = user || auth.currentUser;

  if (loading && !activeUser) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!activeUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // back to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If this user is an admin, always redirect them directly to the Admin Dashboard
  if (isAdminEmail(activeUser.email)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
