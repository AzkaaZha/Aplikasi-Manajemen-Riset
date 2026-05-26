import '../../styles/dashboard/DashboardHeader.css';

const DashboardHeader = ({ title, userInfo, setIsOpen }) => {
  return (
    <header className="dashboard-header">
      <div className="d-flex align-items-center gap-3">
        {setIsOpen && (
          <button 
            className="mobile-toggle d-lg-none border-0 bg-transparent text-dark"
            onClick={() => setIsOpen(true)}
          >
            <i className="bi bi-list fs-4"></i>
          </button>
        )}
        <h1 className="dashboard-title">{title}</h1>
      </div>
      <div className="dashboard-user">
        <span className="user-name">{userInfo?.name || "User"}</span>
        <span className="user-role">({userInfo?.role || "Role"})</span>
      </div>
    </header>
  );
};

export default DashboardHeader;

