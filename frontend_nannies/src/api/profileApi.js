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
    // Detectar si profileData es FormData (tiene archivos)
    const isFormData = profileData instanceof FormData;
    
    logger.debug('Actualizando perfil niñera', { 
      isFormData,
      hasFile: isFormData ? profileData.has('profile_photo') : false
    });
    
    // Si es FormData, necesitamos configurar headers especiales
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    
    const response = await API.patch("/nannies/profile/", profileData, config);
    return response.data;
  } catch (error) {
    logger.error('Error actualizando perfil niñera', { error: error.response?.data || error.message });
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
    // Detectar si profileData es FormData (tiene archivos)
    const isFormData = profileData instanceof FormData;
    
    logger.debug('Actualizando perfil padre', { 
      isFormData,
      hasFile: isFormData ? profileData.has('profile_photo') : false
    });
    
    // Si es FormData, necesitamos configurar headers especiales
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    
    const response = await API.patch("/parents/profile/", profileData, config);
    return response.data;
  } catch (error) {
    logger.error('Error actualizando perfil de padre', { error: error.response?.data || error.message });
    throw error.response?.data || { detail: "Error al actualizar perfil" };
  }
};
