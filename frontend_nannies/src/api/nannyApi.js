import API from "./api";

// Obtener lista pública de niñeras
export const getNannies = async () => {
  const response = await API.get("/users/nannies/");
  return response.data;
};