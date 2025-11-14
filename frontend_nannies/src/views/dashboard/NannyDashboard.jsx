import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, FileText, LogOut } from "lucide-react";
import DashboardLayout from "@components/dashboard/DashboardLayout";

export default function NannyDashboard() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    const roleNormalized = role ? String(role).toLowerCase() : null;

    if (!token) {
      navigate("/login");
      return;
    }

    setUserRole(role);

    // Si no es niñera, redirigir al dashboard general (acepta 'nanny' o 'niñera')
    if (!roleNormalized || !(roleNormalized.includes("nanny") || roleNormalized.includes("niñ"))) {
      navigate("/dashboard/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menuItems = [
    {
      title: "Gestionar Disponibilidad",
      description: "Define tus franjas horarias disponibles",
      icon: Calendar,
      path: "/availability/",
      color: "bg-blue-500",
    },
    {
      title: "Solicitudes Pendientes",
      description: "Revisa y responde a las solicitudes de reserva",
      icon: Clock,
      path: "/requests/",
      color: "bg-yellow-500",
    },
    {
      title: "Historial de Reservas",
      description: "Consulta todas tus reservas pasadas y actuales",
      icon: FileText,
      path: "/history/",
      color: "bg-green-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Panel de Niñera
        </h1>
        <p className="text-gray-600">
          Gestiona tu disponibilidad, solicitudes y historial de reservas
        </p>
        <div className="mt-4">
          <button
            onClick={() => navigate('/dashboard/nanny/profile')}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Ver Perfil
          </button>
        </div>
      </div>

      {/* Grid de opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 text-left"
            >
              <div
                className={`${item.color} text-white rounded-lg p-3 mb-4 w-fit group-hover:scale-110 transition`}
              >
                <IconComponent size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </button>
          );
        })}
      </div>

      {/* Sección de información útil */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          ¿Cómo funciona?
        </h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">1.</span>
            <span>
              Primero, añade tus franjas de disponibilidad en el apartado
              "Gestionar Disponibilidad"
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">2.</span>
            <span>
              Los padres podrán ver tus franjas y hacer solicitudes de reserva
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">3.</span>
            <span>
              Revisa las solicitudes en "Solicitudes Pendientes" y acepta o
              rechaza
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">4.</span>
            <span>
              Consulta tu historial de reservas y las reseñas que dejan los
              padres
            </span>
          </li>
        </ul>
      </div>

      {/* Botón de logout */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </DashboardLayout>
  );
}
