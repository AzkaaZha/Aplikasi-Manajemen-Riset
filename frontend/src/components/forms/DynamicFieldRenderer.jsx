import TextField from "./TextField";
import NumberField from "./NumberField";
import TextareaField from "./TextareaField";
import CheckboxField from "./CheckboxField";

const DynamicFieldRenderer = ({ field, value, onChange, error }) => {
  const commonProps = {
    label: field.label,
    name: field.name,
    value: value || "",
    onChange,
    placeholder: field.placeholder,
    required: field.required,
    error: error,
    disabled: field.disabled,
  };

  switch (field.type) {
    case "text":
    case "email":
    case "password":
    case "url":
    case "date":
      return <TextField {...commonProps} type={field.type} />;
    
    case "number":
      return (
        <NumberField
          {...commonProps}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );
    
    case "textarea":
      return <TextareaField {...commonProps} rows={field.rows} />;
    
    case "checkbox":
    case "toggle":
      return (
        <CheckboxField
          {...commonProps}
          selectedValues={value || []}
          options={field.options}
          isToggle={field.type === "toggle"}
        />
      );
    
    case "select":
      return (
        <div className="form-group mb-3">
          {field.label && <label className="form-label fw-semibold">{field.label} {field.required && <span className="text-danger">*</span>}</label>}
          <select
            name={field.name}
            className={`form-select ${error ? "is-invalid" : ""}`}
            value={value || ""}
            onChange={onChange}
            required={field.required}
            disabled={field.disabled}
          >
            <option value="">-- Pilih {field.label} --</option>
            {field.options && field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
      );

    default:
      return null;
  }
};

export default DynamicFieldRenderer;

