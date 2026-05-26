import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DosenDashboardPage from "../pages/dashboard/DosenDashboardPage";
import AdminDashboardPage from "../pages/dashboard/AdminDashboardPage";
import UserListPage from "../pages/users/UserListPage";
import UserCreatePage from "../pages/users/UserCreatePage";
import UserEditPage from "../pages/users/UserEditPage";
import ResearchPage from "../pages/dosen/ResearchPage";
import RekrutmenPage from "../pages/dosen/RekrutmenPage";
import KolaborasiPage from "../pages/dosen/KolaborasiPage";
import ResearchDetailPage from "../pages/dosen/ResearchDetailPage";
import ProtectedRoute from "./ProtectedRoute";
import DocumentEditorPage from "../pages/documents/DocumentEditorPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DosenDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute>
              <UserCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/edit/:id"
          element={
            <ProtectedRoute>
              <UserEditPage />
            </ProtectedRoute>
          }
        />

        {}
        <Route
          path="/penelitian"
          element={
            <ProtectedRoute>
              <ResearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/penelitian/:id"
          element={
            <ProtectedRoute>
              <ResearchDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rekrutmen"
          element={
            <ProtectedRoute>
              <RekrutmenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kolaborasi"
          element={
            <ProtectedRoute>
              <KolaborasiPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researches/:researchId/documents/create/:jenisDokumenId"
          element={
            <ProtectedRoute>
              <DocumentEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/researches/:researchId/documents/:documentId/edit"
          element={
            <ProtectedRoute>
              <DocumentEditorPage />
            </ProtectedRoute>
          }
        />



      </Routes>
    </BrowserRouter>
  );
}
