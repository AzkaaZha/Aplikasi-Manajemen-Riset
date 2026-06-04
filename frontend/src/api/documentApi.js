import { documentApiClient } from "./axiosClient";

export const getDocuments = async () => {
  const response = await documentApiClient.get("/documents/");
  return response.data;
};


export const getMyDocuments = getDocuments;


export const getResearchDetail = async (researchId) => {
  const response = await documentApiClient.get(`/researches/${researchId}/documents`);
  return response.data;
};


export const updateResearch = async (researchId, data) => {
  const response = await documentApiClient.put(`/researches/${researchId}`, data);
  return response.data;
};


export const createDocument = async (data) => {
  const response = await documentApiClient.post("/documents/", data);
  return response.data;
};


export const getDocumentDetail = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}`);
  return response.data;
};


export const getDocumentFullDetail = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/full-detail`);
  return response.data;
};


export const getResearchDocuments = async (proposalId) => {
  const response = await documentApiClient.get(`/documents/${proposalId}/related`);
  return response.data;
};


export const createProgressReport = async (proposalId) => {
  const response = await documentApiClient.post(`/documents/${proposalId}/create-progress-report`);
  return response.data;
};


export const createFinalReport = async (proposalId) => {
  const response = await documentApiClient.post(`/documents/${proposalId}/create-final-report`);
  return response.data;
};


export const updateDocument = async (documentId, data) => {
  const response = await documentApiClient.put(`/documents/${documentId}`, data);
  return response.data;
};


export const autosaveDocument = async (documentId) => {
  const response = await documentApiClient.post(`/documents/${documentId}/autosave`);
  return response.data;
};


export const getDocumentFields = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/fields`);
  return response.data;
};


export const getDocumentContents = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/contents`);
  return response.data;
};


export const saveDocumentContents = async (documentId, items) => {
  const response = await documentApiClient.post(`/documents/${documentId}/contents`, { items });
  return response.data;
};


export const getDocumentPreview = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/preview`);
  return response.data;
};


export const exportDocumentPdf = async (documentId) => {
  try {
    const response = await documentApiClient.get(`/documents/${documentId}/export-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        if (json.detail) {
          err.message = json.detail;
          err.response.data = json;
        }
      } catch (e) {

      }
    }
    throw err;
  }
};


export const exportToPdf = exportDocumentPdf;


export const checkDocumentStatus = async (documentId) => {
  const response = await documentApiClient.post(`/documents/${documentId}/check-status`);
  return response.data;
};


export const getResearchers = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/researchers/`);
  return response.data;
};

export const createResearcher = async (documentId, payload) => {
  const response = await documentApiClient.post(`/documents/${documentId}/researchers/`, payload);
  return response.data;
};


export const addResearcher = async (documentId, payload) => {
  const response = await documentApiClient.post(
    `/documents/${documentId}/researchers/`,
    payload
  );
  return response.data;
};

export const updateResearcher = async (documentId, researcherId, payload) => {
  const response = await documentApiClient.put(
    `/documents/${documentId}/researchers/${researcherId}`,
    payload
  );
  return response.data;
};

export const deleteResearcher = async (documentId, researcherId) => {
  const response = await documentApiClient.delete(
    `/documents/${documentId}/researchers/${researcherId}`
  );
  return response.data;
};


export const getPartners = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/partners/`);
  return response.data;
};

export const createPartner = async (documentId, data) => {
  const response = await documentApiClient.post(`/documents/${documentId}/partners/`, data);
  return response.data;
};


export const addPartner = createPartner;

export const updatePartner = async (documentId, partnerId, data) => {
  const response = await documentApiClient.put(`/documents/${documentId}/partners/${partnerId}`, data);
  return response.data;
};

export const deletePartner = async (documentId, partnerId) => {
  const response = await documentApiClient.delete(`/documents/${documentId}/partners/${partnerId}`);
  return response.data;
};


export const getOutputs = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/outputs/`);
  return response.data;
};

export const createOutput = async (documentId, data) => {
  const response = await documentApiClient.post(`/documents/${documentId}/outputs/`, data);
  return response.data;
};


export const addOutput = createOutput;

export const updateOutput = async (documentId, outputId, data) => {
  const response = await documentApiClient.put(`/documents/${documentId}/outputs/${outputId}`, data);
  return response.data;
};

export const deleteOutput = async (documentId, outputId) => {
  const response = await documentApiClient.delete(`/documents/${documentId}/outputs/${outputId}`);
  return response.data;
};


export const getSchedules = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/schedules/`);
  return response.data;
};

export const createSchedule = async (documentId, data) => {
  const response = await documentApiClient.post(`/documents/${documentId}/schedules/`, data);
  return response.data;
};


export const addSchedule = createSchedule;

export const updateSchedule = async (documentId, scheduleId, data) => {
  const response = await documentApiClient.put(`/documents/${documentId}/schedules/${scheduleId}`, data);
  return response.data;
};

export const deleteSchedule = async (documentId, scheduleId) => {
  const response = await documentApiClient.delete(`/documents/${documentId}/schedules/${scheduleId}`);
  return response.data;
};


export const getBudgets = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/budgets/`);
  return response.data;
};

export const createBudget = async (documentId, data) => {
  const response = await documentApiClient.post(`/documents/${documentId}/budgets/`, data);
  return response.data;
};


export const addBudget = createBudget;

export const updateBudget = async (documentId, budgetId, data) => {
  const response = await documentApiClient.put(`/documents/${documentId}/budgets/${budgetId}`, data);
  return response.data;
};

export const deleteBudget = async (documentId, budgetId) => {
  const response = await documentApiClient.delete(`/documents/${documentId}/budgets/${budgetId}`);
  return response.data;
};


export const getDocumentFiles = async (documentId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/files`);
  return response.data;
};

export const downloadFile = async (documentId, fileId) => {
  const response = await documentApiClient.get(`/documents/${documentId}/files/${fileId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

export const deleteFile = async (documentId, fileId) => {
  const response = await documentApiClient.delete(`/documents/${documentId}/files/${fileId}`);
  return response.data;
};


export const uploadFile = async (documentId, formData) => {
  const response = await documentApiClient.post(`/documents/${documentId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};



export const createNestedDocument = async (researchId, payload) => {
  const response = await documentApiClient.post(`/researches/${researchId}/documents`, payload);
  return response.data;
};

export const getNestedDocumentFullDetail = async (researchId, documentId) => {
  const response = await documentApiClient.get(`/researches/${researchId}/documents/${documentId}`);
  return response.data;
};

export const updateNestedDocument = async (researchId, documentId, data) => {
  const response = await documentApiClient.put(`/researches/${researchId}/documents/${documentId}`, data);
  return response.data;
};

export const deleteNestedDocument = async (researchId, documentId) => {
  const response = await documentApiClient.delete(`/researches/${researchId}/documents/${documentId}`);
  return response.data;
};

export const getActiveTemplateFields = async (jenisDokumenId) => {
  const response = await documentApiClient.get(`/researches/templates/active/${jenisDokumenId}`);
  return response.data;
};