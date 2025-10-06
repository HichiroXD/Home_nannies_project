import React, { useState } from "react";
import { registerUser } from "../api/userApi";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validaciones básicas
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrors({});

    // Validaciones frontend
    const newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = "Email no válido";
    if (!validatePassword(form.password))
      newErrors.password =
        "Debe tener al menos 10 caracteres, una mayúscula, una minúscula y un número";
    if (form.password !== form.password2)
      newErrors.password2 = "Las contraseñas no coinciden";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await registerUser(form);
      console.log("Usuario registrado:", data);

      setSuccessMessage(
        "✅ Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión."
      );

      // Limpieza de formulario
      setForm({
        username: "",
        email: "",
        password: "",
        password2: "",
      });
    } catch (err) {
      console.error("Error al registrar:", err);

      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data.email) {
          setErrors({ email: "⚠️ Este correo ya está registrado" });
        } else if (err.response.data.username) {
          setErrors({ username: "⚠️ Este nombre de usuario ya existe" });
        } else {
          setErrors({
            general:
              "❌ Error al registrar usuario. Verifica los datos e inténtalo nuevamente.",
          });
        }
      } else {
        setErrors({
          general:
            "❌ Error de conexión con el servidor. Intenta nuevamente más tarde.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-200 text-gray-900 flex justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Crear cuenta
        </h1>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4 text-center">
            {successMessage}
          </div>
        )}
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 mt-3 focus:ring-2 focus:ring-indigo-400 outline-none"
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={form.username}
            onChange={handleChange}
            required
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}

          {/* Email */}
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 mt-3 focus:ring-2 focus:ring-indigo-400 outline-none"
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}

          {/* Password */}
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 mt-3 focus:ring-2 focus:ring-indigo-400 outline-none"
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}

          {/* Confirm password */}
          <input
            className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 mt-3 focus:ring-2 focus:ring-indigo-400 outline-none"
            type="password"
            name="password2"
            placeholder="Confirmar contraseña"
            value={form.password2}
            onChange={handleChange}
            required
          />
          {errors.password2 && (
            <p className="text-red-500 text-sm mt-1">{errors.password2}</p>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-6 w-full py-3 rounded-lg text-white font-semibold transition ${
              isSubmitting
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
