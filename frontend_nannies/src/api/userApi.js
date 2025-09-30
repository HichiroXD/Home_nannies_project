// src/userApi.js
import API from "./api";

// Registrar usuario
export const registerUser = async (userData) => {
  const response = await API.post("/users/register", userData);
  return response.data;
};
// Login de usuario
export const loginUser = async (username, password) => {
  const response = await API.post("/users/login/", { username, password });
  return response.data;
};
// Ejemplo: obtener perfil
export const getProfile = async () => {
  const response = await API.get("/profile");
  return response.data;
};
