import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNannies } from "../api/nannyApi"; // tu API actual
import { Heart } from "lucide-react";

export default function NannyList() {
  const [nannies, setNannies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNannies = async () => {
      try {
        const data = await getNannies();
        setNannies(data);
      } catch (err) {
        setError("No se pudieron cargar las niñeras.");
      } finally {
        setLoading(false);
      }
    };
    fetchNannies();
  }, []);

  const handleBookingClick = (nannyId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      // 🔒 No autenticado → redirigir al login con mensaje
      localStorage.setItem("redirect_after_login", `/catalog?nanny=${nannyId}`);
      navigate("/login", { state: { fromCatalog: true } });
      return;
    }

    // ✅ Si está autenticado → continuar con flujo de reserva
    navigate(`/bookings/create/${nannyId}`);
  };

  if (loading) return <p className="text-center mt-10">Cargando niñeras...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-pink-50 py-10">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">
        Catálogo de Niñeras
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
        {nannies.map((nanny) => (
          <div
            key={nanny.id}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {nanny.username}
              </h2>
              <button className="text-pink-500 hover:text-pink-600">
                <Heart size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-sm">{nanny.email}</p>
            <p className="mt-2 text-gray-700">
              <strong>Rol:</strong> {nanny.role === "nanny" ? "Niñera" : "Otro"}
            </p>

            <button
              onClick={() => handleBookingClick(nanny.id)}
              className="mt-4 bg-pink-500 text-white w-full py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Agendar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
