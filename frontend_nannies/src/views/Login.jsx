import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    // Si venía un mensaje desde otra página (por ejemplo, al intentar agendar)
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/users/login/", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("role", response.data.role);

      navigate("/catalog"); // o /dashboard si lo prefieres
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Iniciar Sesión</h1>

        {/* Mensaje informativo */}
        {infoMessage && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            {infoMessage}
          </div>
        )}

        {/* Error de inicio de sesión */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            required
          />
          <button
            type="submit"
            className="bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
          >
            Entrar
          </button>
        </form>

        {/* Enlace al registro */}
        <p className="text-center text-gray-600 text-sm mt-6">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-pink-500 hover:text-pink-700 font-medium underline"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
