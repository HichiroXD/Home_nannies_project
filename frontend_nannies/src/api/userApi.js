import API from "./api";

// Registrar usuario
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/users/register/", userData);
    return response.data;
  } catch (error) {
    console.error("Error en registerUser:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al registrar usuario" };
  }
};

// Login de usuario
export const loginUser = async (username, password) => {
  try {
    const response = await API.post("/users/login/", { username, password });
    // Devuelve el cuerpo JSON completo (access, refresh, username, role)
    return response.data;
  } catch (error) {
    console.error("Error en loginUser:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al iniciar sesión" };
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async () => {
  try {
    // Recuperamos el token almacenado
    const token = localStorage.getItem("accessToken");

    // Verificamos si el token existe
    if (!token) {
      throw new Error("Token de acceso no encontrado");
    }

    const response = await API.get("/users/me/");

    return response.data;
  } catch (error) {
    console.error("Error en getProfile:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al obtener perfil" };
  }
};

// Verificar usuario
export const verifyUser = async (uid, token) => {
  const response = await API.get(`/users/verify/${uid}/${token}/`);
  return response.data;
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post("/users/password-reset/", { email });
    return response.data;
  } catch (error) {
    console.error("Error en requestPasswordReset:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al solicitar recuperación de contraseña" };
  }
};

// Restablecer contraseña
export const resetPassword = async (uid, token, password, password2) => {
  try {
    const response = await API.post(`/users/password-reset/${uid}/${token}/`, {
      password,
      password2,
    });
    return response.data;
  } catch (error) {
    console.error("Error en resetPassword:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al restablecer contraseña" };
  }
};