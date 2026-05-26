import { documentApiClient } from "./axiosClient";

export const getResearchers = async (documentId) => {
  if (!documentId) return [];

  const response = await documentApiClient.get(
    `/documents/${documentId}/researchers/`
  );

  return response.data;
};

export const createResearcher = async (documentId, data) => {
  const response = await documentApiClient.post(
    `/documents/${documentId}/researchers/`,
    data
  );

  return response.data;
};

export const updateResearcher = async (documentId, researcherId, data) => {
  const response = await documentApiClient.put(
    `/documents/${documentId}/researchers/${researcherId}`,
    data
  );

  return response.data;
};

export const deleteResearcher = async (documentId, researcherId) => {
  const response = await documentApiClient.delete(
    `/documents/${documentId}/researchers/${researcherId}`
  );

  return response.data;
};

export const getResearchPackages = async () => {
  const response = await documentApiClient.get(
    "/documents/research-packages"
  );

  return response.data;
};

export const deleteResearch = async (penelitianId) => {
  console.log(`[API] Menghapus penelitian ID: ${penelitianId}`);
  console.log(`[API] Endpoint: DELETE /researches/${penelitianId}`);
  console.log(`[API] PENTING: ${penelitianId} adalah penelitian_id, BUKAN dokumen_id`);
  
  try {
    const response = await documentApiClient.delete(`/researches/${penelitianId}`);
    console.log(`[API] Response Sukses:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[API] Response Error Lengkap:`, error.response || error);
    throw error;
  }
};


export const createProgressReportByResearch = async (penelitianId) => {
  console.log(`[API] Membuat laporan kemajuan untuk penelitian_id: ${penelitianId}`);
  const response = await documentApiClient.post(
    `/researches/${penelitianId}/documents/progress-report`
  );
  return response.data;
};


export const createFinalReportByResearch = async (penelitianId) => {
  console.log(`[API] Membuat laporan akhir untuk penelitian_id: ${penelitianId}`);
  const response = await documentApiClient.post(
    `/researches/${penelitianId}/documents/final-report`
  );
  return response.data;
};