import API from "./api";

export const registerUser = async (userData) => {
  try {
    const res = await API.post("/users/register/", userData);
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw { detail: "Error inesperado al registrar usuario." };
    }
  }
};

export const loginUser = async (username, password) => {
  try {
    const res = await API.post("/token/", { username, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw { detail: "Error inesperado al iniciar sesión." };
    }
  }
};

