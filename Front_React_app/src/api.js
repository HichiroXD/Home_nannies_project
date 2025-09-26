import axios from "axios";

// Dirección del backend (cambia en producción)
const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Interceptor para agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
