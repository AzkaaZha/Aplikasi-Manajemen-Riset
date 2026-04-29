import { useNavigate } from "react-router-dom";

function Navbar({ setIsOpen }) {
  const navigate = useNavigate();

  return (
    <div className="navbar-container px-4 border-bottom">

      {/* LEFT */}
      <div className="nav-left">
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* CENTER */}
      <div className="nav-center">
        <h5 className="m-0 fw-bold">SIMR STT NF</h5>
      </div>

      {/* RIGHT */}
      <div
        className="nav-right"
        onClick={() => navigate("/")}
      >
        <i className="bi bi-person-circle fs-4"></i>
      </div>

    </div>
  );
}

export default Navbar;