const ActivityCard = ({ activity }) => {
  return (
    <div className="activity-feed-item">
      <div className="activity-icon-wrapper">
        <span className="activity-icon"><i className={`bi ${activity.icon}`}></i></span>
      </div>
      <div className="activity-detail">
        <p className="activity-text">{activity.text}</p>
        <p className="activity-time">{activity.time}</p>
      </div>
    </div>
  );
};

export default ActivityCard;
