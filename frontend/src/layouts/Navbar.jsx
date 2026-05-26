import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

function Navbar({ setIsOpen }) {
  const { user } = useAuth();
  
  const roleName = user?.role_id === ROLES.ADMIN ? "Admin" : "Dosen";
  const displayName = user?.nama || user?.name || "User";

  return (
    <nav className="navbar-container">

      {}
      <div className="nav-left">
        <button
          className="btn-menu"
          onClick={() => setIsOpen(true)}
          title="Buka Menu"
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {}
      <div className="nav-center">
        <h5>SIMR STT NF</h5>
      </div>

      {}
      <div className="nav-right">
        <div className="nav-profile-meta text-end me-2">
          <div className="nav-user-name">
            {displayName}
          </div>
          <div className="nav-user-role">
            {roleName}
          </div>
        </div>
        <div className="nav-user-icon">
          <i className="bi bi-person-circle"></i>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;