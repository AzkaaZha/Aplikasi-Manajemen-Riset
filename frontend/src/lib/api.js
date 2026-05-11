import axios from 'axios';

const AUTH_URL = 'http://localhost:8001';
const DOCS_URL = 'http://localhost:8002';
const AI_URL = 'http://localhost:8003';

const api = axios.create({
  baseURL: DOCS_URL,
});

const authClient = axios.create({
  baseURL: AUTH_URL,
});

const aiClient = axios.create({
  baseURL: AI_URL,
});

// Helper to add auth header
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(api);
addAuthInterceptor(authClient);
addAuthInterceptor(aiClient);

export const authApi = {
  login: (email, password) => authClient.post('/auth/login', { email, password }),
  me: () => authClient.get('/auth/me'),
};

export const aiApi = {
  chat: (message, context, history = [], signal) => 
    aiClient.post('/ai/chat', { message, context, history }, { signal }),
};

export const researchApi = {
  getAll: () => api.get('/researches/'),
  getById: (id) => api.get(`/researches/${id}`),
  create: (data) => api.post('/researches/', data),
  delete: (id) => api.delete(`/researches/${id}`),
  getDocuments: (id) => api.get(`/researches/${id}/documents`),
  createProposal: (id) => api.post(`/researches/${id}/documents/proposal`),
  createProgressReport: (id) => api.post(`/researches/${id}/documents/progress-report`),
  createFinalReport: (id) => api.post(`/researches/${id}/documents/final-report`),
};

export const documentApi = {
  getFields: (id) => api.get(`/documents/${id}/fields`),
  getContents: (id) => api.get(`/documents/${id}/contents`),
  saveContents: (id, items) => api.post(`/documents/${id}/contents`, { items }),
  getPreview: (id) => api.get(`/documents/${id}/preview`),
  exportPdf: (id) => api.get(`/documents/${id}/export-pdf`, { responseType: 'blob' }),

  // Pengusul / Researchers
  getResearchers: (id) => api.get(`/documents/${id}/researchers`),
  addResearcher: (id, data) => api.post(`/documents/${id}/researchers`, data),
  updateResearcher: (id, researcherId, data) => api.put(`/documents/${id}/researchers/${researcherId}`, data),
  deleteResearcher: (id, researcherId) => api.delete(`/documents/${id}/researchers/${researcherId}`),

  // Mitra / Partners
  getPartners: (id) => api.get(`/documents/${id}/partners`),
  addPartner: (id, data) => api.post(`/documents/${id}/partners`, data),
  updatePartner: (id, partnerId, data) => api.put(`/documents/${id}/partners/${partnerId}`, data),
  deletePartner: (id, partnerId) => api.delete(`/documents/${id}/partners/${partnerId}`),

  // Jadwal / Schedules
  getSchedules: (id) => api.get(`/documents/${id}/schedules`),
  addSchedule: (id, data) => api.post(`/documents/${id}/schedules`, data),
  updateSchedule: (id, scheduleId, data) => api.put(`/documents/${id}/schedules/${scheduleId}`, data),
  deleteSchedule: (id, scheduleId) => api.delete(`/documents/${id}/schedules/${scheduleId}`),

  // Anggaran / Budgets
  getBudgets: (id) => api.get(`/documents/${id}/budgets`),
  addBudget: (id, data) => api.post(`/documents/${id}/budgets`, data),
  updateBudget: (id, budgetId, data) => api.put(`/documents/${id}/budgets/${budgetId}`, data),
  deleteBudget: (id, budgetId) => api.delete(`/documents/${id}/budgets/${budgetId}`),

  // Luaran / Outputs
  getOutputs: (id) => api.get(`/documents/${id}/outputs`),
  addOutput: (id, data) => api.post(`/documents/${id}/outputs`, data),
  updateOutput: (id, outputId, data) => api.put(`/documents/${id}/outputs/${outputId}`, data),
  deleteOutput: (id, outputId) => api.delete(`/documents/${id}/outputs/${outputId}`),

  // Submit
  submit: (id) => api.post(`/documents/${id}/submit`),
};

export default api;

