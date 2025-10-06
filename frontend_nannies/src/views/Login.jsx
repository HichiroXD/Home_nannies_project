import { useState } from "react";
import { loginUser } from "../api/userApi";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor ingresa tu usuario y contraseña.");
      return;
    }

    try {
      const data = await loginUser(username, password);

      // ✅ Guarda correctamente los tokens
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      console.log("Login exitoso:", data);
      alert(`✅ Bienvenido ${data.username}`);

      navigate("/dashboard");
    } catch (err) {
      console.error("Error en login:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setError("Credenciales inválidas. Verifica tu usuario o contraseña.");
      } else if (err.response?.status === 403) {
        setError("Tu cuenta no está verificada.");
      } else {
        setError("Error al iniciar sesión. Intenta nuevamente.");
      }
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
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="text-red-500 text-sm mt-3 text-center">
                {error}
              </div>
            )}

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
