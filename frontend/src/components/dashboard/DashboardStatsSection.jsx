import DashboardStatsCard from './DashboardStatsCard';
import '../../styles/dashboard/DashboardStats.css';

const DashboardStatsSection = ({ stats }) => {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <DashboardStatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          colorClass={stat.colorClass}
        />
      ))}
    </div>
  );
};

export default DashboardStatsSection;

