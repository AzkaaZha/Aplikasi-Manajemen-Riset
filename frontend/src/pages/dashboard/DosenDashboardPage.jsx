import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useResearchData } from '../../hooks/useResearchData';
import '../../styles/dashboard/DosenDashboardPage.css';

const NewUserDashboard = () => {
  const navigate = useNavigate();
  const workflow = [
    { number: 1, label: 'Proposal' },
    { number: 2, label: 'Kemajuan' },
    { number: 3, label: 'Akhir' },
    { number: 4, label: 'Export PDF' },
  ];

  return (
    <>
      {}
      <div className="welcome-section">
        <div className="welcome-section-content">
          <h1>Selamat Datang di SIMR STT NF 👋</h1>
          <p>Sistem Informasi Manajemen Riset untuk membantu pengelolaan penelitian, monitoring progres, dan aktivitas riset secara lebih terstruktur.</p>
          <div className="welcome-actions">
            <button className="welcome-btn welcome-btn-primary" onClick={() => navigate('/penelitian')}>
              Mulai Kelola Penelitian
            </button>
          </div>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-placeholder">📁</div>
          <div className="illustration-text">
            <h3>Belum ada penelitian yang dibuat</h3>
            <p>Mulai kelola penelitian pertama Anda untuk memonitor progres secara terstruktur.</p>
          </div>
        </div>
      </div>

      {}
      <div className="workflow-section">
        <h2 className="workflow-title">Alur Penelitian</h2>
        <p className="workflow-subtitle">Pahami langkah penting dalam mengelola penelitian Anda dari awal hingga akhir.</p>
        <div className="workflow-steps">
          {workflow.map((step) => (
            <div key={step.number} className="workflow-step">
              <div className="workflow-step-circle">{step.number}</div>
              <span className="workflow-step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const ResearchDashboard = ({ researches }) => {
  const navigate = useNavigate();

  
  const totalResearches = researches.length;
  const completedResearches = researches.filter(r => r.status === 'Lengkap').length;
  const activeResearches = totalResearches - completedResearches;

  const summaryData = [
    { icon: 'bi-journal-bookmark', label: 'Total Penelitian', value: totalResearches, accent: 'primary' },
    { icon: 'bi-file-earmark', label: 'Penelitian Aktif', value: activeResearches, accent: 'success' },
    { icon: 'bi-check-circle', label: 'Penelitian Selesai', value: completedResearches, accent: 'info' },
  ];

  
  const getResearchProgressInfo = (r) => {
    if (r.laporan_akhir?.status_dokumen?.toLowerCase() === 'lengkap' || r.laporan_akhir?.status?.toLowerCase() === 'lengkap') {
      return { stage: 'selesai', progress: 100, label: 'Selesai' };
    }
    if (r.laporan_kemajuan?.status_dokumen?.toLowerCase() === 'lengkap' || r.laporan_kemajuan?.status?.toLowerCase() === 'lengkap') {
      return { stage: 'akhir', progress: 75, label: 'Laporan Akhir' };
    }
    if (r.proposal?.status_dokumen?.toLowerCase() === 'lengkap' || r.proposal?.status?.toLowerCase() === 'lengkap') {
      return { stage: 'kemajuan', progress: 50, label: 'Laporan Kemajuan' };
    }
    return { stage: 'proposal', progress: 25, label: 'Proposal' };
  };

  return (
    <>
      {}
      <div className="summary-grid">
        {summaryData.map((item) => (
          <div key={item.label} className="summary-card">
            <div>
              <div className={`summary-card-icon ${item.accent}`}>
                <i className={`bi ${item.icon}`}></i>
              </div>
              <p className="summary-card-label">{item.label}</p>
              <p className="summary-card-value">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {}
      <div style={{ marginBottom: '28px' }}>
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Penelitian Terbaru</h2>
          <p className="dashboard-section-subtitle">Akses cepat ke penelitian terbaru Anda. Klik "Lanjutkan" untuk mengelola dokumen riset.</p>
        </div>
        <div className="research-cards-grid">
          {researches.slice(0, 3).map((research) => {
            const info = getResearchProgressInfo(research);
            const dateStr = research.proposal?.created_at
              ? new Date(research.proposal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : '-';

            return (
              <div key={research.id} className="research-card-grid-item">
                <div className="research-card-grid-header">
                  <div className="research-card-star-icon" title="Penelitian Aktif">
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <span className={`research-card-stage ${info.stage}`}>
                    {info.label}
                  </span>
                </div>
                <h3 className="research-card-grid-title" title={research.nama}>{research.nama}</h3>
                <div className="research-card-grid-meta">
                  <div className="meta-info">
                    <i className="bi bi-calendar3 me-1"></i>
                    <span>Tahun: {research.tahun || '-'}</span>
                  </div>
                  <button className="research-card-action" onClick={() => navigate(`/penelitian/${research.id}`)}>
                    Lanjutkan <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const DosenDashboardPage = () => {
  const { researches, loading } = useResearchData();

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Memuat data dashboard...</p>
          </div>
        ) : researches && researches.length > 0 ? (
          <ResearchDashboard researches={researches} />
        ) : (
          <NewUserDashboard />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DosenDashboardPage;
