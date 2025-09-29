import React, { createContext, useState, useEffect } from "react";
import { registerUser, loginUser, getProfile } from "../api";  // 👈 named imports

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Registro
  const register = async (userData) => {
    try {
      const response = await registerUser(userData);  // 👈 ya no usamos API
      setUser(response.user);
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.error("Error al registrar:", error);
      throw error;
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      const response = await loginUser(credentials);  // 👈 ya no usamos API
      setUser(response.user);
      localStorage.setItem("token", response.token);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // Obtener perfil
  const fetchProfile = async () => {
    try {
      const response = await getProfile();  // 👈 ya no usamos API
      setUser(response.user);
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login }}>
      {children}
    </AuthContext.Provider>
  );
};
