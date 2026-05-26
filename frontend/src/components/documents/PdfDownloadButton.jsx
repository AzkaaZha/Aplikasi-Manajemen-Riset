
const PdfDownloadButton = ({ label = "Ekspor PDF Resmi", className = "", onClick }) => {
  return (
    <button 
      className={`btn btn-success ${className}`} 
      style={{
        backgroundColor: 'var(--green)',
        borderColor: 'var(--green)',
        borderRadius: '12px',
        fontWeight: '600',
        padding: '10px 20px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onClick={onClick || (() => alert("Mengekspor dokumen ke PDF..."))}
    >
      <i className="bi bi-file-earmark-pdf"></i>
      {label}
    </button>
  );
};

export default PdfDownloadButton;

