import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";

const FinalIdentitasStep = ({ data, onChange }) => {
  const readonlyFields = [
    { type: "text", name: "judul_penelitian", label: "Judul Penelitian" },
    { type: "text", name: "bidang_fokus_rirn", label: "Bidang Fokus RIRN / Bidang Unggulan Perguruan Tinggi" },
    { type: "number", name: "lama_penelitian", label: "Lama Penelitian (Tahun)" },
    { type: "text", name: "kata_kunci", label: "Kata Kunci" },
  ];

  const manualFields = [
    { 
      type: "number", 
      name: "dana_penelitian", 
      label: "Dana Penelitian yang Dikeluarkan (Rp)", 
      placeholder: "Masukkan total dana penelitian yang digunakan", 
      required: true 
    },
  ];

  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Identitas Penelitian</h2>
        <p className="step-subtitle">Data identitas penelitian yang diambil dari proposal dan input manual untuk dana penelitian.</p>
      </div>

      <div className="form-card">
        <div className="row">
          <div className="col-12">
            <div className="form-group mb-3">
              <label className="form-label fw-semibold">{readonlyFields[0].label}</label>
              <div className="form-control-readonly compact">
                {stripHtml(data[readonlyFields[0].name]) || "-"}
              </div>
            </div>
          </div>
          {readonlyFields.slice(1).map((field) => (
            <div key={field.name} className="col-md-6">
              <div className="form-group mb-3">
                <label className="form-label fw-semibold">{field.label}</label>
                <input 
                  type="text" 
                  className="form-control form-control-readonly" 
                  readOnly 
                  value={stripHtml(data[field.name]) || "-"} 
                />
              </div>
            </div>
          ))}
          {manualFields.map((field) => (
            <div key={field.name} className="col-md-6">
              <DynamicFieldRenderer
                field={field}
                value={data[field.name]}
                onChange={onChange}
              />
              {data[field.name] && (
                <div className="small text-muted mt-1">
                  Format: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(data[field.name])}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinalIdentitasStep;
