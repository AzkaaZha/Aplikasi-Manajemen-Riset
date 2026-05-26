import { useState } from "react";
import { deleteFile, uploadFile } from "../../../../api/documentApi";
import "../../../../styles/documents/document-lampiran.css";

const FinalLampiranStep = ({ data, documentId, refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    tipe: "Dokumen Pendukung",
    keterangan: "",
    file: null
  });

  const tipeOptions = [
    "PDF", "JPG", "PNG", "Dokumen Pendukung", "Bukti Luaran", 
    "Artikel Publikasi", "HKI", "Nota/Kwitansi", "Lainnya"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        e.target.value = null;
        return;
      }
      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowed.includes(file.type)) {
        alert("Format file hanya diperbolehkan PDF, JPG, atau PNG");
        e.target.value = null;
        return;
      }
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.nama) {
      alert("Nama lampiran dan file wajib diisi");
      return;
    }

    setLoading(true);
    try {
      console.log("DEBUG: [Lampiran] Memulai Upload...");
      
      const uploadData = new FormData();
      uploadData.append("file", formData.file);
      uploadData.append("nama_lampiran", formData.nama);
      uploadData.append("tipe_lampiran", formData.tipe);
      uploadData.append("keterangan", formData.keterangan);

      const response = await uploadFile(documentId, uploadData);
      console.log("DEBUG: [Lampiran] Upload Berhasil:", response);
      
      setFormData({
        nama: "",
        tipe: "Dokumen Pendukung",
        keterangan: "",
        file: null
      });
      
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";

      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Lampiran] Upload Error:", err.response?.data || err.message);
      if (err.response?.status === 404 || err.message.includes("404")) {
         alert("Fitur upload ke server belum tersedia (404). Silakan hubungi admin untuk aktivasi endpoint.");
      } else {
         alert(`Gagal mengunggah lampiran: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLampiran = async (fileId) => {
    if (!window.confirm("Hapus lampiran ini?")) return;
    
    setLoading(true);
    try {
      console.log("DEBUG: [Lampiran] Memanggil API Delete");
      await deleteFile(documentId, fileId);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Lampiran] Response Error:", err.response?.data || err.message);
      alert(`Gagal menghapus lampiran: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const lampiranList = data.lampiranFiles || [];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Lampiran Laporan Akhir</h2>
        <p className="step-subtitle">Unggah dokumen pendukung untuk laporan akhir Anda.</p>
      </div>

      <div className="form-card mb-4">
        <h3 className="form-card-title">
          <i className="bi bi-cloud-arrow-up"></i> Tambah Lampiran Baru
        </h3>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Nama Lampiran <span className="text-danger">*</span></label>
            <input 
              type="text" 
              name="nama"
              className="form-control" 
              placeholder="Contoh: Bukti Capaian Luaran"
              value={formData.nama}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Tipe Lampiran <span className="text-danger">*</span></label>
            <select 
              name="tipe"
              className="form-select"
              value={formData.tipe}
              onChange={handleInputChange}
            >
              {tipeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">File Upload <span className="text-danger">*</span></label>
            <input 
              id="fileInput"
              type="file" 
              className="form-control" 
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="form-text">Format: PDF, JPG, PNG. Maksimal 5MB.</div>
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Keterangan (Opsional)</label>
            <textarea 
              name="keterangan"
              className="form-control" 
              rows="2"
              placeholder="Tambahkan catatan singkat..."
              value={formData.keterangan}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>
        <div className="text-end mt-4">
          <button 
            className="btn-add" 
            onClick={handleUpload}
            disabled={loading || !formData.file || !formData.nama}
          >
            <i className={`bi ${loading ? 'bi-hourglass-split' : 'bi-plus-circle'} me-2`}></i>
            {loading ? "Sedang Mengunggah..." : "Simpan Lampiran"}
          </button>
        </div>
      </div>

      <div className="step-header mt-5">
        <h3 className="step-title fs-5">Daftar Lampiran & Hasil Ekspor</h3>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Lampiran</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {lampiranList.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-4 text-muted">Belum ada lampiran atau dokumen yang diekspor.</td></tr>
            ) : (
              lampiranList.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="fw-medium text-dark">{l.nama_file}</div>
                    {l.is_local && <span className="badge bg-warning text-dark small mt-1">Belum tersimpan di server</span>}
                  </td>
                  <td>
                    <span className="badge-custom badge-outline-primary text-uppercase">
                      {l.tipe_file}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {l.created_at ? new Date(l.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    }) : "-"}
                  </td>
                  <td>
                    <div className="action-btns justify-content-center">
                      <button className="btn-icon btn-icon-download" title="Lihat/Download" onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/documents/${documentId}/files/${l.id}/download`, '_blank')}>
                        <i className="bi bi-download"></i>
                      </button>
                      <button className="btn-icon btn-icon-delete" title="Hapus" onClick={() => handleDeleteLampiran(l.id)}>
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

export default FinalLampiranStep;
