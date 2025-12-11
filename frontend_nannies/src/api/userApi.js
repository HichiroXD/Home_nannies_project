/**
 * User API - Funciones para autenticación y gestión de usuarios
 * 
 * Todas las funciones usan el interceptor de API para manejo de errores centralizado.
 * No es necesario envolver en try/catch - el interceptor ya maneja errores HTTP.
 */
import API from "./api";
import axios from "axios";

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario (username, email, password, role, etc.)
 * @returns {Promise<Object>} Datos del usuario creado
 */
export const registerUser = async (userData) => {
  const response = await API.post("/users/register/", userData);
  return response.data;
};

/**
 * Login de usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Tokens (access, refresh) y datos del usuario (username, role)
 */
export const loginUser = async (username, password) => {
  const response = await API.post("/users/login/", { username, password });
  return response.data;
};

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del perfil del usuario
 * @throws {Error} Si no existe token de acceso
 */
export const getProfile = async () => {
  const token = localStorage.getItem("accessToken");
  
  if (!token) {
    throw new Error("Token de acceso no encontrado");
  }
  
  const response = await API.get("/users/me/");
  return response.data;
};

/**
 * Verificar usuario mediante link de email
 * @param {string} uid - User ID
 * @param {string} token - Token de verificación
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verifyUser = async (uid, token) => {
  const response = await API.get(`/users/verify/${uid}/${token}/`);
  return response.data;
};

/**
 * Solicitar recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Confirmación del envío
 */
export const requestPasswordReset = async (email) => {
  const response = await API.post("/users/password-reset/", { email });
  return response.data;
};

/**
 * Restablecer contraseña con token
 * @param {string} uid - User ID
 * @param {string} token - Token de recuperación
 * @param {string} password - Nueva contraseña
 * @param {string} password2 - Confirmación de contraseña
 * @returns {Promise<Object>} Confirmación del cambio
 */
export const resetPassword = async (uid, token, password, password2) => {
  const response = await API.post(`/users/password-reset/${uid}/${token}/`, {
    password,
    password2,
  });
  return response.data;
};

/**
 * Refrescar token de acceso usando el refresh token
 * @param {string} token - Token de refresh (opcional, si no se provee usa el del localStorage)
 * @returns {Promise<Object>} Nuevos tokens (access, refresh)
 * @throws {Error} Si el refresh token es inválido o expirado
 */
export const refreshToken = async (token = null) => {
  const refreshTokenValue = token || localStorage.getItem("refreshToken");
  
  if (!refreshTokenValue) {
    throw new Error("Refresh token no encontrado");
  }

  // Crear una instancia temporal sin interceptores para el refresh
  // Esto evita que el interceptor de API intente agregar el token o procese errores
  const refreshAPI = axios.create({
    baseURL: API.defaults.baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await refreshAPI.post("/token/refresh/", {
    refresh: refreshTokenValue,
  });
  
  return response.data;
};