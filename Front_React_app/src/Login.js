import React, { useState } from "react";
import { loginUser } from "./userApi";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (submitted) {
      setEmailError(validateEmail(e.target.value) ? "" : "Email no válido");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (submitted) {
      setPasswordError(
        validatePassword(e.target.value)
          ? ""
          : "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
      );
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    setEmailError(emailValid ? "" : "Email no válido");
    setPasswordError(
      passwordValid
        ? ""
        : "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
    );

    if (!emailValid || !passwordValid) return;

    try {
      const data = await loginUser(email, password);
      console.log("Login exitoso:", data);
      alert("Bienvenido " + email);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-pink-200 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-40 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <h1 className="text-2xl xl:text-3xl font-extrabold text-center">
            Iniciar sesión
          </h1>
          <form className="mt-8 mx-auto max-w-xs" onSubmit={handleSubmit}>
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {submitted && emailError && (
              <div className="text-red-500 text-sm mt-1">{emailError}</div>
            )}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {submitted && passwordError && (
              <div className="text-red-500 text-sm mt-1">{passwordError}</div>
            )}
            <button
              type="submit"
              className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700"
            >
              Iniciar sesión
            </button>
          </form>
          <div className="mt-4 text-center">
            <a
              href="/forgot-password"
              className="text-indigo-600 hover:underline text-sm"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
