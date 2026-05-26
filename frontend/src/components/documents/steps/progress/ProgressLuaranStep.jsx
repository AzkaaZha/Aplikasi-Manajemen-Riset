import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addOutput, updateOutput, deleteOutput } from "../../../../api/documentApi";

const ProgressLuaranStep = ({ data, documentId, refreshData }) => {
  const initialFormState = {
    kategori_luaran: "wajib",
    tahun_luaran: new Date().getFullYear(),
    jenis_luaran: "",
    status_target: "",
    keterangan: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!documentId) {
      alert("ID Dokumen tidak ditemukan.");
      return;
    }
    if (!formData.kategori_luaran || !formData.jenis_luaran) {
      alert("Kategori dan jenis luaran wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        kategori_luaran: formData.kategori_luaran.toLowerCase(),
        tahun_luaran: parseInt(formData.tahun_luaran) || new Date().getFullYear(),
        jenis_luaran: formData.jenis_luaran,
        status_target: formData.status_target,
        keterangan: formData.keterangan
      };

      let response;
      if (editingId) {
        console.log("DEBUG: [Luaran] Memanggil API Update");
        response = await updateOutput(documentId, editingId, payload);
      } else {
        console.log("DEBUG: [Luaran] Memanggil API Create");
        response = await addOutput(documentId, payload);
      }
      
      console.log("DEBUG: [Luaran] Response Sukses:", response);
      
      setFormData(initialFormState);
      setEditingId(null);
      
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Luaran] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`${editingId ? "Gagal memperbarui luaran" : "Gagal menambah luaran"}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (luaran) => {
    setFormData({
      kategori_luaran: luaran.kategori_luaran?.toLowerCase() || "wajib",
      tahun_luaran: luaran.tahun_luaran || new Date().getFullYear(),
      jenis_luaran: luaran.jenis_luaran || "",
      status_target: luaran.status_target || "",
      keterangan: luaran.keterangan || "",
    });
    setEditingId(luaran.id);
    document.querySelector('.content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteLuaran = async (id) => {
    if (!documentId) return;
    if (!window.confirm("Hapus luaran ini?")) return;
    try {
      await deleteOutput(documentId, id);
      if (refreshData) refreshData();
    } catch (err) {
      alert("Gagal menghapus luaran");
    }
  };

  const fields = [
    {
      type: "select",
      name: "kategori_luaran",
      label: "Kategori Luaran",
      required: true,
      options: [
        { label: "Wajib", value: "wajib" },
        { label: "Tambahan", value: "tambahan" },
      ],
    },
    { type: "number", name: "tahun_luaran", label: "Tahun Luaran", placeholder: "Tahun luaran..." },
    {
      type: "select",
      name: "jenis_luaran",
      label: "Jenis Luaran",
      required: true,
      options: [
        { label: "Jurnal Internasional", value: "Jurnal Internasional" },
        { label: "Jurnal Nasional", value: "Jurnal Nasional" },
        { label: "Prosiding", value: "Prosiding" },
        { label: "Buku", value: "Buku" },
        { label: "Paten", value: "Paten" },
        { label: "Prototype", value: "Prototype" },
        { label: "Produk", value: "Produk" },
      ],
    },
    {
      type: "select",
      name: "status_target",
      label: "Status Target Capaian",
      options: [
        { label: "Accepted", value: "Accepted" },
        { label: "Published", value: "Published" },
        { label: "Terdaftar", value: "Terdaftar" },
        { label: "Granted", value: "Granted" },
        { label: "Lainnya", value: "Lainnya" },
      ],
    },
    { type: "textarea", name: "keterangan", label: "Keterangan", placeholder: "URL jurnal/penerbit/paten, nama jurnal/penerbit, keterangan lainnya..." },
  ];

  const luaranList = data.luaran || [];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Luaran dan Target Capaian</h2>
        <p className="step-subtitle">Kelola data luaran penelitian dan status target capaian.</p>
      </div>

      <div className="form-card">
        <h3 className="form-card-title">
          <i className={`bi ${editingId ? "bi-pencil-square" : "bi-trophy"}`}></i> 
          {editingId ? " Edit Target Luaran" : " Tambah Target Luaran"}
        </h3>
        <div className="row">
          {fields.map((field) => (
            <div key={field.name} className={field.type === "textarea" ? "col-12" : "col-md-6"}>
              <DynamicFieldRenderer
                field={field}
                value={formData[field.name]}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
        <div className="text-end mt-2">
          {editingId && (
            <button className="btn-cancel me-2" onClick={() => { setEditingId(null); setFormData(initialFormState); }}>
              Batal
            </button>
          )}
          <button className="btn-add" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Tambah")}
          </button>
        </div>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Kategori & Tahun</th>
              <th>Jenis Luaran</th>
              <th>Status Target</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {luaranList.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">Belum ada data luaran.</td></tr>
            ) : (
              luaranList.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className={`badge-custom ${o.kategori_luaran?.toLowerCase() === "wajib" ? "badge-wajib" : "badge-tambahan"} mb-1 d-inline-block`}>
                      {o.kategori_luaran}
                    </span>
                    <div className="fw-semibold">{o.tahun_luaran}</div>
                  </td>
                  <td>{o.jenis_luaran}</td>
                  <td>
                    <span className="badge-custom badge-outline-primary">{o.status_target}</span>
                  </td>
                  <td>{o.keterangan || "-"}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-icon-edit" onClick={() => handleEditClick(o)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon btn-icon-delete" onClick={() => handleDeleteLuaran(o.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressLuaranStep;
