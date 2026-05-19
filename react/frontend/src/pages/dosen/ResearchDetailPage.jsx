import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getResearchDetail } from "../../api/documentApi";

import ResearchDetailHeader from "../../components/research/ResearchDetailHeader";
import ResearchInfoCard from "../../components/research/ResearchInfoCard";
import ResearchDocumentsSection from "../../components/research/ResearchDocumentsSection";

import "../../styles/research/ResearchDetailPage.css";

function ResearchDetailPage() {
  const { id } = useParams(); // id di URL = penelitian_id

  const [research, setResearch]   = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      console.log(`[ResearchDetailPage] Membuka detail penelitian_id=${id}`);

      try {
        const data = await getResearchDetail(id);
        console.log(`[ResearchDetailPage] Data dari backend:`, data);

        if (!data || !data.research) {
          setNotFound(true);
        } else {
          const res = data.research;
          const status = (res.status_penelitian || "").toLowerCase() === "selesai" ? "Lengkap" : "Draft";

          setResearch({
            ...res,
            penelitian_id: res.id,  // alias eksplisit
            nama: res.judul_penelitian,
            status: status,
            tahun: res.tahun
          });
          setDocuments(data.documents);
          console.log(`[ResearchDetailPage] penelitian_id=${res.id} | dokumen:`, data.documents);
        }

      } catch (err) {
        console.error("[ResearchDetailPage] Gagal memuat data:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  // ── Loading State ───────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="detail-container">
          <div className="detail-loading">
            <div className="spinner-border text-primary" role="status"></div>
            <p>Memuat data penelitian...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────
  if (notFound || !research) {
    return (
      <DashboardLayout>
        <div className="detail-container">
          <ResearchDetailHeader />
          <div className="detail-not-found empty-state">
            <i className="bi bi-exclamation-circle empty-state-icon"></i>
            <p className="empty-state-text">
              Penelitian tidak ditemukan.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main Render ──────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="detail-container">
        <ResearchDetailHeader />
        <ResearchInfoCard research={research} />
        <ResearchDocumentsSection documents={documents} researchId={id} />
      </div>
    </DashboardLayout>
  );
}

export default ResearchDetailPage;
