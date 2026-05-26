import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useResearchData } from "../../hooks/useResearchData";

import ResearchFilters from "../../components/research/ResearchFilters";
import ResearchTable from "../../components/research/ResearchTable";
import ResearchFormModal from "../../components/research/ResearchFormModal";
import DeleteResearchModal from "../../components/research/DeleteResearchModal";

function ResearchPage() {
  const {
    researches,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    yearSort,
    setYearSort,
    addResearch,
    editResearch,
    removeResearch,
  } = useResearchData();

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    nama: "",
    tahun: new Date().getFullYear().toString(),
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedResearch(null);
    setErrorMessage("");
    setForm({
      nama: "",
      tahun: new Date().getFullYear().toString(),
    });
    setShowModal(true);
  };

  const openEditModal = (research) => {
    setIsEditMode(true);
    setSelectedResearch(research);
    setErrorMessage("");
    setForm({
      nama: research.nama,
      tahun: research.tahun,
    });
    setShowModal(true);
    setActiveDropdownId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (isEditMode) {
        
        const penelitianId = selectedResearch?.penelitian_id || selectedResearch?.id;
        console.log('[handleSubmit] Edit penelitian ID:', penelitianId, '| Data:', form);
        await editResearch(penelitianId, form);
      } else {
        await addResearch(form);
      }

      setShowModal(false);
      setSelectedResearch(null);
      setForm({
        nama: "",
        tahun: new Date().getFullYear().toString(),
      });
    } catch (err) {
      console.error("Gagal menyimpan penelitian:", err);

      setErrorMessage(
        isEditMode
          ? "Gagal memperbarui penelitian."
          : "Gagal menambahkan penelitian."
      );
    }
  };


  const handleDeleteResearch = async () => {
    
    const penelitianId = selectedResearch?.penelitian_id || selectedResearch?.researchId;

    console.log('[handleDeleteResearch] selectedResearch lengkap:', selectedResearch);
    console.log('[handleDeleteResearch] penelitian_id yang akan dikirim:', penelitianId);
    console.log(`[handleDeleteResearch] Request: DELETE /researches/${penelitianId}`);

    if (!selectedResearch || !penelitianId) {
      console.error('[handleDeleteResearch] ERROR: penelitian_id tidak ditemukan!', selectedResearch);
      setErrorMessage("ID Penelitian tidak ditemukan.");
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await removeResearch(penelitianId);
      setShowDeleteModal(false);
      setSelectedResearch(null);
    } catch (err) {
      console.error('[handleDeleteResearch] Response Error Backend:', err.response?.data || err);
      const msg = err.response?.data?.detail || "Gagal menghapus penelitian.";
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const cleanText = (html = "") => {
    return String(html)
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ");
  };

  return (
    <DashboardLayout>
      <div className="research-container">
        {errorMessage && (
          <div className="research-error-message">
            {errorMessage}
          </div>
        )}

        <div className="research-header">
          <div className="research-title-group">
            <h1>Daftar Penelitian</h1>
            <p className="research-subtitle">
              Kelola dan pantau seluruh data penelitian Anda.
            </p>
          </div>

          <button className="btn-add-research" onClick={openAddModal}>
            <i className="bi bi-plus-lg"></i>
            Tambah Penelitian
          </button>
        </div>

        <div className="research-card-wrapper">
          <ResearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            yearSort={yearSort}
            setYearSort={setYearSort}
          />

          <ResearchTable
            researches={researches}
            loading={loading}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            dropdownRef={dropdownRef}
            openEditModal={openEditModal}
            openDeleteModal={(item) => {
              setSelectedResearch(item);
              setShowDeleteModal(true);
              setActiveDropdownId(null);
              setErrorMessage("");
            }}
            cleanText={cleanText}
          />
        </div>

        <ResearchFormModal
          show={showModal}
          isEditMode={isEditMode}
          form={form}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setSelectedResearch(null);
            setErrorMessage("");
          }}
        />


        <DeleteResearchModal
          show={showDeleteModal}
          research={selectedResearch}
          isDeleting={isDeleting}
          errorMessage={errorMessage}
          onConfirm={handleDeleteResearch}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedResearch(null);
            setErrorMessage("");
          }}
        />
      </div>
    </DashboardLayout>
  );
}

export default ResearchPage;