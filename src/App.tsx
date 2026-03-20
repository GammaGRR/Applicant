import { Login } from './lib/pages/login';
import { DashboardPage } from './lib/pages/applications';
import { ApplicantForm } from './lib/components/ApplicantFormModal';
import { PublicRoute } from './lib/components/PublicRoute';
import { PrivateRoute } from './lib/components/PrivateRoute';
import { AdminPage } from './lib/pages/AdminPage';
import { AdminRoute } from './lib/components/AdminRoute';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route>
            <Route path="/" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/Dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/ApplicantForm" element={<PrivateRoute><ApplicantForm /></PrivateRoute>} />
            <Route path="/Admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};