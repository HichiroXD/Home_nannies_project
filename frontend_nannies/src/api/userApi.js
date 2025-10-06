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

    // Agregamos el encabezado Authorization
    const response = await API.get("/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error en getProfile:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al obtener perfil" };
  }
};
