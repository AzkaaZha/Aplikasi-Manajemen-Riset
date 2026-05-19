import { useAuth } from "../hooks/useAuth";

function Navbar({ setIsOpen }) {
  const { user } = useAuth();

  return (
    <nav className="navbar-container">

      {/* LEFT - Menu Toggle */}
      <div className="nav-left">
        <button
          className="btn-menu"
          onClick={() => setIsOpen(true)}
          title="Buka Menu"
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* CENTER - Branding */}
      <div className="nav-center">
        <h5>SIMR STT NF</h5>
      </div>

      {/* RIGHT - User Profile */}
<div className="nav-right">
        <span className="nav-user-name">
          {user?.name || user?.email || "User"}
        </span>
        <div className="nav-user-icon">
          <i className="bi bi-person-circle"></i>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;