import '../../styles/dashboard/DashboardContent.css';

const DashboardContentCard = ({ title, children }) => {
  return (
    <div className="content-card">
      {title && <h2 className="content-card-title">{title}</h2>}
      <div className="content-card-body">
        {children}
      </div>
    </div>
  );
};

export default DashboardContentCard;

