import API from "./api";

export const registerUser = async (userData) => {
  const res = await API.post("/users/register/", userData);
  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await API.post("/token/", {
    username,
    password,
  });
  // guardar tokens en localStorage
  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);
  return res.data;
};
