import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar el token en cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug: log the request data
  if (config.url.includes('/profile/') && (config.method === 'patch' || config.method === 'put')) {
    console.log("AXIOS INTERCEPTOR - Request config:", config);
    console.log("AXIOS INTERCEPTOR - Request data:", config.data);
    console.log("AXIOS INTERCEPTOR - Data stringified:", JSON.stringify(config.data));
  }
  
  return config;
});

// Global response handler: if backend returns 401, clear auth and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch (e) {
        // ignore
      }
      // redirect to login so user can re-authenticate
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
