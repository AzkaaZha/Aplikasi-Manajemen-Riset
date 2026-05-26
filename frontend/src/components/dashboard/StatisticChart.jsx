const StatisticChart = ({ type, title, meta, data }) => {
  if (type === 'status') {
    return (
      <div className="statistic-chart-card">
        <div className="statistic-chart-header">
          <div>
            <h3>{title}</h3>
            <p>{meta}</p>
          </div>
        </div>
        <div className="status-donut-wrapper">
          <div className="status-donut" />
          <div className="status-donut-label">
            <span>Proposal</span>
            <strong>82%</strong>
          </div>
        </div>
        <div className="status-legend">
          {data.map((item) => (
            <div key={item.label} className="status-legend-item">
              <span className={`legend-dot legend-${item.id}`}></span>
              <div>
                <p className="legend-label">{item.label}</p>
                <p className="legend-value">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="statistic-chart-card">
      <div className="statistic-chart-header">
        <div>
          <h3>{title}</h3>
          <p>{meta}</p>
        </div>
      </div>
      <div className="bar-chart-list">
        {data.map((item) => (
          <div key={item.label} className="bar-chart-item">
            <div className="bar-chart-title">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="bar-chart-track">
              <div className={`bar-chart-fill bar-fill-${item.id}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticChart;
