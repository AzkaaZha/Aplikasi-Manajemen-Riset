const ReminderCard = ({ icon, title, detail, priority }) => {
  const priorityClass = {
    high: 'reminder-high',
    medium: 'reminder-medium',
    low: 'reminder-low',
  }[priority] || 'reminder-medium';

  return (
    <div className={`reminder-card ${priorityClass}`}>
      <div className="reminder-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="reminder-content">
        <p className="reminder-title">{title}</p>
        <p className="reminder-detail">{detail}</p>
      </div>
    </div>
  );
};

export default ReminderCard;
