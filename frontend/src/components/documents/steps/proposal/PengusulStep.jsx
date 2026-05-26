import { useState } from "react";
import DynamicFieldRenderer from "../../../forms/DynamicFieldRenderer";
import { addResearcher, updateResearcher, deleteResearcher } from "../../../../api/documentApi";

const PengusulStep = ({ data, documentId, refreshData }) => {
  const initialFormState = {
    nama: "",
    peran: "anggota",
    institusi: "",
    program_studi: "",
    bidang_tugas: "",
    nidn_nip_nim: "",
    jenis_kelamin: "",
    jabatan_fungsional: "",
    id_sinta: "",
    h_index: "",
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
      alert("ID Dokumen tidak ditemukan. Silakan simpan dokumen terlebih dahulu.");
      return;
    }
    
    if (!formData.nama || !formData.peran) {
      alert("Nama dan peran wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama: formData.nama,
        peran: formData.peran.toLowerCase(),
        institusi: formData.institusi,
        program_studi: formData.program_studi,
        bidang_tugas: formData.bidang_tugas,
        id_sinta: formData.id_sinta,
        h_index: formData.h_index ? parseInt(formData.h_index) : 0,
        nidn_nip_nim: formData.nidn_nip_nim,
        jenis_kelamin: formData.jenis_kelamin,
        jabatan_fungsional: formData.jabatan_fungsional,
      };

      let response;
      if (editingId) {
        response = await updateResearcher(documentId, editingId, payload);
      } else {
        response = await addResearcher(documentId, payload);
      }
      
      console.log("DEBUG: [Pengusul] Response Sukses:", response);
      
      setFormData(initialFormState);
      setEditingId(null);
      if (refreshData) refreshData();
    } catch (err) {
      console.error("DEBUG: [Pengusul] Response Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.detail || err.message || "Terjadi kesalahan server";
      alert(`${editingId ? "Gagal memperbarui pengusul" : "Gagal menambah pengusul"}: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (researcher) => {
    setFormData({
      nama: researcher.nama || "",
      peran: researcher.peran || "anggota",
      institusi: researcher.institusi || "",
      program_studi: researcher.program_studi || "",
      bidang_tugas: researcher.bidang_tugas || "",
      nidn_nip_nim: researcher.nidn_nip_nim || "",
      jenis_kelamin: researcher.jenis_kelamin || "",
      jabatan_fungsional: researcher.jabatan_fungsional || "",
      id_sinta: researcher.id_sinta || "",
      h_index: researcher.h_index || "",
    });
    setEditingId(researcher.id);
    document.querySelector('.content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePengusul = async (id) => {
    if (!documentId) return;
    if (!window.confirm("Hapus pengusul ini?")) return;
    try {
      await deleteResearcher(documentId, id);
      if (refreshData) refreshData();
    } catch (err) {
      alert("Gagal menghapus pengusul");
    }
  };

  const fields = [
    { type: "text", name: "nama", label: "Nama Lengkap", placeholder: "Nama lengkap beserta gelar (contoh: Dr. Budi Santoso, M.Kom)" },
    {
      type: "select",
      name: "peran",
      label: "Peran",
      options: [
        { label: "Ketua", value: "ketua" },
        { label: "Anggota", value: "anggota" },
      ],
    },
    {
      type: "select",
      name: "jenis_kelamin",
      label: "Jenis Kelamin",
      options: [
        { label: "Laki-laki", value: "Laki-laki" },
        { label: "Perempuan", value: "Perempuan" },
      ],
    },
    {
      type: "select",
      name: "jabatan_fungsional",
      label: "Jabatan Fungsional",
      options: [
        { label: "Asisten Ahli", value: "Asisten Ahli" },
        { label: "Lektor", value: "Lektor" },
        { label: "Lektor Kepala", value: "Lektor Kepala" },
        { label: "Guru Besar / Profesor", value: "Guru Besar / Profesor" },
        { label: "Tenaga Pengajar", value: "Tenaga Pengajar" },
        { label: "Mahasiswa", value: "Mahasiswa" },
        { label: "Lainnya", value: "Lainnya" },
      ],
    },
    { type: "text", name: "institusi", label: "Perguruan Tinggi / Institusi", placeholder: "Contoh: Universitas Nusa Putra" },
    { type: "text", name: "program_studi", label: "Program Studi / Bagian", placeholder: "Contoh: Teknik Informatika" },
    { type: "text", name: "bidang_tugas", label: "Bidang Tugas", placeholder: "Uraian singkat tugas dalam penelitian ini" },
    { type: "text", name: "nidn_nip_nim", label: "NIDN / NIP / NIM", placeholder: "Contoh: 0412018801" },
    { type: "text", name: "id_sinta", label: "ID Sinta", placeholder: "Contoh: 6123456" },
    { type: "number", name: "h_index", label: "H-Index", placeholder: "Contoh: 3" },
  ];

  const pengusulList = data.pengusul || [];

  return (
    <div className="step-container">
      <div className="step-header">
        <h2 className="step-title">Data Pengusul</h2>
        <p className="step-subtitle">Kelola daftar ketua dan anggota peneliti.</p>
      </div>

      <div className="form-card">
        <h3 className="form-card-title">
          <i className={`bi ${editingId ? "bi-pencil-square" : "bi-person-plus"}`}></i> 
          {editingId ? " Edit Peneliti" : " Tambah Peneliti"}
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
              <th>Nama</th>
              <th>Peran</th>
              <th>Jenis Kelamin</th>
              <th>Jabatan Fungsional</th>
              <th>Institusi</th>
              <th>NIDN/NIP/NIM</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pengusulList.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4">Belum ada data pengusul.</td></tr>
            ) : (
              pengusulList.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.nama}</strong></td>
                  <td><span className={`badge ${r.peran === 'ketua' ? 'badge-ketua' : 'badge-anggota'}`}>{r.peran}</span></td>
                  <td>{r.jenis_kelamin || "-"}</td>
                  <td>{r.jabatan_fungsional || "-"}</td>
                  <td>{r.institusi || "-"}</td>
                  <td>{r.nidn_nip_nim || "-"}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon btn-icon-edit" onClick={() => handleEditClick(r)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon btn-icon-delete" onClick={() => handleDeletePengusul(r.id)}>
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

export default PengusulStep;
