import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * Protects routes that require authentication.
 * Redirects to /login with the current path saved for post-login redirect.
 */
export default function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
