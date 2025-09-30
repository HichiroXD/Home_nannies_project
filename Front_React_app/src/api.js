import axiosInstance from "./services/axiosInstance";

// Registro
export const registerUser = (userData) =>
  axiosInstance.post("/users/register/", userData);

// Login (no pasa por axiosInstance porque aún no tienes token)
export const loginUser = async (username, password) => {
  const res = await axiosInstance.post("/users/login/", { username, password });
  // guardar tokens
  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
  return res.data;
};

// Perfil
export const getProfile = () =>
  axiosInstance.get("/users/me/");

// Reservas
export const getBookings = () =>
  axiosInstance.get("/bookings/");

export const createBooking = (booking) =>
  axiosInstance.post("/bookings/", booking);
