/**
 * API para gestionar los hijos (children) de los padres
 */
import API from './api';

/**
 * Obtiene la lista de todos los hijos del padre autenticado
 * @returns {Promise} Lista de hijos
 */
export const getChildren = async () => {
  try {
    const response = await API.get('/parents/children/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener hijos:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de un hijo específico
 * @param {number} childId - ID del hijo
 * @returns {Promise} Datos del hijo
 */
export const getChild = async (childId) => {
  try {
    const response = await API.get(`/parents/children/${childId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener hijo ${childId}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo hijo
 * @param {Object} childData - Datos del hijo a crear
 * @returns {Promise} Datos del hijo creado
 */
export const createChild = async (childData) => {
  try {
    const response = await API.post('/parents/children/', childData);
    return response.data;
  } catch (error) {
    console.error('Error al crear hijo:', error);
    throw error;
  }
};

/**
 * Actualiza la información de un hijo existente
 * @param {number} childId - ID del hijo
 * @param {Object} childData - Datos actualizados del hijo
 * @returns {Promise} Datos del hijo actualizado
 */
export const updateChild = async (childId, childData) => {
  try {
    const response = await API.patch(`/parents/children/${childId}/`, childData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar hijo ${childId}:`, error);
    throw error;
  }
};

/**
 * Elimina un hijo
 * @param {number} childId - ID del hijo a eliminar
 * @returns {Promise} Respuesta de la eliminación
 */
export const deleteChild = async (childId) => {
  try {
    const response = await API.delete(`/parents/children/${childId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar hijo ${childId}:`, error);
    throw error;
  }
};
