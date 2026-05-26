
const CheckboxField = ({ label, name, options, selectedValues = [], onChange, required, error, isToggle = false }) => {
  const handleChange = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange({ target: { name, value: newValues } });
  };

  return (
    <div className="form-group mb-3">
      {label && <label className="form-label fw-semibold d-block">{label} {required && <span className="text-danger">*</span>}</label>}
      
      {isToggle ? (
        <div className="d-flex flex-wrap gap-2">
          {options.map((opt) => {
            const isActive = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
                style={{
                  minWidth: "40px",
                  backgroundColor: isActive ? "var(--dark-blue)" : "transparent",
                  borderColor: isActive ? "var(--dark-blue)" : "#ccc",
                  color: isActive ? "#fff" : "#666"
                }}
                onClick={() => handleChange(opt.value)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="checkbox-list">
          {options.map((opt) => (
            <div key={opt.value} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id={`${name}-${opt.value}`}
                checked={selectedValues.includes(opt.value)}
                onChange={() => handleChange(opt.value)}
              />
              <label className="form-check-label" htmlFor={`${name}-${opt.value}`}>
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default CheckboxField;

