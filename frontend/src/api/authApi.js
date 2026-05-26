import { authApiClient } from "./axiosClient";

export const login = async ({ email, password }) => {
  const response = await authApiClient.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await authApiClient.get("/auth/me");
  return response.data;
};