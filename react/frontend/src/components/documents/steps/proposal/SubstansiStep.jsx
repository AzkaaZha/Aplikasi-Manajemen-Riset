import QuillEditor from "../../../common/QuillEditor";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";

const SubstansiStep = ({ data, onChange }) => {
  const fields = [
    { type: "text", name: "judul_dokumen", label: "Judul Dokumen", required: true, placeholder: "Masukkan judul dokumen..." },
    { type: "text", name: "judul_penelitian", label: "Judul Penelitian", required: true, placeholder: "Masukkan judul penelitian..." },
    { type: "text", name: "bidang_fokus_rirn", label: "Bidang Fokus RIRN / Bidang Unggulan Perguruan Tinggi", required: true },
    { type: "text", name: "tema_penelitian", label: "Tema Penelitian", required: true },
    { type: "text", name: "topik_penelitian", label: "Topik Penelitian", required: true },
    { type: "text", name: "rumpun_bidang_ilmu", label: "Rumpun Bidang Ilmu", required: true },
    { type: "text", name: "target_akhir_tkt", label: "Target Akhir TKT", required: true },
    { type: "number", name: "lama_penelitian", label: "Lama Penelitian (Tahun)", required: true, min: 1, max: 5 },
    { type: "text", name: "kata_kunci", label: "Kata Kunci", required: true },
    { type: "number", name: "dana_penelitian", label: "Dana Penelitian / Dana Penelitian yang Dikeluarkan (Rp)", required: false, placeholder: "Masukkan dana penelitian dalam rupiah", min: 0, step: 10000 },
  ];


  const handleQuillChange = (name, content) => {
    onChange({ target: { name, value: content } });
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Substansi / Data Inti</h2>
        <p className="step-subtitle">Isi data inti penelitian sesuai dengan template LPPM NF.</p>
      </div>

      <div className="form-card">
        <div className="row">
          <div className="col-12">
            <DynamicFieldRenderer 
              field={fields[0]} 
              value={data.judul_dokumen} 
              onChange={onChange} 
            />
          </div>
          {fields.slice(1).map((f) => (
            <div key={f.name} className="col-md-6">
              <DynamicFieldRenderer 
                field={f} 
                value={data[f.name]} 
                onChange={onChange} 
              />
            </div>
          ))}
        </div>
      </div>

      {[
        { name: "ringkasan", label: "Ringkasan" },
        { name: "latar_belakang", label: "Latar Belakang" },
        { name: "tinjauan_pustaka", label: "Tinjauan Pustaka" },
        { name: "metode_penelitian", label: "Metode Penelitian" },
        { name: "daftar_pustaka", label: "Daftar Pustaka" },
      ].map((item) => (
        <div key={item.name} className="form-card">
          <label className="form-label fw-semibold">{item.label}</label>
          <QuillEditor
            theme="snow"
            value={data[item.name] || ""}
            onChange={(content) => handleQuillChange(item.name, content)}
          />
        </div>
      ))}
    </div>
  );
};

export default SubstansiStep;
