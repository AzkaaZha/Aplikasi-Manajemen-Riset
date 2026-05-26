import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState, useRef } from "react";

function ResearchTable({
  researches,
  loading,
  activeDropdownId,
  setActiveDropdownId,
  dropdownRef,
  openEditModal,
  openDeleteModal,
  cleanText,
}) {
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const handleDropdownToggle = (e, itemId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setActiveDropdownId(activeDropdownId === itemId ? null : itemId);
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();
    if (normalizedStatus === "selesai" || normalizedStatus === "lengkap") return "Lengkap";
    return "Draft";
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    if (normalizedStatus === "selesai" || normalizedStatus === "lengkap") {
      return "lengkap";
    }

    return "draft";
  };

  if (loading) {
    return (
      <div className="research-loading">
        <div className="spinner-border text-primary" role="status"></div>
        <p>Memuat data penelitian...</p>
      </div>
    );
  }

  if (researches.length === 0) {
    return (
      <div className="research-loading empty-state">
        <i className="bi bi-inbox empty-state-icon"></i>
        <p className="empty-state-text">
          Tidak ada data penelitian ditemukan.
        </p>
      </div>
    );
  }

  return (
    <div className="research-table-container">
      <div className="table-responsive">
        <table className="research-table">
          <thead>
            <tr>
              <th className="row-no">No</th>
              <th>Judul Penelitian</th>
              <th>Tahun</th>
              <th>Status</th>
              <th className="action-cell">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {researches.map((item, index) => (
              <tr key={item.penelitian_id}>
                <td className="row-no">{index + 1}</td>

                <td className="row-title">
                  {cleanText(item.nama)}
                </td>

                <td className="row-year">
                  {item.tahun}
                </td>

                <td>
                  <span
                    className={`status-badge status-${getStatusClass(
                      item.status
                    )}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </td>

                <td className="action-cell">
                  <button
                    type="button"
                    className="btn-action-trigger"
                    onClick={(e) => handleDropdownToggle(e, item.penelitian_id)}
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>

                  {activeDropdownId === item.penelitian_id && createPortal(
                    <div 
                      className="action-dropdown-menu portal-dropdown" 
                      ref={dropdownRef}
                      style={{
                        position: 'absolute',
                        top: `${dropdownPos.top}px`,
                        left: `${dropdownPos.left - 160}px`,
                        zIndex: 9999,
                      }}
                    >
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => openEditModal(item)}
                      >
                        Edit Penelitian
                      </button>

                      <Link
                        to={`/penelitian/${item.penelitian_id}`}
                        className="dropdown-item"
                        onClick={() => setActiveDropdownId(null)}
                      >
                        Detail Penelitian
                      </Link>

                      <button
                        type="button"
                        className="dropdown-item text-danger"
                        onClick={() => openDeleteModal(item)}
                      >
                        Hapus Penelitian
                      </button>
                    </div>,
                    document.body
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResearchTable;