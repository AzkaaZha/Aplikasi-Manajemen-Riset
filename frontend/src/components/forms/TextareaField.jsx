
const TextareaField = ({ label, name, value, onChange, onFocus, placeholder, required, error, disabled, rows = 3 }) => {
  return (
    <div className="form-group mb-3">
      {label && <label className="form-label fw-semibold">{label} {required && <span className="text-danger">*</span>}</label>}
      <textarea
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default TextareaField;

