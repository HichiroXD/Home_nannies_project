/**
 * User API - Funciones para autenticación y gestión de usuarios
 * 
 * Todas las funciones usan el interceptor de API para manejo de errores centralizado.
 * No es necesario envolver en try/catch - el interceptor ya maneja errores HTTP.
 */
import API from "./api";

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario (username, email, password, role, etc.)
 * @returns {Promise<Object>} Response completo con status y data
 */
export const registerUser = async (userData) => {
  const response = await API.post("/users/register/", userData);
  return response; // Retornar response completo para acceder a status
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