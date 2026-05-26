import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  createNestedDocument,
  getNestedDocumentFullDetail,
  updateNestedDocument,
  getActiveTemplateFields,
  getDocumentPreview,
  saveDocumentContents, 
  updateDocument, 
  exportToPdf,
  getDocumentFiles,
  checkDocumentStatus,
  getResearchDetail
} from "../../api/documentApi";

// STEPS
import SubstansiStep from "../../components/documents/steps/proposal/SubstansiStep";
import PengusulStep from "../../components/documents/steps/proposal/PengusulStep";
import MitraStep from "../../components/documents/steps/proposal/MitraStep";
import JadwalStep from "../../components/documents/steps/proposal/JadwalStep";
import AnggaranStep from "../../components/documents/steps/proposal/AnggaranStep";
import LuaranStep from "../../components/documents/steps/proposal/LuaranStep";
import ProposalLampiranStep from "../../components/documents/steps/proposal/ProposalLampiranStep";
import SelesaiStep from "../../components/documents/steps/proposal/SelesaiStep";
import ProgressIdentitasStep from "../../components/documents/steps/progress/ProgressIdentitasStep";
import ProgressHasilStep from "../../components/documents/steps/progress/ProgressHasilStep";
import ProgressPengusulStep from "../../components/documents/steps/progress/ProgressPengusulStep";
import ProgressMitraStep from "../../components/documents/steps/progress/ProgressMitraStep";
import ProgressLuaranStep from "../../components/documents/steps/progress/ProgressLuaranStep";
import ProgressLampiranStep from "../../components/documents/steps/progress/ProgressLampiranStep";
import ProgressSelesaiStep from "../../components/documents/steps/progress/ProgressSelesaiStep";
import FinalIdentitasStep from "../../components/documents/steps/final/FinalIdentitasStep";
import FinalPengusulStep from "../../components/documents/steps/final/FinalPengusulStep";
import FinalMitraStep from "../../components/documents/steps/final/FinalMitraStep";
import FinalLuaranStep from "../../components/documents/steps/final/FinalLuaranStep";
import FinalHasilStep from "../../components/documents/steps/final/FinalHasilStep";
import FinalJadwalStep from "../../components/documents/steps/final/FinalJadwalStep";
import FinalAnggaranStep from "../../components/documents/steps/final/FinalAnggaranStep";
import FinalLampiranStep from "../../components/documents/steps/final/FinalLampiranStep";
import FinalSelesaiStep from "../../components/documents/steps/final/FinalSelesaiStep";
import AiAssistantPage from "../ai/AiAssistantPage";

// STYLES
import "../../styles/documents/document-editor.css";
import "../../styles/documents/document-stepper.css";
import "../../styles/documents/document-navigation.css";
import "../../styles/documents/document-form.css";
import "../../styles/documents/document-table.css";
import "../../styles/research/ResearchDetailHeader.css";

const getDocumentTypeFromId = (id) => {
  const numId = Number(id);
  if (numId === 1) return "proposal";
  if (numId === 2) return "kemajuan";
  if (numId === 3) return "akhir";
  return "proposal";
};

