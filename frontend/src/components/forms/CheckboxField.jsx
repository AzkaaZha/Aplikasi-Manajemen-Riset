
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
        <div className="checkbox-grid-section">
          <div className="checkbox-grid">
            {options.map((opt) => {
              const isChecked = selectedValues.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`checkbox-grid-item${isChecked ? " checked" : ""}`}
                  htmlFor={`${name}-${opt.value}`}
                >
                  <input
                    className="checkbox-grid-input"
                    type="checkbox"
                    id={`${name}-${opt.value}`}
                    checked={isChecked}
                    onChange={() => handleChange(opt.value)}
                  />
                  <span className="checkbox-grid-indicator">
                    {isChecked && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="checkbox-grid-label">{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
      
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
};

export default CheckboxField;

