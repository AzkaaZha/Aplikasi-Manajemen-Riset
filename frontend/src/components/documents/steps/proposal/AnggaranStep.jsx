import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addBudget, updateBudget, deleteBudget } from "../../../../api/documentApi";

const AnggaranStep = ({ data, documentId, refreshData }) => {
  const initialFormState = {
    jenis_pembelanjaan: "",
    item: "",
    satuan: "",
    volume: "",
    biaya_satuan: "",
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
    if (!formData.jenis_pembelanjaan || !formData.item) {
      alert("Jenis dan item wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        jenis_pembelanjaan: formData.jenis_pembelanjaan,
        item: formData.item,
        satuan: formData.satuan,
        volume: parseInt(formData.volume) || 0,
        biaya_satuan: parseFloat(formData.biaya_satuan) || 0
      };

      let response;
      if (editingId) {
        console.log("DEBUG: [Anggaran] Memanggil API Update");
        response = await updateBudget(documentId, editingId, payload);
      } else {
        console.log("DEBUG: [Anggaran] Memanggil API Create");
        response = await addBudget(documentId, payload);
      }
      
      console.log("DEBUG: [Anggaran] Response Sukses:", response);
      
      setFormData(initialFormState);
      setEditingId(null);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Anggaran] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`${editingId ? "Gagal memperbarui anggaran" : "Gagal menambah anggaran"}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (anggaran) => {
    setFormData({
      jenis_pembelanjaan: anggaran.jenis_pembelanjaan || "",
      item: anggaran.item || "",
      satuan: anggaran.satuan || "",
      volume: anggaran.volume || "",
      biaya_satuan: anggaran.biaya_satuan || "",
    });
    setEditingId(anggaran.id);
    document.querySelector('.content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAnggaran = async (id) => {
    if (!documentId) return;
    if (!window.confirm("Hapus anggaran ini?")) return;
    try {
      await deleteBudget(documentId, id);
      if (refreshData) refreshData();
    } catch (err) {
      alert("Gagal menghapus anggaran");
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const fields = [
    {
      type: "select",
      name: "jenis_pembelanjaan",
      label: "Jenis Pembelanjaan",
      options: [
        { label: "Bahan", value: "Bahan" },
        { label: "Pengumpulan Data", value: "Pengumpulan Data" },
        { label: "Analisis Data", value: "Analisis Data" },
        { label: "Perjalanan", value: "Perjalanan" },
        { label: "Honorarium", value: "Honorarium" },
        { label: "Lainnya", value: "Lainnya" },
      ],
    },
    { type: "text", name: "item", label: "Item / Nama Barang" },
    { type: "text", name: "satuan", label: "Satuan (Rim, Paket, dll)" },
    { type: "number", name: "volume", label: "Volume" },
    { type: "number", name: "biaya_satuan", label: "Harga Satuan (Rp)" },
  ];

  const anggaranList = data.anggaran || [];
  const totalBudget = anggaranList.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  return (
    <div className="step-container">
      <div className="step-header d-flex justify-content-between align-items-end">
        <div>
          <h2 className="step-title">Rencana Anggaran Biaya (RAB)</h2>
          <p className="step-subtitle">Masukkan rincian anggaran yang dibutuhkan untuk proposal.</p>
        </div>
        <div className="text-end">
          <div className="small fw-bold text-muted text-uppercase mb-1">Total Anggaran</div>
          <div className="fs-3 fw-bold text-dark-blue">{formatRupiah(totalBudget)}</div>
        </div>
      </div>

      <div className="form-card mt-3">
        <h3 className="form-card-title">
          <i className={`bi ${editingId ? "bi-pencil-square" : "bi-wallet2"}`}></i> 
          {editingId ? " Edit Anggaran" : " Tambah Anggaran"}
        </h3>
        <div className="row">
          <div className="col-md-4">
            <DynamicFieldRenderer field={fields[0]} value={formData.jenis_pembelanjaan} onChange={handleInputChange} />
          </div>
          <div className="col-md-8">
            <DynamicFieldRenderer field={fields[1]} value={formData.item} onChange={handleInputChange} />
          </div>
          <div className="col-md-4">
            <DynamicFieldRenderer field={fields[2]} value={formData.satuan} onChange={handleInputChange} />
          </div>
          <div className="col-md-4">
            <DynamicFieldRenderer field={fields[3]} value={formData.volume} onChange={handleInputChange} />
          </div>
          <div className="col-md-4">
            <DynamicFieldRenderer field={fields[4]} value={formData.biaya_satuan} onChange={handleInputChange} />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
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
              <th>Jenis & Item</th>
              <th>Vol & Satuan</th>
              <th>Harga Satuan</th>
              <th>Total</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {anggaranList.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">Belum ada data anggaran.</td></tr>
            ) : (
              anggaranList.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span className="badge-custom badge-tambahan mb-1 d-inline-block">{b.jenis_pembelanjaan}</span>
                    <div><strong>{b.item}</strong></div>
                  </td>
                  <td>{b.volume} {b.satuan}</td>
                  <td>{formatRupiah(b.biaya_satuan)}</td>
                  <td><strong>{formatRupiah(b.total)}</strong></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-icon-edit" onClick={() => handleEditClick(b)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon btn-icon-delete" onClick={() => handleDeleteAnggaran(b.id)}>
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

export default AnggaranStep;
