import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addOutput, deleteOutput } from "../../../../api/documentApi";

const LuaranStep = ({ data, documentId, refreshData }) => {
  const [formData, setFormData] = useState({
    kategori_luaran: "wajib",
    tahun_luaran: new Date().getFullYear(),
    jenis_luaran: "",
    status_target: "",
    keterangan: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLuaran = async () => {
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

      console.log("DEBUG: [Luaran] Memanggil API Create");
      console.log("DEBUG: [Luaran] Endpoint:", `/documents/${documentId}/outputs/`);
      console.log("DEBUG: [Luaran] Payload:", payload);

      const response = await addOutput(documentId, payload);
      
      console.log("DEBUG: [Luaran] Response Sukses:", response);
      
      setFormData({
        kategori_luaran: "wajib",
        tahun_luaran: new Date().getFullYear(),
        jenis_luaran: "",
        status_target: "",
        keterangan: "",
      });
      
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Luaran] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`Gagal menambah luaran: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
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
        <p className="step-subtitle">Tentukan target luaran wajib dan tambahan untuk proposal.</p>
      </div>

      <div className="form-card">
        <h3 className="form-card-title">
          <i className="bi bi-award"></i> Tambah Target Luaran
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
          <button className="btn-add" onClick={handleAddLuaran} disabled={loading}>
            {loading ? "Menambah..." : "Tambah"}
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

export default LuaranStep;
