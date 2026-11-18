import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMeQuery } from '../features/api/apiSlice';
import { Loading } from './PageState';

/** Sends guests to /login and brings them back to the page they wanted afterwards. */
export function RequireAuth() {
  const { data: user, isLoading } = useMeQuery();
  const location = useLocation();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { data: user, isLoading } = useMeQuery();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
