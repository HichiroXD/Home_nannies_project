import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "parent",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

  // Limpia errores previos si estás usando estado para errores
  // setErrors({});

  // Validación básica en frontend
    if (formData.password !== formData.password2) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register(formData); // función desde AuthContext
      alert("Registro exitoso");
      navigate("/login");
    } catch (err) {
      const mensaje =
        err?.response?.data
          ? JSON.stringify(err.response.data)
          : "Error inesperado al registrar usuario.";
      console.error("Error al registrar:", mensaje);
      alert("Error: " + mensaje);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" onChange={handleChange} placeholder="Usuario" />
      <input name="email" onChange={handleChange} placeholder="Email" />
      <input name="password" type="password" onChange={handleChange} placeholder="Contraseña" />
      <input name="password2" type="password" onChange={handleChange} placeholder="Repetir contraseña" />
      <select name="role" onChange={handleChange}>
        <option value="parent">Padre/Madre</option>
        <option value="nanny">Niñera</option>
      </select>
      <button type="submit">Registrarse</button>
    </form>
  );
  
}

export default RegisterForm;
