import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addSchedule, updateSchedule, deleteSchedule } from "../../../../api/documentApi";

const FinalJadwalStep = ({ data, documentId, refreshData }) => {
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `B${i + 1}`,
    value: i + 1,
  }));

  const handleSubmit = async () => {
    if (!documentId) {
      alert("ID Dokumen tidak ditemukan.");
      return;
    }
    if (!namaKegiatan) {
      alert("Nama kegiatan wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama_kegiatan: namaKegiatan,
      };
      
      for (let i = 1; i <= 12; i++) {
        payload[`bulan_${i}`] = selectedMonths.includes(i) ? 1 : 0;
      }

      let response;
      if (editingId) {
        console.log("DEBUG: [Jadwal] Memanggil API Update");
        response = await updateSchedule(documentId, editingId, payload);
      } else {
        console.log("DEBUG: [Jadwal] Memanggil API Create");
        response = await addSchedule(documentId, payload);
      }
      
      console.log("DEBUG: [Jadwal] Response Sukses:", response);
      
      setNamaKegiatan("");
      setSelectedMonths([]);
      setEditingId(null);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Jadwal] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`${editingId ? "Gagal memperbarui jadwal" : "Gagal menambah jadwal"}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (jadwal) => {
    setNamaKegiatan(jadwal.nama_kegiatan || "");
    const months = [];
    for (let i = 1; i <= 12; i++) {
      if (jadwal[`bulan_${i}`]) {
        months.push(i);
      }
    }
    setSelectedMonths(months);
    setEditingId(jadwal.id);
    document.querySelector('.content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteJadwal = async (id) => {
    if (!documentId) return;
    if (!window.confirm("Hapus jadwal ini?")) return;
    try {
      await deleteSchedule(documentId, id);
      if (refreshData) refreshData();
    } catch (err) {
      alert("Gagal menghapus jadwal");
    }
  };

  const fields = [
    { type: "text", name: "namaKegiatan", label: "Nama Kegiatan", placeholder: "Contoh: Pengumpulan Data" },
    { type: "toggle", name: "bulan", label: "Bulan Pelaksanaan", options: monthOptions },
  ];

  const jadwalList = data.jadwal || [];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Jadwal Kegiatan</h2>
        <p className="step-subtitle">Buat rincian jadwal pelaksanaan per bulan untuk laporan akhir.</p>
      </div>

      <div className="form-card">
        <h3 className="form-card-title">
          <i className={`bi ${editingId ? "bi-pencil-square" : "bi-calendar-check"}`}></i> 
          {editingId ? " Edit Jadwal" : " Tambah Jadwal"}
        </h3>
        <div className="row">
          <div className="col-12">
            <DynamicFieldRenderer
              field={fields[0]}
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
            />
          </div>
          <div className="col-12">
            <DynamicFieldRenderer
              field={fields[1]}
              value={selectedMonths}
              onChange={(e) => setSelectedMonths(e.target.value || [])}
            />
          </div>
        </div>
        <div className="text-end mt-2">
          {editingId && (
            <button className="btn-cancel me-2" onClick={() => { setEditingId(null); setNamaKegiatan(""); setSelectedMonths([]); }}>
              Batal
            </button>
          )}
          <button className="btn-add" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Tambah")}
          </button>
        </div>
      </div>

      <div className="custom-table-container overflow-auto">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama Kegiatan</th>
              {monthOptions.map(m => (
                <th key={m.value} className="text-center">{m.label}</th>
              ))}
              <th className="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwalList.length === 0 ? (
              <tr><td colSpan="14" className="text-center py-4">Belum ada data jadwal.</td></tr>
            ) : (
              jadwalList.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.nama_kegiatan}</strong></td>
                  {monthOptions.map(m => (
                    <td key={m.value} className="text-center">
                      {s[`bulan_${m.value}`] && (
                        <div className="schedule-indicator"></div>
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="action-btns justify-content-center">
                      <button className="btn-icon btn-icon-edit" onClick={() => handleEditClick(s)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon btn-icon-delete" onClick={() => handleDeleteJadwal(s.id)}>
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

export default FinalJadwalStep;
