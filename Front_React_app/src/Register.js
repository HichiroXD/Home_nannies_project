import React, { useState } from "react";
import { registerUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // limpia errores previos

    // Validación básica en frontend
    if (formData.password !== formData.password2) {
      setErrors({ password2: ["Las contraseñas no coinciden."] });
      return;
    }

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (error) {
      setErrors(error); // error ya viene limpio desde userApi.js
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        onChange={handleChange}
        placeholder="Usuario"
        value={formData.username}
      />
      {errors.username && <p className="error">{errors.username}</p>}

      <input
        name="email"
        onChange={handleChange}
        placeholder="Email"
        value={formData.email}
      />
      {errors.email && <p className="error">{errors.email}</p>}

      <input
        name="password"
        type="password"
        onChange={handleChange}
        placeholder="Contraseña"
        value={formData.password}
      />
      {errors.password && <p className="error">{errors.password}</p>}

      <input
        name="password2"
        type="password"
        onChange={handleChange}
        placeholder="Repetir contraseña"
        value={formData.password2}
      />
      {errors.password2 && <p className="error">{errors.password2}</p>}

      <select name="role" onChange={handleChange} value={formData.role}>
        <option value="parent">Padre/Madre</option>
        <option value="nanny">Niñera</option>
      </select>
      {errors.role && <p className="error">{errors.role}</p>}

      <button type="submit">Registrarse</button>

      {errors.detail && <p className="error">{errors.detail}</p>}
    </form>
  );
}

export default RegisterForm;
