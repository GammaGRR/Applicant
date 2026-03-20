import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/token';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = getUserFromToken();

  if (!user || !['dev', 'admin'].includes(user.role)) {
    return <Navigate to="/Dashboard" replace />;
  }

  return <>{children}</>;
};