import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

function DashboardLayout({ children, hideFooter = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth();

  const mainMenu = [
    { name: "Beranda", path: "/dashboard", icon: "bi-house" },
    { name: "Daftar Penelitian", path: "/penelitian", icon: "bi-file-earmark-text" },
    { name: "Rekrutmen", path: "/rekrutmen", icon: "bi-person-plus" },
    { name: "Kolaborasi", path: "/kolaborasi", icon: "bi-diagram-3" },
  ];

  const handleLogout = () => {
    logoutContext();
    navigate("/login");
  };

  const userInfo = {
    name: user?.name || user?.email || "User",
    role: user?.role_id === ROLES.ADMIN ? "Admin" : "Dosen"
  };

  return (
    <div className={`app d-flex min-vh-100 ${isOpen ? "sidebar-open" : ""}`}>
      {}
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        menuItems={mainMenu}
        userInfo={userInfo}
        onLogout={handleLogout}
      />

      {}
      {isOpen && (
        <div
          className="overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {}
      <div className="main-content flex-grow-1 d-flex flex-column">
        <Navbar setIsOpen={setIsOpen} />

        {}
        <div className="content-area">
          <div className="p-3 p-md-4 flex-grow-1">
            {children}
          </div>
          {!hideFooter && <Footer />}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;