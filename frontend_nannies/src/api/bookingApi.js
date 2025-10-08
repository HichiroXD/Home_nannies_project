import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/bookings/";

export const scheduleBooking = async (nannyId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const data = { nanny: nannyId }; // el backend completará parent desde el token
  const response = await axios.post(API_URL, data, config);
  return response.data;
};
