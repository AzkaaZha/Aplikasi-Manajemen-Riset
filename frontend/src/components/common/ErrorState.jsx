export default function ErrorState({ message, className = "" }) {
  return (
    <div className="error-state-container">
      {message && (
        <div className={`alert alert-danger error-alert ${className}`}>
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
