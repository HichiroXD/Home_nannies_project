import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@api/api";
import { AuthLayout, AuthMessage } from "../components/auth";
import Loader from "../components/layout/Loader";

export default function Verify() {
  const { uid, token } = useParams();
  const [message, setMessage] = useState("Verificando tu cuenta...");
  const [verified, setVerified] = useState(null); // null = aún no verificado
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const response = await API.get(`/users/verify/${uid}/${token}/`);
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
    <div className="min-h-screen flex items-center justify-center bg-pink-100 text-gray-800">
      <AuthLayout title="Verificación de cuenta">
        <AuthMessage type={verified ? "success" : "error"} message={message} />
        {verified === null ? (
          <Loader />
        ) : (
          <button
            onClick={() => navigate(verified ? "/login" : "/register")}
            className={`px-6 py-3 rounded-lg transition ${
              verified
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-gray-400 text-white hover:bg-gray-500"
            }`}
          >
            {verified ? "Ir al Login" : "Volver al Registro"}
          </button>
        )}
      </AuthLayout>
    </div>
  );
}
