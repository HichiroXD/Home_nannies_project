import API from "./api";
import logger from "../utils/logger";

// Obtener perfil de niñera
export const getNannyProfile = async () => {
  try {
    const response = await API.get("/nannies/profile/");
    return response.data;
  } catch (error) {
    logger.error('Error obteniendo perfil de ni\u00f1era', { error: error.response?.data || error.message });
    throw error.response?.data || { detail: "Error al obtener perfil" };
  }
};

// Actualizar perfil de niñera
export const updateNannyProfile = async (profileData) => {
  try {
    logger.debug('Actualizando perfil ni\u00f1era', { 
      hourly_rate: profileData.hourly_rate, 
      hourly_rate_type: typeof profileData.hourly_rate 
    });
    const response = await API.patch("/nannies/profile/", profileData);
    return response.data;
  } catch (error) {
    logger.error('Error actualizando perfil ni\u00f1era', { error: error.response?.data || error.message });
    throw error.response?.data || { detail: "Error al actualizar perfil" };
  }
};

// Obtener perfil de padre
export const getParentProfile = async () => {
  try {
    const response = await API.get("/parents/profile/");
    return response.data;
  } catch (error) {
    logger.error('Error obteniendo perfil de padre', { error: error.response?.data || error.message });
    throw error.response?.data || { detail: "Error al obtener perfil" };
  }
};

// Actualizar perfil de padre
export const updateParentProfile = async (profileData) => {
  try {
    const response = await API.patch("/parents/profile/", profileData);
    return response.data;
  } catch (error) {
    logger.error('Error actualizando perfil de padre', { error: error.response?.data || error.message });
    throw error.response?.data || { detail: "Error al actualizar perfil" };
  }
};
