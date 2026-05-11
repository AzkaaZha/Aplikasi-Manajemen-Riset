import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResearchList from './pages/dosen/ResearchList';
import ResearchDetail from './pages/dosen/ResearchDetail';
import DocumentEditor from './pages/dosen/DocumentEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route index element={<AdminDashboard />} />
          {/* Add more admin routes here */}
        </Route>

        {/* Dosen Routes */}
        <Route path="/dosen" element={<DashboardLayout allowedRoles={['dosen']} />}>
          <Route index element={<Navigate to="/dosen/penelitian" />} />
          <Route path="penelitian" element={<ResearchList />} />
          <Route path="penelitian/:id" element={<ResearchDetail />} />
          <Route path="dokumen/:id" element={<DocumentEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
