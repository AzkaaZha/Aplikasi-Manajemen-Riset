import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const mainMenu = [
    { name: "Beranda", path: "/dashboard", icon: "bi-house" },
    { name: "Proposal Penelitian", path: "/proposal", icon: "bi-file-earmark-text" },
    { name: "Laporan Kemajuan", path: "/kemajuan", icon: "bi-graph-up" },
    { name: "Laporan Akhir", path: "/akhir", icon: "bi-journal-check" },
  ];

  const otherMenu = [
    { name: "Settings", path: "/settings", icon: "bi-gear" },
    { name: "Help", path: "/help", icon: "bi-question-circle" },
    { name: "Logout", path: "/login", icon: "bi-box-arrow-right" },
  ];

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path) =>
    `sidebar-link ${isActive(path) ? "active" : ""}`;

  const handleClick = () => setIsOpen(false);

  return (
    <aside
      className={`sidebar-container position-fixed top-0 start-0 p-3 ${
        isOpen ? "sidebar-open" : "sidebar-close"
      }`}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
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
      <div className="sidebar-profile mb-4">
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="rounded-circle"
        />
        <div>
          <div className="fw-semibold">Nama User</div>
          <div className="small">Dosen</div>
        </div>
      </div>

      {/* MAIN MENU */}
      <div className="sidebar-section-title">MENU</div>
      <ul className="nav flex-column mb-4">
        {mainMenu.map((item, index) => (
          <li key={index} className="mb-2">
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

      {/* OTHER MENU */}
      <div className="sidebar-section-title">OTHER</div>
      <ul className="nav flex-column">
        {otherMenu.map((item, index) => (
          <li key={index} className="mb-2">
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
    </aside>
  );
}

export default Sidebar;