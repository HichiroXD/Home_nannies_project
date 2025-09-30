import React, { useState } from "react";
import { loginUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";

function Login() {
  // Estados de formulario
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // Handler de password sin validación
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Submit simplificado
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) return;

    try {
      const data = await loginUser(username, password);
      localStorage.setItem("accessToken", data.token);
      console.log("Login exitoso:", data);
      alert("✅ Bienvenido " + username);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Credenciales inválidas");
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
            {/* Username */}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* Password */}
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
              required
            />

            {/* Botón */}
            <button
              type="submit"
              className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700 transition"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
