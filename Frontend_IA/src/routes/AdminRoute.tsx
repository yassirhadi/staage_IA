import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Per the cahier de charge: the Admin role is purely administrative
 * (user/account management). The actual RSSI work (inventory, risks,
 * reports, copilot...) belongs to the RSSI role and is never gated
 * here. This guard only protects the admin-only surface, e.g.
 * /admin/users, so an RSSI account can't reach it even via direct URL.
 */
export default function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
