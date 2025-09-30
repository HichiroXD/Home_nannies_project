import React, { useState } from "react";
import { registerUser } from "../api/userApi"; // ajusta la ruta según tu estructura

function Register() {
  // Estado del formulario
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de validación
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Validaciones
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/.test(password);

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (submitted) {
      if (name === "email") {
        setEmailError(validateEmail(value) ? "" : "Email no válido");
      }
      if (name === "password") {
        setPasswordError(
          validatePassword(value)
            ? ""
            : "La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula y un número"
        );
        setConfirmError(
          confirmPassword && value !== confirmPassword
            ? "Las contraseñas no coinciden"
            : ""
        );
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (submitted) {
      setConfirmError(
        form.password !== e.target.value ? "Las contraseñas no coinciden" : ""
      );
    }
  };

  // Manejo de envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const emailValid = validateEmail(form.email);
    const passwordValid = validatePassword(form.password);
    const confirmValid = form.password === confirmPassword;

    setEmailError(emailValid ? "" : "Email no válido");
    setPasswordError(
      passwordValid
        ? ""
        : "La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula y un número"
    );
    setConfirmError(confirmValid ? "" : "Las contraseñas no coinciden");

    if (!emailValid || !passwordValid || !confirmValid) return;

    try {
      const data = await registerUser(form);
      console.log("Usuario registrado:", data);
      alert("✅ Registro exitoso, ahora inicia sesión");
    } catch (err) {
      console.error(err);
      alert("❌ Error al registrar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-pink-200 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-40 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <h1 className="text-2xl xl:text-3xl font-bold text-center">
            Regístrate
          </h1>

          <form className="mt-8 mx-auto max-w-xs" onSubmit={handleSubmit}>
            {/* Usuario */}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="text"
              name="username"
              placeholder="Usuario"
              value={form.username}
              onChange={handleChange}
              required
            />

            {/* Email */}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {submitted && emailError && (
              <div className="text-red-500 text-sm mt-1">{emailError}</div>
            )}

            {/* Contraseña */}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            {submitted && passwordError && (
              <div className="text-red-500 text-sm mt-1">{passwordError}</div>
            )}

            {/* Confirmar contraseña */}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            {submitted && confirmError && (
              <div className="text-red-500 text-sm mt-1">{confirmError}</div>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition"
              disabled={!!emailError || !!passwordError || !!confirmError}
            >
              Registro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
