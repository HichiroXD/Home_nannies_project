import API from "./api";

export const scheduleBooking = async (nannyId) => {
  const response = await API.post("/bookings/", { nanny: nannyId });
  return response.data;
};
