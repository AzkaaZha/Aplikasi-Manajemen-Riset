export default function Input({ label, type = "text", name, value, onChange, placeholder, required, error, className = "" }) {
  return (
    <div className={`input-group-custom ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {}
      <div className="input-error-wrapper">
        {error && (
          <div className="input-error-text">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
