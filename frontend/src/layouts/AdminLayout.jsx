import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";
import "../styles/layouts/adminlayout.css";

function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();

  const adminMenu = [
    { name: "Dashboard", path: "/admin", icon: "bi-speedometer2" },
    { name: "Manajemen Pengguna", path: "/admin/users", icon: "bi-people" },
  ];

  const userInfo = {
    name: user?.name || user?.email || "Admin",
    role: user?.role_id === ROLES.ADMIN ? "Admin" : "Dosen",
  };

  const handleLogout = () => {
    logoutContext();
    navigate("/login");
  };

  return (
    <div className={`admin-layout ${isOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        menuItems={adminMenu}
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div className="admin-main-content">
        <Navbar setIsOpen={setIsOpen} />

        <div className="admin-content-area">
          <main className="admin-page-content">
            {children}
          </main>

          <div className="admin-footer-wrapper">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;