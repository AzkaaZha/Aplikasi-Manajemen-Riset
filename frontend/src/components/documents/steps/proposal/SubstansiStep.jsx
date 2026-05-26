import QuillEditor from "../../../common/QuillEditor";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";

const SubstansiStep = ({ data, onChange }) => {
  const fields = [
    { type: "text", name: "judul_penelitian", label: "Judul Penelitian", required: false, disabled: true, placeholder: "Judul penelitian terisi otomatis" },
    { type: "text", name: "bidang_fokus_rirn", label: "Bidang Fokus RIRN / Bidang Unggulan Perguruan Tinggi", required: false, placeholder: "Contoh: Pangan, Kesehatan, atau bidang unggulan PT..." },
    { type: "text", name: "tema_penelitian", label: "Tema Penelitian", required: false, placeholder: "Masukkan tema utama dari penelitian ini..." },
    { type: "text", name: "topik_penelitian", label: "Topik Penelitian", required: false, placeholder: "Masukkan topik spesifik penelitian..." },
    { type: "text", name: "rumpun_bidang_ilmu", label: "Rumpun Bidang Ilmu", required: false, placeholder: "Contoh: Ilmu Komputer, Sistem Informasi, dll..." },
    { type: "text", name: "target_akhir_tkt", label: "Target Akhir TKT", required: false, placeholder: "Contoh: TKT 3, TKT 4..." },
    { type: "number", name: "lama_penelitian", label: "Lama Penelitian (Tahun)", required: false, min: 1, max: 5, placeholder: "Estimasi lama penelitian dalam tahun (contoh: 1)" },
    { type: "text", name: "kata_kunci", label: "Kata Kunci", required: false, placeholder: "Kata kunci maksimal 5 kata" },
    {
      type: "checkbox",
      name: "hasil_penelitian_pilihan",
      label: "Hasil Akhir yang Dicapai",
      required: false,
      options: [
        { label: "Laporan Akhir Penelitian", value: "Laporan Akhir Penelitian" },
        { label: "Jurnal Internasional Bereputasi", value: "Jurnal Internasional Bereputasi" },
        { label: "Jurnal Nasional Terakreditasi", value: "Jurnal Nasional Terakreditasi" },
        { label: "Artikel Prosiding", value: "Artikel Prosiding" },
        { label: "Buku", value: "Buku" },
        { label: "Prototype", value: "Prototype" },
        { label: "Produk/Alat/Aplikasi", value: "Produk/Alat/Aplikasi" }
      ]
    }
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
              value={data[fields[0].name]} 
              onChange={onChange} 
            />
          </div>
          {fields.slice(1, -1).map((f) => (
            <div key={f.name} className="col-md-6">
              <DynamicFieldRenderer 
                field={f} 
                value={data[f.name]} 
                onChange={onChange} 
              />
            </div>
          ))}
          <div className="col-12">
            <DynamicFieldRenderer 
              field={fields[fields.length - 1]} 
              value={data[fields[fields.length - 1].name]} 
              onChange={onChange} 
            />
          </div>
        </div>
      </div>

      {[
        { name: "ringkasan", label: "Ringkasan", placeholder: "Ringkasan penelitian tidak lebih dari 500 kata yang berisi latar belakang penelitian, tujuan dan tahapan metode penelitian, luaran yang ditargetkan, serta uraian TKT penelitian yang diusulkan." },
        { name: "latar_belakang", label: "Latar Belakang", placeholder: "Latar belakang penelitian tidak lebih dari 500 kata yang berisi latar belakang dan permasalahan yang akan diteliti, tujuan khusus, dan urgensi penelitian. Pada bagian ini perlu dijelaskan uraian tentang spesifikasi khusus terkait dengan skema." },
        { name: "tinjauan_pustaka", label: "Tinjauan Pustaka", placeholder: "Tinjauan pustaka tidak lebih dari 1000 kata dengan mengemukakan state of the art dalam bidang yang diteliti. Bagan dapat dibuat dalam bentuk JPG/PNG yang kemudian disisipkan dalam isian ini. Sumber pustaka/referensi primer yang relevan dan dengan mengutamakan hasil penelitian pada jurnal ilmiah dan/atau paten yang terkini. Disarankan penggunaan sumber pustaka 10 tahun terakhir." },
        { name: "metode_penelitian", label: "Metode", placeholder: "Metode atau cara untuk mencapai tujuan yang telah ditetapkan ditulis tidak melebihi 600 kata. Bagian ini dilengkapi dengan diagram alir penelitian yang menggambarkan apa yang sudah dilaksanakan dan yang akan dikerjakan selama waktu yang diusulkan. Format diagram alir dapat berupa file JPG/PNG. Bagan penelitian harus dibuat secara utuh dengan penahapan yang jelas, mulai dari awal bagaimana proses dan luarannya, dan indikator capaian yang ditargetkan. Di bagian ini harus juga mengisi tugas masing-masing anggota pengusul sesuai tahapan penelitian yang diusulkan." },
        { name: "daftar_pustaka", label: "Daftar Pustaka", placeholder: "Daftar pustaka disusun dan ditulis berdasarkan sistem nomor sesuai dengan urutan pengutipan. Hanya pustaka yang disitasi pada usulan penelitian yang dicantumkan dalam Daftar Pustaka." },
      ].map((item) => (
        <div key={item.name} className="form-card">
          <label className="form-label fw-semibold">{item.label}</label>
          <QuillEditor
            theme="snow"
            value={data[item.name] || ""}
            onChange={(content) => handleQuillChange(item.name, content)}
            placeholder={item.placeholder}
          />
        </div>
      ))}
    </div>
  );
};

export default SubstansiStep;
