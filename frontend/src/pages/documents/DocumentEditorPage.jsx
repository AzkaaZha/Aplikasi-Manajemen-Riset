import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  createNestedDocument,
  getNestedDocumentFullDetail,
  updateNestedDocument,
  getActiveTemplateFields,
  updateDocument,
  exportToPdf,
  getDocumentFiles,
  checkDocumentStatus,
  getResearchDetail,
  getDocumentFullDetail,
  getDocumentContents,
  getDocumentDetail,
  getDocumentFields,
} from "../../api/documentApi";

import SubstansiStep from "../../components/documents/steps/proposal/SubstansiStep";
import PengusulStep from "../../components/documents/steps/proposal/PengusulStep";
import MitraStep from "../../components/documents/steps/proposal/MitraStep";
import JadwalStep from "../../components/documents/steps/proposal/JadwalStep";
import AnggaranStep from "../../components/documents/steps/proposal/AnggaranStep";
import LuaranStep from "../../components/documents/steps/proposal/LuaranStep";
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

const getDocumentTypeFromDoc = (doc) => {
  const jenisId =
    doc?.jenis_dokumen_id ||
    doc?.jenisDokumenId ||
    doc?.template?.jenis_dokumen_id ||
    doc?.template_id;

  return getDocumentTypeFromId(jenisId);
};

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.fields)) return data.fields;
  if (Array.isArray(data?.contents)) return data.contents;
  if (Array.isArray(data?.files)) return data.files;
  return [];
};

const extractDocumentId = (data) => {
  return (
    data?.id ||
    data?.document_id ||
    data?.dokumen_id ||
    data?.document?.id ||
    data?.data?.id ||
    data?.data?.document_id ||
    null
  );
};

const normalizeDocumentResponse = (res) => {
  const doc = res?.data || res?.document || res || {};
  return {
    ...doc,
    fields: normalizeArray(doc.fields || res?.fields),
    researchers: normalizeArray(doc.researchers || doc.pengusul),
    partners: normalizeArray(doc.partners || doc.mitra),
    outputs: normalizeArray(doc.outputs || doc.luaran),
    schedules: normalizeArray(doc.schedules || doc.jadwal),
    budgets: normalizeArray(doc.budgets || doc.anggaran),
  };
};

const getFieldId = (field) => {
  return field?.template_field_id || field?.id || field?.field_id;
};

const getFieldName = (field) => {
  return field?.nama_field || field?.name || field?.field_name;
};

const getFieldValue = (field) => {
  return field?.isi ?? field?.value ?? field?.content ?? "";
};

const isEmptyValue = (value) => {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "<p><br></p>"
  );
};

