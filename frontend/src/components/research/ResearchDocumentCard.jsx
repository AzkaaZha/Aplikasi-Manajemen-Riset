import { Link, useNavigate } from 'react-router-dom';
import { createProgressReportByResearch, createFinalReportByResearch } from '../../api/researchApi';
import '../../styles/research/ResearchDocumentCard.css';

function getDocStatusClass(status = "") {
  const s = status ? status.toLowerCase() : "";
  if (s === "lengkap") return "selesai";
  if (s === "generated") return "selesai";
  if (s === "draft")  return "proses";
  return "belum";
}

function getDocStatusLabel(status = "") {
  const s = status ? status.toLowerCase() : "";
  if (s === "lengkap") return "Lengkap";
  if (s === "generated") return "Selesai (PDF)";
  if (s === "draft")  return "Draft";
  return "Belum Dibuat";
}

const typeToJenisDokumenId = {
  proposal: 1,
  kemajuan: 2,
  akhir: 3
};

const ResearchDocumentCard = ({ label, icon, dokumen, type, researchId, isDisabled, disabledMessage }) => {
  const navigate = useNavigate();
  const isCreated = !!dokumen?.id;
  const jenisDokumenId = typeToJenisDokumenId[type] || 1;

  const handleCreate = () => {
    if (isDisabled) return;
    console.log(`[ResearchDocumentCard] handleCreate type=${type} (jenisDokumenId=${jenisDokumenId}) researchId=${researchId}`);
    navigate(`/researches/${researchId}/documents/create/${jenisDokumenId}`);
  };

  const isDraft = dokumen?.status?.toUpperCase() === 'DRAFT' || dokumen?.status_dokumen?.toUpperCase() === 'DRAFT';
  const hasData = !!dokumen?.terakhir_autosave;

  const renderDocumentButton = () => {
    if (isDisabled && !isCreated) {
      return (
        <button
          className="btn-doc-action disabled"
          disabled
          title={disabledMessage}
        >
          <i className="bi bi-lock-fill"></i> Terkunci
        </button>
      );
    }

    if (!isCreated || (isCreated && !hasData)) {
      return !isCreated ? (
        <button onClick={handleCreate} className="btn-doc-action buat">
          <i className="bi bi-plus-circle"></i> Buat Dokumen
        </button>
      ) : (
        <Link to={`/researches/${researchId}/documents/${dokumen.id}/edit`} className="btn-doc-action buat">
          <i className="bi bi-plus-circle"></i> Buat Dokumen
        </Link>
      );
    }

    return (
      <Link to={`/researches/${researchId}/documents/${dokumen.id}/edit`} className="btn-doc-action buka">
        <i className="bi bi-folder2-open"></i> Buka Dokumen
      </Link>
    );
  };

  return (
    <div className="doc-card">
      <div className="doc-card-top">
        <div className="doc-card-icon">
          <i className={`bi ${icon}`}></i>
        </div>

        <div className="doc-card-label">{label}</div>

        <span className={`doc-card-status ${getDocStatusClass(isCreated ? (dokumen.status_dokumen || dokumen.status) : "")}`}>
          <i className="bi bi-circle-fill" style={{ fontSize: "7px" }}></i>
          {isCreated ? getDocStatusLabel(dokumen.status_dokumen || dokumen.status) : "Belum Dibuat"}
        </span>
      </div>

      <div className="doc-card-footer">
        {renderDocumentButton()}
      </div>
    </div>
  );
};

export default ResearchDocumentCard;
