import QuillEditor from "../../../common/QuillEditor";

const FinalHasilStep = ({ data, onChange, errors }) => {
  const handleQuillChange = (name, value) => {
    onChange({ target: { name, value } });
  };


  const fields = [
    { name: "prakata", label: "Prakata" },
    { name: "ringkasan", label: "Ringkasan" },
    { name: "latar_belakang", label: "Latar Belakang" },
    { name: "tinjauan_pustaka", label: "Tinjauan Pustaka" },
    { name: "metode", label: "Metode" },
    { name: "hasil_pelaksanaan_penelitian", label: "Hasil Pelaksanaan Penelitian" },
    { name: "status_luaran", label: "Status Luaran (Naratif)" },
    { name: "peran_mitra", label: "Peran Mitra" },
    { name: "kendala_pelaksanaan", label: "Kendala Pelaksanaan Penelitian" },
    { name: "rencana_tindak_lanjut", label: "Rencana Tindak Lanjut Penelitian" },
    { name: "daftar_pustaka", label: "Daftar Pustaka" },
    { name: "lampiran", label: "Lampiran (Naratif)" },
  ];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Hasil Penelitian</h2>
        <p className="step-subtitle">Isi hasil penelitian akhir secara naratif sesuai template LPPM NF.</p>
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

export default FinalHasilStep;
