import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logoutContext } = useAuth(); 

  const adminMenu = [
    { name: "Dashboard", path: "/admin", icon: "bi-speedometer2" },
    { name: "Manajemen Pengguna", path: "/admin/users", icon: "bi-people" }
  ];

  const userInfo = {
    name: user?.name || user?.email || "Admin",
    role: user?.role_id === ROLES.ADMIN ? "Admin" : "Dosen"
  };

  const handleLogout = () => {
    logoutContext(); 
    navigate("/login");
  };

  return (
    <div className={`app d-flex min-vh-100 ${isOpen ? "sidebar-open" : ""}`}>
      {}
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        menuItems={adminMenu}
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
      <div className="main-content flex-grow-1 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>
        <Navbar setIsOpen={setIsOpen} />

        {}
        <div className="content-area d-flex flex-column flex-grow-1" style={{ overflowY: 'auto' }}>
          <div className="p-3 p-md-4 flex-grow-1">
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
