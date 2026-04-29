import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dosen/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DocumentPage from "./pages/dosen/DocumentPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* DOCUMENT (MASIH DUMMY) */}
        <Route
          path="/proposal"
          element={
            <ProtectedRoute>
              <DocumentPage title="Proposal Penelitian" type="PROPOSAL" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kemajuan"
          element={
            <ProtectedRoute>
              <DocumentPage title="Laporan Kemajuan" type="KEMAJUAN" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/akhir"
          element={
            <ProtectedRoute>
              <DocumentPage title="Laporan Akhir" type="AKHIR" />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;