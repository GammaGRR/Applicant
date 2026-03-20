import { Navigate } from 'react-router-dom';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    return <Navigate to="/Dashboard" replace />;
  }

  return <>{children}</>;
};
