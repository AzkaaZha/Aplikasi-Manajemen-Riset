
function ResearchFormModal({ show, isEditMode, form, handleInputChange, handleSubmit, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-custom">
        <div className="modal-header-custom">
          <h5>{isEditMode ? "Edit Penelitian" : "Tambah Penelitian Baru"}</h5>
          <i className="bi bi-x-lg close-modal" onClick={onClose}></i>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="research-form-group">
            <label className="research-form-label">Judul Penelitian</label>
            <input
              type="text"
              name="nama"
              className="research-form-input"
              placeholder="Masukkan judul penelitian"
              value={form.nama}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="research-form-group">
            <label className="research-form-label">Tahun</label>
            <input
              type="number"
              name="tahun"
              className="research-form-input"
              placeholder="Contoh: 2024"
              value={form.tahun}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="btn-save-research">
            {isEditMode ? "Simpan Perubahan" : "Simpan Penelitian"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResearchFormModal;

