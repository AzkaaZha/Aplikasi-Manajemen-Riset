import ResearchDocumentCard from './ResearchDocumentCard';
import '../../styles/research/ResearchDocumentsSection.css';

const ResearchDocumentsSection = ({ documents, researchId }) => {
  const isDocCompleted = (doc) => {
    if (!doc) return false;
    const status = (doc.status_dokumen || doc.status || "").toLowerCase();
    return status === "lengkap" || status === "generated";
  };

  const proposalCompleted = isDocCompleted(documents?.proposal);
  const kemajuanCompleted = isDocCompleted(documents?.laporan_kemajuan);

  return (
    <>
      <div className="detail-section-heading">
        <i className="bi bi-folder2"></i>
        Dokumen Riset
      </div>

      <div className="doc-cards-grid">
        <ResearchDocumentCard
          label="Proposal"
          icon="bi-file-earmark-text"
          dokumen={documents?.proposal}
          type="proposal"
          researchId={researchId}
        />
        <ResearchDocumentCard
          label="Laporan Kemajuan"
          icon="bi-file-earmark-bar-graph"
          dokumen={documents?.laporan_kemajuan}
          type="kemajuan"
          researchId={researchId}
          isDisabled={!proposalCompleted}
          disabledMessage="Selesaikan Proposal terlebih dahulu"
        />
        <ResearchDocumentCard
          label="Laporan Akhir"
          icon="bi-file-earmark-check"
          dokumen={documents?.laporan_akhir}
          type="akhir"
          researchId={researchId}
          isDisabled={!kemajuanCompleted}
          disabledMessage="Selesaikan Laporan Kemajuan terlebih dahulu"
        />
      </div>
    </>
  );
};

export default ResearchDocumentsSection;

