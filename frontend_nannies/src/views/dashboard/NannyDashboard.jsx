import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  FileText,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  DashboardLayout,
  StatCard,
  QuickLinkButton,
  ActivityItem,
  LogoutButton,
} from "@components/dashboard";
import { PageHeader } from "@components/layout";

export default function NannyDashboard() {
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    availableSlots: 0,
    pendingRequests: 0,
    completedBookings: 0,
    averageRating: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
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

    // Simulación de datos - en producción vendría del backend
    loadStats();
    loadActivity();
  }, [navigate]);

  const loadStats = () => {
    setStats({
      availableSlots: 12,
      pendingRequests: 2,
      completedBookings: 24,
      averageRating: 4.8,
    });
  };

  const loadActivity = () => {
    setRecentActivity([
      {
        id: 1,
        timestamp: "Hoy a las 10:30",
        title: "Solicitud pendiente",
        description: "Ana García solicitó tu disponibilidad para el 25/11/2025",
        icon: "Clock",
        color: "#f59e0b",
      },
      {
        id: 2,
        timestamp: "Ayer a las 18:00",
        title: "Reserva completada",
        description: "Reserva con familia López finalizada con éxito",
        icon: "FileText",
        color: "#10b981",
      },
      {
        id: 3,
        timestamp: "Hace 2 días",
        title: "Nueva reseña",
        description: "Te dieron 5 estrellas: Excelente cuidado y dedicación",
        icon: "Star",
        color: "#f43f5e",
      },
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getActivityIcon = (iconName) => {
    const iconMap = {
      Clock: Clock,
      FileText: FileText,
      Star: Star,
    };
    return iconMap[iconName] || Clock;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Panel de Niñera"
          description="Gestiona tu disponibilidad, solicitudes y reservas"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Franjas Disponibles"
            value={stats.availableSlots}
            icon={Calendar}
            color="#3b82f6"
            trend={5}
          />
          <StatCard
            title="Solicitudes Pendientes"
            value={stats.pendingRequests}
            icon={Clock}
            color="#f59e0b"
            trend={0}
          />
          <StatCard
            title="Reservas Completadas"
            value={stats.completedBookings}
            icon={FileText}
            color="#10b981"
            trend={15}
          />
          <StatCard
            title="Calificación Promedio"
            value={`${stats.averageRating}★`}
            icon={Star}
            color="#f43f5e"
            trend={2}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickLinkButton
              title="Gestionar Disponibilidad"
              description="Define tus franjas horarias disponibles"
              icon={Calendar}
              to="/availability/"
              color="#3b82f6"
            />
            <QuickLinkButton
              title="Solicitudes Pendientes"
              description="Revisa y responde solicitudes de reserva"
              icon={Clock}
              to="/requests/"
              color="#f59e0b"
            />
            <QuickLinkButton
              title="Historial de Reservas"
              description="Consulta tus reservas pasadas y actuales"
              icon={FileText}
              to="/history/"
              color="#10b981"
            />
          </div>
        </div>

        {/* Profile Quick Link */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tu Perfil</h3>
              <p className="text-gray-600 text-sm mt-1">Actualiza tu información personal y foto de perfil</p>
            </div>
            <button
              onClick={() => navigate("/profile/nanny/")}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium"
            >
              Ver Perfil
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <ActivityItem
                  key={item.id}
                  timestamp={item.timestamp}
                  title={item.title}
                  description={item.description}
                  icon={getActivityIcon(item.icon)}
                  color={item.color}
                />
              ))
            ) : (
              <p className="text-gray-600">No hay actividad reciente</p>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">¿Cómo funciona?</h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
              <span>Añade tus franjas de disponibilidad en "Gestionar Disponibilidad"</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
              <span>Los padres verán tus franjas y harán solicitudes de reserva</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
              <span>Revisa solicitudes en "Solicitudes Pendientes" y acepta o rechaza</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
              <span>Consulta tu historial y las reseñas que dejan los padres</span>
            </li>
          </ol>
        </div>

        {/* Logout */}
        <div className="flex justify-end pt-4">
          <LogoutButton onLogout={handleLogout} />
        </div>
      </div>
    </DashboardLayout>
  );
}
