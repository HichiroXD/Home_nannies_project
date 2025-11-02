import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "@api/userApi";
import { AuthLayout, AuthMessage, AuthForm } from "../components/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(username, password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      navigate("/catalog");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Credenciales incorrectas. Intenta nuevamente.");
      } else if (err.response?.status === 403) {
        setError("Tu cuenta aún no está verificada. Revisa tu correo.");
      } else {
        setError("Ocurrió un error al iniciar sesión. Inténtalo más tarde.");
      }
    }
  };

  const fields = [
    {
      name: "username",
      type: "text",
      placeholder: "Nombre de usuario",
      value: username,
      onChange: (e) => setUsername(e.target.value),
    },
    {
      name: "password",
      type: "password",
      placeholder: "Contraseña",
      value: password,
      onChange: (e) => setPassword(e.target.value),
    },
  ];

  return (
    <AuthLayout title="Iniciar Sesión">
      <AuthMessage type="info" message={infoMessage} />
      <AuthMessage type="error" message={error} />
      <AuthForm fields={fields} onSubmit={handleLogin} buttonText="Entrar" />
      <p className="text-center text-gray-600 text-sm mt-6">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-pink-500 hover:text-pink-700 font-medium underline">
          Regístrate aquí
        </Link>
      </p>
    </AuthLayout>
  );
}
