import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Verify() {
  const { uid, token } = useParams();
  const [message, setMessage] = useState("Verificando tu cuenta...");
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/users/verify/${uid}/${token}/`
        );
        setMessage(response.data.detail || "✅ Cuenta verificada con éxito 🎉");
        setVerified(true);
      } catch (err) {
        console.error(err);
        setMessage("❌ Enlace inválido o expirado");
        setVerified(false);
      }
    };
    verifyAccount();
  }, [uid, token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-100 text-gray-800">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center w-full max-w-md">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">
          Verificación de cuenta
        </h1>

        <p className="text-lg mb-6">{message}</p>

        {verified ? (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Ir al Login
          </button>
        ) : (
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
          >
            Volver al Registro
          </button>
        )}
      </div>
    </div>
  );
}

export default Verify;
