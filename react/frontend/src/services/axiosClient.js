import axios from "axios";
import { getToken } from "../utils/token";

export const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
});

const attachToken = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApiClient.interceptors.request.use(attachToken);