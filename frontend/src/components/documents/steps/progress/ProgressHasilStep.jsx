import QuillEditor from "../../../common/QuillEditor";

const ProgressHasilStep = ({ data, onChange, errors }) => {
  const handleQuillChange = (name, value) => {
    onChange({ target: { name, value } });
  };


  const fields = [
    { name: "ringkasan", label: "Ringkasan Penelitian" },
    { name: "hasil_penelitian", label: "Hasil Penelitian" },
    { name: "status_luaran", label: "Status Luaran (Naratif)" },
    { name: "peran_mitra", label: "Peran Mitra" },
    { name: "kendala_pelaksanaan", label: "Kendala Pelaksanaan Penelitian" },
    { name: "rencana_tahapan_selanjutnya", label: "Rencana Tahapan Selanjutnya" },
    { name: "daftar_pustaka", label: "Daftar Pustaka" },
    { name: "lampiran", label: "Lampiran (Naratif)" },
  ];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Hasil Penelitian</h2>
        <p className="step-subtitle">Isi ringkasan, hasil, dan rencana penelitian dengan format naratif sesuai template LPPM NF.</p>
      </div>

      {fields.map((item) => (
        <div key={item.name} className="form-card">
          <label className="form-label fw-semibold">{item.label}</label>
          <QuillEditor
            theme="snow"
            value={data[item.name] || ""}
            onChange={(content) => handleQuillChange(item.name, content)}
            placeholder={`Tulis ${item.label.toLowerCase()}...`}
          />
          {errors?.[item.name] && (
            <div className="form-error-text">{errors[item.name]}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressHasilStep;
