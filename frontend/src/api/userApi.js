import { authApiClient } from "./axiosClient";

export const getUsers = async () => {
  const response = await authApiClient.get("/users/");
  return response.data;
};

export const getUserById = async (id) => {
  try {
    const response = await authApiClient.get(`/users/${id}`);
    return response.data;
  } catch (err) {
    
    
    const all = await getUsers();
    return all.find((u) => String(u.id) === String(id));
  }
};

export const createUser = async (payload) => {
  const response = await authApiClient.post(`/users/`, payload);
  return response.data;
};

export const updateUser = async (id, payload) => {
  const response = await authApiClient.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await authApiClient.delete(`/users/${id}`);
  return response.data;
};
