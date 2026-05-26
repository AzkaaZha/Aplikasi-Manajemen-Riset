import axios from "axios";
import { getToken, removeToken } from "../utils/tokenStorage";

export const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
});

export const documentApiClient = axios.create({
  baseURL: import.meta.env.VITE_DOCUMENT_API_URL,
});

export const aiApiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL,
});

console.log("AI API Base URL:", import.meta.env.VITE_AI_API_URL);

const attachToken = (config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApiClient.interceptors.request.use(attachToken);
documentApiClient.interceptors.request.use(attachToken);
aiApiClient.interceptors.request.use(attachToken);

const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    
    removeToken();
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

authApiClient.interceptors.response.use((response) => response, handleAuthError);
documentApiClient.interceptors.response.use((response) => response, handleAuthError);
aiApiClient.interceptors.response.use((response) => response, handleAuthError);