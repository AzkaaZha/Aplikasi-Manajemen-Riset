import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addPartner, deletePartner } from "../../../../api/documentApi";

const FinalMitraStep = ({ data, documentId, refreshData }) => {
  const [formData, setFormData] = useState({
    nama_mitra: "",
    jenis_mitra: "",
    alamat: "",
    keterangan: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMitra = async () => {
    if (!documentId) {
      alert("ID Dokumen tidak ditemukan.");
      return;
    }
    if (!formData.nama_mitra) {
      alert("Nama mitra wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama_mitra: formData.nama_mitra,
        jenis_mitra: formData.jenis_mitra,
        alamat: formData.alamat,
        keterangan: formData.keterangan
      };

      console.log("DEBUG: [Mitra] Memanggil API Create");
      console.log("DEBUG: [Mitra] Endpoint:", `/documents/${documentId}/partners/`);
      console.log("DEBUG: [Mitra] Payload:", payload);

      const response = await addPartner(documentId, payload);
      
      console.log("DEBUG: [Mitra] Response Sukses:", response);
      
      setFormData({
        nama_mitra: "",
        jenis_mitra: "",
        alamat: "",
        keterangan: "",
      });
      
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Mitra] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`Gagal menambah mitra: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMitra = async (id) => {
    if (!documentId) return;
    if (!window.confirm("Hapus mitra ini?")) return;
    try {
      await deletePartner(documentId, id);
      if (refreshData) refreshData();
    } catch (err) {
      alert("Gagal menghapus mitra");
    }
  };

  const fields = [
    { type: "text", name: "nama_mitra", label: "Nama Mitra", placeholder: "Nama lengkap mitra atau instansi" },
    { type: "text", name: "jenis_mitra", label: "Jenis Mitra / Peran", placeholder: "Contoh: Mitra Industri, Mitra Riset" },
    { type: "textarea", name: "alamat", label: "Alamat Mitra" },
    { type: "textarea", name: "keterangan", label: "Keterangan Kontribusi" },
  ];

  const mitraList = data.mitra || [];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Data Mitra</h2>
        <p className="step-subtitle">Kelola daftar instansi atau individu yang menjadi mitra penelitian untuk laporan akhir.</p>
      </div>

      <div className="form-card">
        <h3 className="form-card-title">
          <i className="bi bi-building-add"></i> Tambah Mitra
        </h3>
        <div className="row">
          {fields.map((f) => (
            <div key={f.name} className="col-md-6">
              <DynamicFieldRenderer field={f} value={formData[f.name]} onChange={handleInputChange} />
            </div>
          ))}
        </div>
        <div className="text-end mt-2">
          <button className="btn-add" onClick={handleAddMitra} disabled={loading}>
            {loading ? "Menambah..." : "Tambah"}
          </button>
        </div>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Mitra</th>
              <th>Jenis / Peran</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mitraList.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4">Belum ada data mitra.</td></tr>
            ) : (
              mitraList.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.nama_mitra}</strong></td>
                  <td>{m.jenis_mitra}</td>
                  <td>{m.alamat}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-icon-delete" onClick={() => handleDeleteMitra(m.id)}>
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

export default FinalMitraStep;