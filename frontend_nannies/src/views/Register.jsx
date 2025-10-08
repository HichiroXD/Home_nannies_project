import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "parent",
    password: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validación rápida antes del POST
    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/register/", formData);

      if (response.status === 201) {
        setSuccessMessage(
          "Tu cuenta ha sido creada correctamente. Se ha enviado un correo para verificar tu cuenta antes de iniciar sesión."
        );

        // Limpiar el formulario
        setFormData({
          username: "",
          email: "",
          role: "parent",
          password: "",
          password2: "",
        });

        // Redirigir al login luego de unos segundos
        setTimeout(() => navigate("/login"), 3500);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const details = Object.values(err.response.data).flat().join(" ");
        setError(details || "Error en los datos ingresados. Revisa la información.");
      } else {
        setError("Ocurrió un error al registrar la cuenta. Intenta más tarde.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
          Crear cuenta
        </h1>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {successMessage}
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            required
          />

          {/* Selección de rol */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
          >
            <option value="parent">Padre / Madre</option>
            <option value="nanny">Niñera</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="password"
            name="password2"
            placeholder="Confirmar contraseña"
            value={formData.password2}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            required
          />

          <button
            type="submit"
            className="bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
          >
            Registrarse
          </button>
        </form>

        {/* Enlace al login */}
        <p className="text-center text-gray-600 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-pink-500 hover:text-pink-700 font-medium underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
