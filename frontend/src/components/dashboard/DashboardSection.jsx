import '../../styles/dashboard/DosenDashboardPage.css';

const DashboardSection = ({ title, subtitle, children, className = '' }) => {
  return (
    <section className={`dashboard-section ${className}`.trim()}>
      <div className="section-heading d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
        <div>
          {title && <h2 className="section-title">{title}</h2>}
          {subtitle && <p className="section-subtitle mb-0">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
};

export default DashboardSection;
