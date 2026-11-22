import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/context';
import type { GymRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: GymRole[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { session, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#090D16] text-slate-500">
        <div className="animate-pulse font-mono text-xs">Authenticating GymOS Session...</div>
      </div>
    );
  }

  if (!isAuthenticated || !session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    // Member attempting to access Owner ERP routes
    if (session.role === 'member') {
      return <Navigate to={`/gym/${session.gymSlug}/member`} replace />;
    }
    // Owner attempting to access disallowed routes
    return <Navigate to={`/gym/${session.gymSlug}/dashboard`} replace />;
  }

  return <>{children}</>;
};
