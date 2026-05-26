import '../../styles/research/ResearchInfoCard.css';

function getStatusClass(status = "") {
  const s = status.toLowerCase();
  if (s === "lengkap" || s === "selesai") return "selesai";
  return "draft";
}

const ResearchInfoCard = ({ research }) => {
  if (!research) return null;

  return (
    <div className="detail-info-card">
      <div className="detail-meta">
        <div className="detail-meta-item">
          <span className="meta-label text-muted small me-2">Tahun:</span>
          <span className="detail-year-badge">{research.tahun}</span>
        </div>
        <div className="detail-meta-divider"></div>
        <div className="detail-meta-item">
          <span className="meta-label text-muted small me-2">Status Penelitian:</span>
          <span className={`detail-status-badge ${getStatusClass(research.status)}`}>
            {research.status || "Aktif"}
          </span>
        </div>
      </div>
      <h1 className="detail-title">{research.nama}</h1>
    </div>
  );
};

export default ResearchInfoCard;

