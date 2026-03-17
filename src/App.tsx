import { Login } from './lib/pages/login';
import { DashboardPage } from './lib/pages/applications';
import { ApplicantForm } from './lib/components/ApplicantFormModal';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route>
            <Route path="/" element={<Login />} />
            <Route path="/Dashboard" element={<DashboardPage />} />
            <Route path="/ApplicantForm" element={<ApplicantForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};
