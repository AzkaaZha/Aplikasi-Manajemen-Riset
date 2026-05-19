const SummaryCard = ({ icon, label, value, accent = 'primary' }) => {
  return (
    <div className={`summary-card summary-card-${accent}`}>
      <div>
        <p className="summary-label">{label}</p>
        <h3 className="summary-value">{value}</h3>
      </div>
      <div className="summary-card-icon">
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  );
};

export default SummaryCard;