const DocumentEditorPage = () => {
  const navigate = useNavigate();
  const params = useParams();

  const researchId =
    params.researchId || params.penelitianId || params.id || params.research_id;

  const documentId =
    params.documentId ||
    params.docId ||
    params.activeDocumentId ||
    params.document_id;

  const jenisDokumenId =
    params.jenisDokumenId ||
    params.jenis_dokumen_id ||
    params.templateId ||
    params.template_id;

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
  const [docType, setDocType] = useState(null);

  const lastScrollY = useRef(0);

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

  const steps =
    docType === "kemajuan"
      ? progressSteps
      : docType === "akhir"
        ? finalSteps
        : proposalSteps;

  const activeDocumentId = documentId || formData?.id || formData?.document_id;

  const fetchSafeDocumentFiles = async (docId) => {
    if (!docId) return [];

    try {
      const files = await getDocumentFiles(docId);
      return normalizeArray(files);
    } catch (fileErr) {
      console.warn(
        "DEBUG: Gagal fetch files/lampiran, editor tetap dilanjutkan:",
        fileErr?.response?.data || fileErr?.message
      );
      return [];
    }
  };

  const fetchDocumentDetailWithFallback = async (resId, docId) => {
    let res = null;

    try {
      res = await getNestedDocumentFullDetail(resId, docId);
      return normalizeDocumentResponse(res);
    } catch (nestedErr) {
      console.warn(
        "DEBUG: getNestedDocumentFullDetail gagal, fallback ke getDocumentFullDetail:",
        nestedErr?.response?.data || nestedErr?.message
      );
    }

    try {
      res = await getDocumentFullDetail(docId);
      return normalizeDocumentResponse(res);
    } catch (fullErr) {
      console.warn(
        "DEBUG: getDocumentFullDetail gagal, fallback ke getDocumentDetail:",
        fullErr?.response?.data || fullErr?.message
      );
    }

    res = await getDocumentDetail(docId);
    return normalizeDocumentResponse(res);
  };

  const mergeExplicitContentsToFields = async (docId, doc) => {
    let fields = normalizeArray(doc.fields);

    if (!fields.length) {
      try {
        const fieldsDef = await getDocumentFields(docId);
        fields = normalizeArray(fieldsDef);
      } catch (fieldErr) {
        console.warn(
          "DEBUG: Gagal fetch definisi field:",
          fieldErr?.response?.data || fieldErr?.message
        );
        fields = [];
      }
    }

    try {
      const contentsData = await getDocumentContents(docId);
      const contents = normalizeArray(contentsData);

      if (contents.length) {
        const contentMap = {};

        contents.forEach((content) => {
          const key =
            content?.template_field_id ||
            content?.field_id ||
            content?.id ||
            content?.templateFieldId;

          if (key) {
            contentMap[key] =
              content?.isi ?? content?.value ?? content?.content ?? "";
          }
        });

        fields = fields.map((field) => {
          const fieldId = getFieldId(field);
          return {
            ...field,
            isi: contentMap[fieldId] ?? getFieldValue(field),
          };
        });
      }
    } catch (contentErr) {
      console.warn(
        "DEBUG: Gagal fetch contents, gunakan fields dari detail dokumen:",
        contentErr?.response?.data || contentErr?.message
      );
    }

    return {
      ...doc,
      fields,
    };
  };

  const mapDocumentToFormData = (targetDoc, sourceDoc = null) => {
    const mapping = {};

    const flatData = {
      ...targetDoc,
      id: targetDoc.id || targetDoc.document_id || documentId,
      document_id: targetDoc.document_id || targetDoc.id || documentId,
      judul_dokumen: targetDoc.judul || targetDoc.judul_dokumen || "",
      penelitian_id: targetDoc.penelitian_id || targetDoc.research_id || researchId,
      parent_dokumen_id: targetDoc.parent_dokumen_id || null,
    };

    normalizeArray(targetDoc.fields).forEach((field) => {
      const name = getFieldName(field);
      const fieldId = getFieldId(field);
      const value = getFieldValue(field);

      if (!name || !fieldId) return;

      mapping[name] = fieldId;

      if (name === "hasil_penelitian_pilihan") {
        flatData[name] = value
          ? String(value)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : [];
      } else {
        flatData[name] = value;
      }
    });

    if (sourceDoc) {
      normalizeArray(sourceDoc.fields).forEach((field) => {
        const name = getFieldName(field);
        const value = getFieldValue(field);

        if (!name) return;

        const currentVal = flatData[name];

        if (isEmptyValue(currentVal)) {
          if (name === "hasil_penelitian_pilihan") {
            flatData[name] = value
              ? String(value)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
              : [];
          } else {
            flatData[name] = value;
          }
        }
      });
    }

    flatData.pengusul =
      targetDoc.researchers?.length > 0
        ? targetDoc.researchers
        : sourceDoc?.researchers || [];

    flatData.mitra =
      targetDoc.partners?.length > 0 ? targetDoc.partners : sourceDoc?.partners || [];

    flatData.luaran =
      targetDoc.outputs?.length > 0 ? targetDoc.outputs : sourceDoc?.outputs || [];

    flatData.jadwal =
      targetDoc.schedules?.length > 0
        ? targetDoc.schedules
        : sourceDoc?.schedules || [];

    flatData.anggaran =
      targetDoc.budgets?.length > 0 ? targetDoc.budgets : sourceDoc?.budgets || [];

    return { mapping, flatData };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        if (!researchId) {
          throw new Error("researchId tidak ditemukan dari route.");
        }

        if (isCreateMode) {
          if (!jenisDokumenId) {
            throw new Error("jenisDokumenId tidak ditemukan dari route create.");
          }

          console.log(
            `DEBUG: Mode CREATE researchId=${researchId}, jenisDokumenId=${jenisDokumenId}`
          );

          const jenisDokId = Number(jenisDokumenId);
          const mappedType = getDocumentTypeFromId(jenisDokId);
          setDocType(mappedType);

          const templateData = await getActiveTemplateFields(jenisDokId);
          const templateFields = normalizeArray(templateData?.fields || templateData);

          const researchDetail = await getResearchDetail(researchId);
          const research =
            researchDetail?.research || researchDetail?.data || researchDetail || {};

          const judulPenelitianParent =
            research?.judul_penelitian ||
            research?.nama_penelitian ||
            research?.title ||
            research?.judul ||
            "";

          const defaultTitle = `${mappedType === "proposal"
              ? "Proposal"
              : mappedType === "kemajuan"
                ? "Laporan Kemajuan"
                : "Laporan Akhir"
            } - ${judulPenelitianParent}`;

          const mapping = {};

          const flatData = {
            judul_dokumen: defaultTitle,
            judul_penelitian: judulPenelitianParent,
            penelitian_id: Number(researchId),
            template_id: templateData?.template_id || templateData?.id,
            jenis_dokumen_id: jenisDokId,
            pengusul: [],
            mitra: [],
            luaran: [],
            jadwal: [],
            anggaran: [],
            lampiranFiles: [],
          };

          templateFields.forEach((field) => {
            const name = getFieldName(field);
            const fieldId = getFieldId(field);

            if (!name || !fieldId) return;

            mapping[name] = fieldId;

            if (flatData[name] === undefined) {
              flatData[name] =
                name === "hasil_penelitian_pilihan" ? [] : "";
            }
          });

          if (jenisDokId > 1 && researchDetail?.documents) {
            const proposal = researchDetail.documents.proposal;

            if (proposal?.id) {
              try {
                const proposalDoc = await fetchDocumentDetailWithFallback(
                  researchId,
                  proposal.id
                );

                const getProposalFieldVal = (name) => {
                  const field = normalizeArray(proposalDoc.fields).find(
                    (f) => getFieldName(f) === name
                  );
                  return field ? getFieldValue(field) : "";
                };

                flatData.judul_penelitian =
                  judulPenelitianParent ||
                  getProposalFieldVal("judul_penelitian") ||
                  proposalDoc.judul ||
                  "";

                flatData.bidang_fokus_rirn =
                  getProposalFieldVal("bidang_fokus_rirn") || "";
                flatData.tema_penelitian =
                  getProposalFieldVal("tema_penelitian") || "";
                flatData.topik_penelitian =
                  getProposalFieldVal("topik_penelitian") || "";
                flatData.rumpun_bidang_ilmu =
                  getProposalFieldVal("rumpun_bidang_ilmu") || "";
                flatData.target_akhir_tkt =
                  getProposalFieldVal("target_akhir_tkt") || "";
                flatData.lama_penelitian =
                  getProposalFieldVal("lama_penelitian") || "";
                flatData.kata_kunci = getProposalFieldVal("kata_kunci") || "";

                if (proposalDoc.budgets?.length > 0) {
                  flatData.dana_penelitian = proposalDoc.budgets.reduce(
                    (sum, b) => sum + Number(b.total || 0),
                    0
                  );
                }

                flatData.pengusul = proposalDoc.researchers || [];
                flatData.mitra = proposalDoc.partners || [];
                flatData.luaran = proposalDoc.outputs || [];
                flatData.jadwal = proposalDoc.schedules || [];
                flatData.anggaran = proposalDoc.budgets || [];
              } catch (proposalErr) {
                console.warn(
                  "DEBUG: Gagal memuat fallback proposal:",
                  proposalErr?.response?.data || proposalErr?.message
                );
              }
            }
          }

          setFieldMapping(mapping);
          setFormData(flatData);
        } else {
          console.log(
            `DEBUG: Mode EDIT researchId=${researchId}, documentId=${documentId}`
          );

          if (!documentId) {
            throw new Error("documentId tidak ditemukan dari route edit.");
          }

          let targetDoc = await fetchDocumentDetailWithFallback(
            researchId,
            documentId
          );

          targetDoc = await mergeExplicitContentsToFields(documentId, targetDoc);

          const mappedType = getDocumentTypeFromDoc(targetDoc);
          setDocType(mappedType);

          let proposalDoc = null;

          const proposalId =
            targetDoc.parent_dokumen_id ||
            targetDoc.parent_document_id ||
            (Number(targetDoc.jenis_dokumen_id) === 1 ? targetDoc.id : null);

          if (proposalId && String(proposalId) !== String(targetDoc.id)) {
            try {
              proposalDoc = await fetchDocumentDetailWithFallback(
                researchId,
                proposalId
              );
              proposalDoc = await mergeExplicitContentsToFields(
                proposalId,
                proposalDoc
              );
            } catch (proposalErr) {
              console.warn(
                "DEBUG: Gagal fetch proposal fallback by parent id:",
                proposalErr?.response?.data || proposalErr?.message
              );
            }
          }

          if (!proposalDoc && Number(targetDoc.jenis_dokumen_id) > 1) {
            try {
              const researchDetail = await getResearchDetail(researchId);
              const proposal = researchDetail?.documents?.proposal;

              if (proposal?.id) {
                proposalDoc = await fetchDocumentDetailWithFallback(
                  researchId,
                  proposal.id
                );
                proposalDoc = await mergeExplicitContentsToFields(
                  proposal.id,
                  proposalDoc
                );
              }
            } catch (proposalErr) {
              console.warn(
                "DEBUG: Gagal fetch proposal fallback via research detail:",
                proposalErr?.response?.data || proposalErr?.message
              );
            }
          }

          const { mapping, flatData } = mapDocumentToFormData(
            targetDoc,
            proposalDoc
          );

          const filesRes = await fetchSafeDocumentFiles(documentId);
          flatData.lampiranFiles = filesRes;

          try {
            const researchDetail = await getResearchDetail(researchId);
            const research =
              researchDetail?.research || researchDetail?.data || researchDetail;

            const judulPenelitianParent =
              research?.judul_penelitian ||
              research?.nama_penelitian ||
              research?.title ||
              research?.judul ||
              "";

            if (judulPenelitianParent) {
              flatData.judul_penelitian = judulPenelitianParent;
            }
          } catch (researchErr) {
            console.warn(
              "DEBUG: Gagal memuat judul penelitian parent:",
              researchErr?.response?.data || researchErr?.message
            );
          }

          console.log("DEBUG: Hasil mapping final ke formData:", flatData);

          setFieldMapping(mapping);
          setFormData(flatData);
        }
      } catch (err) {
        console.error("Gagal memuat dokumen:", err);
        const errDetail =
          err?.response?.data?.detail || err?.message || "Unknown error";

        setLoadError(
          `Gagal memuat dokumen${documentId ? ` (ID: ${documentId})` : ""
          }. Error: ${errDetail}.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [researchId, documentId, jenisDokumenId, isCreateMode]);

  useEffect(() => {
    const contentArea = document.querySelector(".content-area");
    if (!contentArea) return;

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

  const buildSaveItems = () => {
    return Object.keys(fieldMapping)
      .filter((key) => fieldMapping[key])
      .map((key) => ({
        template_field_id: fieldMapping[key],
        isi: Array.isArray(formData[key])
          ? formData[key].join(", ")
          : formData[key] ?? "",
      }));
  };

  const handleSave = async (silent = false) => {
    if (!silent) setSaving(true);

    try {
      let docTitle = formData.judul_dokumen || formData.judul_penelitian;

      if (!docTitle || docTitle === "-") {
        docTitle = "Dokumen Penelitian";
      }

      const items = buildSaveItems();
      let activeDocId = activeDocumentId;

      if (isCreateMode && !formData.id && !formData.document_id) {
        console.log("DEBUG: CREATE dokumen baru");

        const docPayload = {
          jenis_dokumen_id: Number(jenisDokumenId),
          template_id: formData.template_id,
          judul: docTitle,
        };

        const newDoc = await createNestedDocument(researchId, docPayload);
        activeDocId = extractDocumentId(newDoc);

        if (!activeDocId) {
          throw new Error("ID dokumen baru tidak ditemukan dari response create.");
        }

        await updateNestedDocument(researchId, activeDocId, {
          judul: docTitle,
          status_dokumen: "draft",
          items,
        });

        setFormData((prev) => ({
          ...prev,
          id: activeDocId,
          document_id: activeDocId,
          penelitian_id: Number(researchId),
        }));

        navigate(`/researches/${researchId}/documents/${activeDocId}/edit`, {
          replace: true,
        });

        return activeDocId;
      }

      if (!activeDocId) {
        throw new Error("documentId tidak tersedia untuk update.");
      }

      console.log("DEBUG: UPDATE dokumen ID:", activeDocId);

      try {
        await updateNestedDocument(researchId, activeDocId, {
          judul: docTitle,
          status_dokumen: "draft",
          items,
        });
      } catch (nestedSaveErr) {
        console.warn(
          "DEBUG: updateNestedDocument gagal, fallback ke updateDocument:",
          nestedSaveErr?.response?.data || nestedSaveErr?.message
        );

        await updateDocument(activeDocId, {
          judul: docTitle,
          status_dokumen: "draft",
          items,
        });
      }

      return activeDocId;
    } catch (err) {
      console.error("Gagal menyimpan:", err);

      if (!silent) {
        alert(err?.response?.data?.detail || err?.message || "Gagal menyimpan data.");
      }

      return null;
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep >= steps.length) return;

    const savedDocId = await handleSave(true);

    const usableDocId = savedDocId || activeDocumentId;

    if (!usableDocId) {
      alert("Dokumen belum berhasil dibuat/disimpan. Silakan coba lagi.");
      return;
    }

    const newStep = currentStep + 1;

    if (newStep === steps.length) {
      try {
        await checkDocumentStatus(usableDocId);
        console.log("DEBUG: checkDocumentStatus dipanggil saat masuk step terakhir");
      } catch (e) {
        console.warn(
          "DEBUG: checkDocumentStatus gagal saat masuk step terakhir:",
          e?.response?.data || e?.message
        );
      }
    }

    setCurrentStep(newStep);

    document
      .querySelector(".content-area")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);

      document
        .querySelector(".content-area")
        ?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageTitle =
    docType === "kemajuan"
      ? "Laporan Kemajuan"
      : docType === "akhir"
        ? "Laporan Akhir"
        : "Proposal";

  const handleExportPdf = async () => {
    if (!activeDocumentId) return;

    setPdfExporting(true);

    try {
      const blob = await exportToPdf(activeDocumentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");

      const timestamp = new Date().getTime();
      const filename = `${pageTitle.replace(/\s+/g, "_")}_${formData.judul_dokumen?.substring(0, 20).replace(/\s+/g, "_") ||
        activeDocumentId
        }_${timestamp}.pdf`;

      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      try {
        await checkDocumentStatus(activeDocumentId);
        console.log("DEBUG: checkDocumentStatus dipanggil setelah ekspor PDF");
      } catch (statusErr) {
        console.warn(
          "DEBUG: checkDocumentStatus gagal setelah ekspor:",
          statusErr?.response?.data || statusErr?.message
        );
      }

      const filesRes = await fetchSafeDocumentFiles(activeDocumentId);
      setFormData((prev) => ({ ...prev, lampiranFiles: filesRes }));
    } catch (err) {
      console.error("Gagal mengekspor PDF:", err);
      alert(err?.response?.data?.detail || err?.message || "Gagal mengekspor PDF");
    } finally {
      setPdfExporting(false);
    }
  };

  const refreshNestedData = async (key) => {
    if (!activeDocumentId) return;

    try {
      const res = await fetchDocumentDetailWithFallback(researchId, activeDocumentId);

      const keyMap = {
        pengusul: res.researchers,
        mitra: res.partners,
        luaran: res.outputs,
        jadwal: res.schedules,
        anggaran: res.budgets,
      };

      setFormData((prev) => ({
        ...prev,
        [key]: keyMap[key] || [],
      }));
    } catch (err) {
      console.warn(
        `DEBUG: Gagal refresh ${key}:`,
        err?.response?.data || err?.message
      );
    }
  };

  const renderProgressStep = () => {
    switch (currentStep) {
      case 1:
        return <ProgressIdentitasStep data={formData} onChange={handleInputChange} />;
      case 2:
        return <ProgressHasilStep data={formData} onChange={handleInputChange} />;
      case 3:
        return (
          <ProgressPengusulStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("pengusul")}
          />
        );
      case 4:
        return (
          <ProgressMitraStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("mitra")}
          />
        );
      case 5:
        return (
          <ProgressLuaranStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("luaran")}
          />
        );
      case 6:
        return <ProgressSelesaiStep onExport={handleExportPdf} isExporting={pdfExporting} />;
      default:
        return null;
    }
  };

  const renderFinalStep = () => {
    switch (currentStep) {
      case 1:
        return <FinalIdentitasStep data={formData} onChange={handleInputChange} />;
      case 2:
        return (
          <FinalPengusulStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("pengusul")}
          />
        );
      case 3:
        return (
          <FinalMitraStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("mitra")}
          />
        );
      case 4:
        return (
          <FinalLuaranStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("luaran")}
          />
        );
      case 5:
        return <FinalHasilStep data={formData} onChange={handleInputChange} />;
      case 6:
        return (
          <FinalJadwalStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("jadwal")}
          />
        );
      case 7:
        return (
          <FinalAnggaranStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("anggaran")}
          />
        );
      case 8:
        return <FinalSelesaiStep onExport={handleExportPdf} isExporting={pdfExporting} />;
      default:
        return null;
    }
  };

  const renderProposalStep = () => {
    switch (currentStep) {
      case 1:
        return <SubstansiStep data={formData} onChange={handleInputChange} />;
      case 2:
        return (
          <PengusulStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("pengusul")}
          />
        );
      case 3:
        return (
          <MitraStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("mitra")}
          />
        );
      case 4:
        return (
          <JadwalStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("jadwal")}
          />
        );
      case 5:
        return (
          <AnggaranStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("anggaran")}
          />
        );
      case 6:
        return (
          <LuaranStep
            data={formData}
            documentId={activeDocumentId}
            refreshData={() => refreshNestedData("luaran")}
          />
        );
      case 7:
        return <SelesaiStep onExport={handleExportPdf} isExporting={pdfExporting} />;
      default:
        return null;
    }
  };

  const navigateToResearchDetail = () => {
    const resId = researchId || formData?.penelitian_id || formData?.research_id;

    if (resId && String(resId) !== "undefined" && String(resId) !== "null") {
      navigate(`/penelitian/${resId}`);
    } else {
      navigate("/penelitian");
    }
  };

  const handleSimpanKeluar = async () => {
    setSaving(true);

    try {
      const docId = await handleSave(true);

      if (docId || activeDocumentId) {
        navigateToResearchDetail();
      } else {
        alert("Gagal menyimpan draft. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Gagal simpan & keluar:", err);
      alert("Gagal menyimpan data sebelum keluar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-5 text-center">Memuat editor...</div>
      </DashboardLayout>
    );
  }

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

        <div className={`editor-content-wrapper ${showBackButton ? "has-back" : ""}`}>
          <div className="editor-form-area">
            <div className="editor-page-heading d-flex justify-content-between align-items-center">
              <div>
                <h1 className="editor-page-title">Editor {pageTitle}</h1>
                <p className="editor-page-subtitle">
                  {formData.judul_dokumen || "Memuat judul..."}
                </p>
              </div>
              {saving && <div className="badge bg-info">Menyimpan...</div>}
            </div>

            <div className="stepper-wrapper">
              <div className="stepper">
                {steps.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div
                      key={step.id}
                      className={`step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""
                        }`}
                    >
                      <div className="step-circle">
                        {isCompleted ? <i className="bi bi-check"></i> : step.id}
                      </div>
                      <div className="step-label">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="step-content">
              {docType === "kemajuan"
                ? renderProgressStep()
                : docType === "akhir"
                  ? renderFinalStep()
                  : renderProposalStep()}
            </div>

            <div className="editor-footer-nav">
              <div className="nav-buttons-left">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn-nav btn-prev"
                    onClick={prevStep}
                    disabled={saving}
                  >
                    <i className="bi bi-chevron-left"></i> Sebelumnya
                  </button>
                )}

                <button
                  type="button"
                  className="btn-nav btn-save"
                  onClick={handleSimpanKeluar}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan & Keluar"}
                </button>
              </div>

              <div className="nav-buttons-right">
                {currentStep < steps.length && (
                  <button
                    type="button"
                    className="btn-nav btn-next"
                    onClick={nextStep}
                    disabled={saving}
                  >
                    Selanjutnya <i className="bi bi-chevron-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="ai-floating-btn"
          onClick={() => setIsAssistantOpen(true)}
        >
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