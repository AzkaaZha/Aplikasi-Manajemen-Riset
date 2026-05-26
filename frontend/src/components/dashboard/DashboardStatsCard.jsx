import '../../styles/dashboard/DashboardStats.css';

const DashboardStatsCard = ({ title, value, icon, colorClass = "primary" }) => {
  return (
    <div className={`stats-card ${colorClass}`}>
      <div className="stats-info">
        <h3 className="stats-title">{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
      <div className="stats-icon">
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};

export default DashboardStatsCard;

