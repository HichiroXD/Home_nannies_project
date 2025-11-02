import API from "./api";

// Obtener lista pública de niñeras
export const getNannies = async (filters = {}) => {
  const response = await API.get("/nannies/", { params: filters });
  return response.data;
};

// Obtener detalles de una niñera por ID
export const getNannyById = async (nannyId) => {
  const response = await API.get(`/nannies/${nannyId}/`);
  return response.data;
};

