import api from "./api";

export const getNannies = async () => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`nannies/?${params}`);
  return response.data;
};

export const getNannyDetail = async (id) => {
  const response = await api.get(`nannies/${id}/`);
  return response.data;
};
