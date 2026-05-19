import { Link, useLocation } from "react-router-dom";
import "../styles/layouts/sidebar.css";

function Sidebar({ 
  isOpen, 
  setIsOpen, 
  menuItems = [], 
  userInfo = { name: "User", role: "Role" }, 
  onLogout 
}) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) =>
    `sidebar-link ${isActive(path) ? "active" : ""}`;

  const handleClick = () => {
    if (setIsOpen) setIsOpen(false);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (onLogout) onLogout();
  };

  return (
    <aside
      className={`sidebar-container ${isOpen ? "sidebar-open" : "sidebar-close"}`}
    >
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-circle">NF</div>
          <span className="logo-text">SIMR NF</span>
        </div>

        <i
          className="bi bi-x-lg sidebar-close-btn"
          onClick={handleClick}
        />
      </div>

      {/* PROFILE */}
      <div className="sidebar-profile">
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
        />
        <div className="profile-info">
          <div className="profile-name">{userInfo.name}</div>
          <div className="profile-role">{userInfo.role}</div>
        </div>
      </div>

      {/* MAIN MENU */}
      <div className="sidebar-section-title">MENU</div>
      <ul className="sidebar-nav">
        {menuItems.map((item, index) => (
          <li key={index} className="sidebar-nav-item">
            <Link
              to={item.path}
              className={getLinkClass(item.path)}
              onClick={handleClick}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>


      {/* SIDEBAR FOOTER */}
      <div className="sidebar-footer">
        <a
          href="#"
          className={getLinkClass("/logout")}
          onClick={handleLogoutClick}
        >
          <i className="bi bi-box-arrow-right" />
          <span>Keluar</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