const DocumentEditorPage = () => {
  const navigate = useNavigate();
  const { researchId, documentId, jenisDokumenId } = useParams();
  const isCreateMode = !documentId;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [fieldMapping, setFieldMapping] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showBackButton, setShowBackButton] = useState(true);
  const lastScrollY = useRef(0);

  const [docType, setDocType] = useState(null);

  const progressSteps = [
    { id: 1, label: "Identitas" },
    { id: 2, label: "Hasil Penelitian" },
    { id: 3, label: "Pengusul" },
    { id: 4, label: "Mitra" },
    { id: 5, label: "Luaran" },
    { id: 6, label: "Selesai" },
  ];

  const finalSteps = [
    { id: 1, label: "Identitas" },
    { id: 2, label: "Pengusul" },
    { id: 3, label: "Mitra" },
    { id: 4, label: "Luaran" },
    { id: 5, label: "Hasil" },
    { id: 6, label: "Jadwal" },
    { id: 7, label: "Anggaran" },
    { id: 8, label: "Selesai" },
  ];

  const proposalSteps = [
    { id: 1, label: "Data Inti" },
    { id: 2, label: "Pengusul" },
    { id: 3, label: "Mitra" },
    { id: 4, label: "Jadwal" },
    { id: 5, label: "Anggaran" },
    { id: 6, label: "Luaran" },
    { id: 7, label: "Selesai" },
  ];

  const steps = docType === "kemajuan" ? progressSteps : docType === "akhir" ? finalSteps : proposalSteps;

  const activeDocumentId = documentId || formData?.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        if (isCreateMode) {
          console.log(`DEBUG: Mode CREATE untuk researchId: ${researchId}, jenisDokumenId: ${jenisDokumenId}`);
          
          const jenisDokId = Number(jenisDokumenId);
          const mappedType = getDocumentTypeFromId(jenisDokId);
          setDocType(mappedType);

          const templateData = await getActiveTemplateFields(jenisDokId);
          console.log("DEBUG: Active Template Data:", templateData);

          const researchDetail = await getResearchDetail(researchId);
          console.log("DEBUG: Research Detail:", researchDetail);

          const defaultTitle = `${mappedType === "proposal" ? "Proposal" : mappedType === "kemajuan" ? "Laporan Kemajuan" : "Laporan Akhir"} - ${researchDetail.research?.judul_penelitian || ""}`;

          const mapping = {};
          const flatData = {
            judul_dokumen: defaultTitle,
            penelitian_id: Number(researchId),
            template_id: templateData.template_id,
            jenis_dokumen_id: jenisDokId,
            pengusul: [],
            mitra: [],
            luaran: [],
            jadwal: [],
            anggaran: [],
            lampiranFiles: []
          };

          templateData.fields?.forEach(f => {
            mapping[f.nama_field] = f.template_field_id;
            flatData[f.nama_field] = f.nama_field === "hasil_penelitian_pilihan" ? [] : "";
          });

          // Fallback data pengusul/mitra/identitas dari proposal jika ada
          if (jenisDokId > 1 && researchDetail.documents) {
            const proposal = researchDetail.documents.proposal;
            if (proposal) {
              try {
                const proposalRes = await getNestedDocumentFullDetail(researchId, proposal.id);
                console.log("DEBUG: Response Proposal (fallback source):", proposalRes);
                
                const getProposalFieldVal = (name) => {
                  const f = proposalRes.fields?.find(field => field.nama_field === name);
                  return f ? f.isi : "";
                };

                // Identitas Fields
                flatData.judul_penelitian = researchDetail.research?.judul_penelitian || proposalRes.judul || "";
                flatData.bidang_fokus_rirn = getProposalFieldVal("bidang_fokus_rirn") || "";
                flatData.tema_penelitian = getProposalFieldVal("tema_penelitian") || "";
                flatData.topik_penelitian = getProposalFieldVal("topik_penelitian") || "";
                flatData.rumpun_bidang_ilmu = getProposalFieldVal("rumpun_bidang_ilmu") || "";
                flatData.target_akhir_tkt = getProposalFieldVal("target_akhir_tkt") || "";
                flatData.lama_penelitian = getProposalFieldVal("lama_penelitian") || "";
                flatData.kata_kunci = getProposalFieldVal("kata_kunci") || "";

                // Pre-fill manual field dana_penelitian from budget sum
                if (proposalRes.budgets && proposalRes.budgets.length > 0) {
                  const totalBudget = proposalRes.budgets.reduce((sum, b) => sum + Number(b.total || 0), 0);
                  flatData.dana_penelitian = totalBudget;
                } else {
                  flatData.dana_penelitian = "";
                }

                // Copy matching fields
                templateData.fields?.forEach(f => {
                  const val = getProposalFieldVal(f.nama_field);
                  if (val) {
                    if (f.nama_field === "hasil_penelitian_pilihan") {
                      flatData[f.nama_field] = val.split(",").map(s => s.trim()).filter(Boolean);
                    } else {
                      flatData[f.nama_field] = val;
                    }
                  }
                });

                // Manual mapping rule 7: Proposal's metode_penelitian -> Laporan Akhir's metode
                if (mapping["metode"] && !flatData["metode"]) {
                  flatData["metode"] = getProposalFieldVal("metode_penelitian") || getProposalFieldVal("metode");
                }

                // Copy sub-tables
                flatData.pengusul = proposalRes.researchers || [];
                flatData.mitra = proposalRes.partners || [];
                flatData.luaran = proposalRes.outputs || [];
                flatData.jadwal = proposalRes.schedules || [];
                flatData.anggaran = proposalRes.budgets || [];

              } catch (e) {
                console.error("DEBUG: Gagal memuat data Proposal fallback", e);
              }
            }
          }

          setFieldMapping(mapping);
          setFormData(flatData);

        } else {
          console.log(`DEBUG: Mode EDIT untuk researchId: ${researchId}, documentId: ${documentId}`);
          
          const res = await getNestedDocumentFullDetail(researchId, documentId);
          const filesRes = await getDocumentFiles(documentId);
          
          console.log("DEBUG: Response Laporan:", res);
          const mappedType = getDocumentTypeFromId(res.jenis_dokumen_id);
          setDocType(mappedType);

          const proposalId = res.parent_dokumen_id || (res.jenis_dokumen_id === 1 ? res.id : null);
          
          let proposalRes = null;
          if (proposalId && proposalId !== res.id) {
            try {
              console.log("DEBUG: Memuat data Proposal fallback ID:", proposalId);
              proposalRes = await getNestedDocumentFullDetail(researchId, proposalId);
              console.log("DEBUG: Response Proposal:", proposalRes);
            } catch (e) {
              console.error("DEBUG: Gagal memuat data Proposal sebagai fallback", e);
            }
          }

          // Fallback lookup via getResearchDetail just in case parent_dokumen_id is empty but it's nested
          if (!proposalRes && res.jenis_dokumen_id > 1) {
            try {
              const researchDetail = await getResearchDetail(researchId);
              const proposal = researchDetail.documents?.proposal;
              if (proposal) {
                console.log("DEBUG: Memuat data Proposal fallback di Edit mode via researchDetail ID:", proposal.id);
                proposalRes = await getNestedDocumentFullDetail(researchId, proposal.id);
              }
            } catch (e) {
              console.error("DEBUG: Gagal memuat data Proposal fallback di Edit mode", e);
            }
          }

          const mapFields = (targetDoc, sourceDoc = null) => {
            const mapping = {};
            const flatData = {
              judul_dokumen: targetDoc.judul,
              penelitian_id: targetDoc.penelitian_id,
              parent_dokumen_id: targetDoc.parent_dokumen_id,
              ...targetDoc 
            };
            
            targetDoc.fields?.forEach(f => {
              mapping[f.nama_field] = f.template_field_id;
              if (f.nama_field === "hasil_penelitian_pilihan") {
                flatData[f.nama_field] = f.isi ? f.isi.split(",").map(s => s.trim()).filter(Boolean) : [];
              } else {
                flatData[f.nama_field] = f.isi;
              }
            });

            if (sourceDoc) {
              sourceDoc.fields?.forEach(f => {
                const currentVal = flatData[f.nama_field];
                const isEmpty = currentVal === undefined || currentVal === null || currentVal === "" || currentVal === "<p><br></p>";
                
                if (isEmpty) {
                  if (f.nama_field === "hasil_penelitian_pilihan") {
                    flatData[f.nama_field] = f.isi ? f.isi.split(",").map(s => s.trim()).filter(Boolean) : [];
                  } else {
                    flatData[f.nama_field] = f.isi;
                  }
                  console.log(`DEBUG: Menggunakan fallback Proposal untuk field [${f.nama_field}]`);
                }
              });
            }

            return { mapping, flatData };
          };

          const { mapping, flatData } = mapFields(res, proposalRes);
          
          flatData.pengusul = res.researchers?.length > 0 ? res.researchers : (proposalRes?.researchers || []);
          flatData.mitra = res.partners?.length > 0 ? res.partners : (proposalRes?.partners || []);
          flatData.luaran = res.outputs?.length > 0 ? res.outputs : (proposalRes?.outputs || []);
          flatData.jadwal = res.schedules?.length > 0 ? res.schedules : (proposalRes?.schedules || []);
          flatData.anggaran = res.budgets?.length > 0 ? res.budgets : (proposalRes?.budgets || []);
          flatData.lampiranFiles = filesRes || [];

          // Load Identitas Fields from Proposal (for laporan kemajuan/akhir fallback only)
          if (proposalRes) {
            const getProposalFieldVal = (name) => {
              const f = proposalRes.fields?.find(field => field.nama_field === name);
              return f ? f.isi : "";
            };

            // Only fill from proposal if NOT already populated from the doc's own saved data
            if (!flatData.judul_penelitian) flatData.judul_penelitian = getProposalFieldVal("judul_penelitian") || proposalRes.judul || "";
            if (!flatData.bidang_fokus_rirn) flatData.bidang_fokus_rirn = getProposalFieldVal("bidang_fokus_rirn") || "";
            if (!flatData.tema_penelitian) flatData.tema_penelitian = getProposalFieldVal("tema_penelitian") || "";
            if (!flatData.topik_penelitian) flatData.topik_penelitian = getProposalFieldVal("topik_penelitian") || "";
            if (!flatData.rumpun_bidang_ilmu) flatData.rumpun_bidang_ilmu = getProposalFieldVal("rumpun_bidang_ilmu") || "";
            if (!flatData.target_akhir_tkt) flatData.target_akhir_tkt = getProposalFieldVal("target_akhir_tkt") || "";
            if (!flatData.lama_penelitian) flatData.lama_penelitian = getProposalFieldVal("lama_penelitian") || "";
            if (!flatData.kata_kunci) flatData.kata_kunci = getProposalFieldVal("kata_kunci") || "";

            // Populate dana_penelitian
            const targetDanaField = res.fields?.find(f => f.nama_field === "dana_penelitian");
            const targetDana = targetDanaField ? targetDanaField.isi : res.dana_penelitian;
            if (targetDana !== undefined && targetDana !== null && targetDana !== "") {
              flatData.dana_penelitian = targetDana;
            } else if (proposalRes.budgets && proposalRes.budgets.length > 0) {
              const totalBudget = proposalRes.budgets.reduce((sum, b) => sum + Number(b.total || 0), 0);
              flatData.dana_penelitian = totalBudget;
            } else {
              flatData.dana_penelitian = flatData.dana_penelitian || "";
            }
          }
          // NOTE: For proposal docs (jenis_dokumen_id=1), proposalRes is null — fields are already
          // loaded directly from the document's own DB records above via mapFields(). Do NOT overwrite them.

          // Merge research detail title just in case
          try {
            const researchDetail = await getResearchDetail(researchId);
            if (researchDetail?.research?.judul_penelitian) {
              flatData.judul_penelitian = researchDetail.research.judul_penelitian;
            }
          } catch (e) {
            console.error("Gagal memuat detail penelitian untuk judul_penelitian:", e);
          }

          console.log("DEBUG: Hasil mapping final ke form state:", flatData);

          setFieldMapping(mapping);
          setFormData(flatData);
        }
      } catch (err) {
        console.error("Gagal memuat dokumen:", err);
        setLoadError("Gagal memuat dokumen. Silakan periksa koneksi atau coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [researchId, documentId, jenisDokumenId]);

  useEffect(() => {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) return;

    // Scroll to top when component mounts or document changes
    contentArea.scrollTo({ top: 0, behavior: "smooth" });

    const handleScroll = () => {
      const currentScrollY = contentArea.scrollTop;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowBackButton(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowBackButton(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    contentArea.addEventListener("scroll", handleScroll);
    return () => contentArea.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? Array.from(files) : value,
    }));
  };

  const handleSave = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      // Ensure we have a title for the document payload
      let docTitle = formData.judul_dokumen || formData.judul_penelitian;
      if (!docTitle || docTitle === "-") {
        docTitle = "Dokumen Penelitian";
      }
      const items = Object.keys(fieldMapping).map((key) => ({
        template_field_id: fieldMapping[key],
        isi: Array.isArray(formData[key]) ? formData[key].join(", ") : formData[key],
      }));

      let activeDocId = activeDocumentId;

      if (isCreateMode && !formData.id) {
        console.log("DEBUG: Menjalankan penyimpanan pertama (CREATE mode)");
        
        const docPayload = {
          jenis_dokumen_id: Number(jenisDokumenId),
          template_id: formData.template_id,
          judul: docTitle
        };
        const newDoc = await createNestedDocument(researchId, docPayload);
        activeDocId = newDoc.id;
        console.log("DEBUG: Dokumen baru berhasil dibuat dengan ID:", activeDocId);

        if (items.length > 0) {
          await updateNestedDocument(researchId, activeDocId, {
            judul: docTitle,
            status_dokumen: "draft",
            items: items
          });
        }

        await checkDocumentStatus(activeDocId);

        const mappedType = docType || getDocumentTypeFromId(jenisDokumenId);
        navigate(`/researches/${researchId}/documents/${activeDocId}/edit`, { replace: true });
        
        setFormData(prev => ({
          ...prev,
          id: activeDocId,
          penelitian_id: Number(researchId)
        }));
      } else {
        console.log("DEBUG: Menjalankan update (EDIT mode) untuk ID:", activeDocId);
        await updateNestedDocument(researchId, activeDocId, {
          judul: docTitle,
          status_dokumen: "draft",
          items: items
        });

        await checkDocumentStatus(activeDocId);
      }

      return true;
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      if (!silent) alert(err.response?.data?.detail || "Gagal menyimpan data.");
      return false;
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const nextStep = async () => {
    const success = await handleSave(true);
    if (success && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      document.querySelector('.content-area')?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleExportPdf = async () => {
    if (!activeDocumentId) return;
    setPdfExporting(true);
    try {
      const blob = await exportToPdf(activeDocumentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().getTime();
      const filename = `${pageTitle.replace(/\s+/g, '_')}_${formData.judul_dokumen?.substring(0, 20).replace(/\s+/g, '_') || activeDocumentId}_${timestamp}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      const filesRes = await getDocumentFiles(activeDocumentId);
      setFormData(prev => ({ ...prev, lampiranFiles: filesRes }));
      
    } catch (err) {
      console.error("Gagal mengekspor PDF:", err);
      const message = err?.response?.data?.detail || err?.message || "Gagal mengekspor PDF";
      alert(message);
    } finally {
      setPdfExporting(false);
    }
  };

  if (loading) return <DashboardLayout><div className="p-5 text-center">Memuat editor...</div></DashboardLayout>;

  const renderProgressStep = () => {
    switch (currentStep) {
      case 1: return <ProgressIdentitasStep data={formData} onChange={handleInputChange} />;
      case 2: return <ProgressHasilStep data={formData} onChange={handleInputChange} />;
      case 3: return <ProgressPengusulStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, pengusul: res.researchers})))} />;
      case 4: return <ProgressMitraStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, mitra: res.partners})))} />;
      case 5: return <ProgressLuaranStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, luaran: res.outputs})))} />;
      case 6: return <ProgressSelesaiStep onExport={handleExportPdf} isExporting={pdfExporting} />;
      default: return null;
    }
  };

  const renderFinalStep = () => {
    switch (currentStep) {
      case 1: return <FinalIdentitasStep data={formData} onChange={handleInputChange} />;
      case 2: return <FinalPengusulStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, pengusul: res.researchers})))} />;
      case 3: return <FinalMitraStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, mitra: res.partners})))} />;
      case 4: return <FinalLuaranStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, luaran: res.outputs})))} />;
      case 5: return <FinalHasilStep data={formData} onChange={handleInputChange} />;
      case 6: return <FinalJadwalStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, jadwal: res.schedules})))} />;
      case 7: return <FinalAnggaranStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, anggaran: res.budgets})))} />;
      case 8: return <FinalSelesaiStep onExport={handleExportPdf} isExporting={pdfExporting} />;
      default: return null;
    }
  };

  const renderProposalStep = () => {
    switch (currentStep) {
      case 1: return <SubstansiStep data={formData} onChange={handleInputChange} />;
      case 2: return <PengusulStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, pengusul: res.researchers})))} />;
      case 3: return <MitraStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, mitra: res.partners})))} />;
      case 4: return <JadwalStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, jadwal: res.schedules})))} />;
      case 5: return <AnggaranStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, anggaran: res.budgets})))} />;
      case 6: return <LuaranStep data={formData} documentId={activeDocumentId} refreshData={() => getNestedDocumentFullDetail(researchId, activeDocumentId).then(res => setFormData(p => ({...p, luaran: res.outputs})))} />;
      case 7: return <SelesaiStep onExport={handleExportPdf} isExporting={pdfExporting} />;
      default: return null;
    }
  };

  const pageTitle = docType === "kemajuan" ? "Laporan Kemajuan" : docType === "akhir" ? "Laporan Akhir" : "Proposal";

  const navigateToResearchDetail = () => {
    const resId = researchId || formData?.penelitian_id || formData?.parent_dokumen_id;
    if (resId) {
      navigate(`/penelitian/${resId}`);
    } else {
      navigate('/penelitian');
    }
  };

  const handleSimpanKeluar = async () => {
    setSaving(true);
    try {
      const success = await handleSave(true);
      if (success) {
        navigateToResearchDetail();
      }
    } catch (err) {
      console.error("Gagal simpan & keluar:", err);
      alert("Gagal menyimpan data sebelum keluar.");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="p-5 text-center">
          <div className="text-danger mb-3">{loadError}</div>
          <button className="btn btn-secondary" onClick={navigateToResearchDetail}>
            Kembali ke Daftar Penelitian
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideFooter={true}>
      <div className={`editor-container ${isAssistantOpen ? "ai-open" : ""}`}>
        <div className={`sticky-back-header ${!showBackButton ? "hidden" : ""}`}>
          <button className="btn-back" onClick={navigateToResearchDetail}>
            <i className="bi bi-arrow-left"></i> Kembali ke Detail Penelitian
          </button>
        </div>

        <div className={`editor-content-wrapper ${showBackButton ? 'has-back' : ''}`}>
          <div className="editor-form-area">
            <div className="editor-page-heading d-flex justify-content-between align-items-center">
              <div>
                <h1 className="editor-page-title">Editor {pageTitle}</h1>
                <p className="editor-page-subtitle">{formData.judul_dokumen || "Memuat judul..."}</p>
              </div>
              {saving && <div className="badge bg-info">Menyimpan...</div>}
            </div>

            <div className="stepper-wrapper">
              <div className="stepper">
                {steps.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  return (
                    <div key={step.id} className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                      <div className="step-circle">{isCompleted ? <i className="bi bi-check"></i> : step.id}</div>
                      <div className="step-label">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="step-content">
              {docType === "kemajuan" ? renderProgressStep() : docType === "akhir" ? renderFinalStep() : renderProposalStep()}
            </div>

            <div className="editor-footer-nav">
              <div className="nav-buttons-left">
                {currentStep > 1 && (
                  <button className="btn-nav btn-prev" onClick={prevStep}>
                    <i className="bi bi-chevron-left"></i> Sebelumnya
                  </button>
                )}
                <button className="btn-nav btn-save" onClick={handleSimpanKeluar}>
                  Simpan & Keluar
                </button>
              </div>
              <div className="nav-buttons-right">
                {currentStep < steps.length && (
                  <button className="btn-nav btn-next" onClick={nextStep}>
                    Selanjutnya <i className="bi bi-chevron-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <button className="ai-floating-btn" onClick={() => setIsAssistantOpen(true)}>
          <i className="bi bi-robot"></i>
        </button>

        <AiAssistantPage 
          isOpen={isAssistantOpen} 
          onClose={() => setIsAssistantOpen(false)} 
          context={formData}
          documentType={docType || "proposal"}
        />
      </div>
    </DashboardLayout>
  );
};

export default DocumentEditorPage;

