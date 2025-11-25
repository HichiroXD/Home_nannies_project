import API from "./api";

// Obtener perfil de niñera
export const getNannyProfile = async () => {
  try {
    const response = await API.get("/nannies/profile/");
    return response.data;
  } catch (error) {
    console.error("Error en getNannyProfile:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al obtener perfil" };
  }
};

// Actualizar perfil de niñera
export const updateNannyProfile = async (profileData) => {
  try {
    console.log("updateNannyProfile - Datos antes de enviar:", profileData);
    console.log("updateNannyProfile - hourly_rate:", profileData.hourly_rate, typeof profileData.hourly_rate, Array.isArray(profileData.hourly_rate));
    const response = await API.patch("/nannies/profile/", profileData);
    return response.data;
  } catch (error) {
    console.error("Error en updateNannyProfile:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al actualizar perfil" };
  }
};

// Obtener perfil de padre
export const getParentProfile = async () => {
  try {
    const response = await API.get("/parents/profile/");
    return response.data;
  } catch (error) {
    console.error("Error en getParentProfile:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al obtener perfil" };
  }
};

// Actualizar perfil de padre
export const updateParentProfile = async (profileData) => {
  try {
    const response = await API.patch("/parents/profile/", profileData);
    return response.data;
  } catch (error) {
    console.error("Error en updateParentProfile:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Error al actualizar perfil" };
  }
};
