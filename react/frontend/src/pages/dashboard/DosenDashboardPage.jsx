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
      {/* Welcome Section */}
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

      {/* Workflow Section */}
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

  // Hitung Summary Berdasarkan Real Data (otomatis dari backend via hook)
  const totalResearches = researches.length;
  const completedResearches = researches.filter(r => r.status === 'Lengkap').length;
  const activeResearches = totalResearches - completedResearches;
  const draftProposals = researches.filter(r => r.status === 'Draft').length;

  const summaryData = [
    { icon: 'bi-journal-bookmark', label: 'Total Penelitian', value: totalResearches, accent: 'primary' },
    { icon: 'bi-file-earmark', label: 'Penelitian Aktif', value: activeResearches, accent: 'success' },
    { icon: 'bi-check-circle', label: 'Penelitian Selesai', value: completedResearches, accent: 'info' },
    { icon: 'bi-file-earmark-text', label: 'Draft Proposal', value: draftProposals, accent: 'warning' },
  ];

  // Helper untuk menentukan tahapan saat ini (Proposal / Kemajuan / Akhir / Selesai)
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
      {/* Summary Cards */}
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

      {/* Main Research Section */}
      <div style={{ marginBottom: '28px' }}>
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Penelitian Sedang Berjalan</h2>
          <p className="dashboard-section-subtitle">Kelola dan monitor penelitian aktif Anda. Klik "Lanjutkan" untuk melanjutkan pekerjaan.</p>
        </div>
        <div className="research-cards-container">
          {researches.map((research) => {
            const info = getResearchProgressInfo(research);
            const dateStr = research.proposal?.created_at 
                ? new Date(research.proposal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : '-';

            return (
              <div key={research.id} className="research-card">
                <div className="research-card-header">
                  <h3 className="research-card-title">{research.nama}</h3>
                  <span className={`research-card-stage ${info.stage}`}>
                    {info.label}
                  </span>
                </div>
                <div className="research-progress-section">
                  <div className="research-progress-label">
                    <span>Progress</span>
                    <span className="research-progress-percent">{info.progress}%</span>
                  </div>
                  <div className="research-progress-bar">
                    <div className="research-progress-fill" style={{ width: `${info.progress}%` }}></div>
                  </div>
                </div>
                <div className="research-card-meta">
                  <span>Dibuat: {dateStr}</span>
                  <button className="research-card-action" onClick={() => navigate(`/penelitian/${research.id}`)}>
                    Lanjutkan
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
