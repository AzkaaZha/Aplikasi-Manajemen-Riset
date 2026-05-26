const SelesaiStep = ({ onExport, isExporting }) => {
  return (
    <div className="step-container text-center py-5">
      <div className="mb-4">
        <div className="mx-auto d-flex align-items-center justify-content-center success-icon-wrapper">
          <i className="bi bi-check-circle-fill"></i>
        </div>
      </div>
      
      <h2 className="step-title fs-1 mb-3">Pengisian Selesai!</h2>
      <p className="step-subtitle fs-5 mx-auto mb-5 max-w-600">
        Anda telah melengkapi semua langkah yang diperlukan untuk proposal ini. 
        Anda dapat mengekspor dokumen ke format PDF resmi LPPM STT NF.
      </p>

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
        <button 
          className="btn-export-pdf" 
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sedang Mengekspor...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-pdf me-2"></i> Ekspor PDF Resmi
            </>
          )}
        </button>
      </div>

      <div className="form-card text-start mx-auto max-w-600">
        <h4 className="fw-bold mb-3 text-dark-blue">Informasi Penting:</h4>
        <ul className="text-muted fs-14">
          <li className="mb-2">Dokumen PDF dihasilkan secara otomatis sesuai template LPPM NF.</li>
          <li className="mb-2">Pastikan semua data sudah benar sebelum diajukan ke sistem.</li>
          <li>Anda masih dapat kembali ke langkah sebelumnya untuk melakukan koreksi.</li>
        </ul>
      </div>
    </div>
  );
};

export default SelesaiStep;
