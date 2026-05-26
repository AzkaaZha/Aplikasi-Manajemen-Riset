import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addPartner, updatePartner, deletePartner } from "../../../../api/documentApi";

const FinalMitraStep = ({ data, documentId, refreshData }) => {
  const initialFormState = {
    nama_mitra: "",
    jenis_mitra: "",
    alamat: "",
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

      let response;
      if (editingId) {
        console.log("DEBUG: [Mitra] Memanggil API Update");
        response = await updatePartner(documentId, editingId, payload);
      } else {
        console.log("DEBUG: [Mitra] Memanggil API Create");
        response = await addPartner(documentId, payload);
      }
      
      console.log("DEBUG: [Mitra] Response Sukses:", response);
      
      setFormData(initialFormState);
      setEditingId(null);
      
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Mitra] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`${editingId ? "Gagal memperbarui mitra" : "Gagal menambah mitra"}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (mitra) => {
    setFormData({
      nama_mitra: mitra.nama_mitra || "",
      jenis_mitra: mitra.jenis_mitra || "",
      alamat: mitra.alamat || "",
      keterangan: mitra.keterangan || "",
    });
    setEditingId(mitra.id);
    document.querySelector('.content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
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
          <i className={`bi ${editingId ? "bi-pencil-square" : "bi-building-add"}`}></i> 
          {editingId ? " Edit Mitra" : " Tambah Mitra"}
        </h3>
        <div className="row">
          {fields.map((f) => (
            <div key={f.name} className="col-md-6">
              <DynamicFieldRenderer field={f} value={formData[f.name]} onChange={handleInputChange} />
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
                      <button className="btn-icon btn-icon-edit" onClick={() => handleEditClick(m)}>
                        <i className="bi bi-pencil"></i>
                      </button>
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