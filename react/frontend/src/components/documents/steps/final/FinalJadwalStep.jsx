import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addSchedule, deleteSchedule } from "../../../../api/documentApi";

const FinalJadwalStep = ({ data, documentId, refreshData }) => {
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [loading, setLoading] = useState(false);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `B${i + 1}`,
    value: i + 1,
  }));

  const handleAddJadwal = async () => {
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

      console.log("DEBUG: [Jadwal] Memanggil API Create");
      console.log("DEBUG: [Jadwal] Endpoint:", `/documents/${documentId}/schedules/`);
      console.log("DEBUG: [Jadwal] Payload:", payload);

      const response = await addSchedule(documentId, payload);
      
      console.log("DEBUG: [Jadwal] Response Sukses:", response);
      
      setNamaKegiatan("");
      setSelectedMonths([]);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Jadwal] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`Gagal menambah jadwal: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
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
          <i className="bi bi-calendar-check"></i> Tambah Jadwal
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
          <button className="btn-add" onClick={handleAddJadwal} disabled={loading}>
            {loading ? "Menambah..." : "Tambah"}
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
