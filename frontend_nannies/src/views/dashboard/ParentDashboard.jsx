import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Heart,
  Clock,
  MapPin,
  LogOut,
  AlertCircle,
} from "lucide-react";
import {
  DashboardLayout,
  StatCard,
  QuickLinkButton,
  ActivityItem,
  LogoutButton,
} from "@components/dashboard";
import { PageHeader } from "@components/layout";

export default function ParentDashboard() {
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    activeBookings: 0,
    favorites: 0,
    upcomingBookings: 0,
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

    // Solo padres pueden acceder a este dashboard
    if (
      !roleNormalized ||
      (roleNormalized !== "parent" && !roleNormalized.includes("padre") && !roleNormalized.includes("madre"))
    ) {
      navigate("/dashboard/");
    }

    // Simulación de datos - en producción vendría del backend
    loadStats();
    loadActivity();
  }, [navigate]);

  const loadStats = () => {
    setStats({
      activeBookings: 2,
      favorites: 5,
      upcomingBookings: 1,
    });
  };

  const loadActivity = () => {
    setRecentActivity([
      {
        id: 1,
        timestamp: "Hoy a las 14:30",
        title: "Reserva aceptada",
        description: "María García aceptó tu solicitud de cuidado el 25/11/2025",
        icon: "CheckCircle",
        color: "#10b981",
      },
      {
        id: 2,
        timestamp: "Ayer a las 10:15",
        title: "Agregada a favoritos",
        description: "Ahora sigues a Teresa López",
        icon: "Heart",
        color: "#f43f5e",
      },
      {
        id: 3,
        timestamp: "Hace 2 días",
        title: "Reserva completada",
        description: "Reserva con Elena Rodríguez finalizada",
        icon: "CheckCircle",
        color: "#06b6d4",
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
      CheckCircle: Clock,
      Heart: Heart,
    };
    return iconMap[iconName] || AlertCircle;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Panel de Padres"
          description="Encuentra y reserva a las mejores niñeras para tus hijos"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Reservas Activas"
            value={stats.activeBookings}
            icon={BookOpen}
            color="#3b82f6"
            trend={10}
          />
          <StatCard
            title="Favoritos"
            value={stats.favorites}
            icon={Heart}
            color="#f43f5e"
            trend={20}
          />
          <StatCard
            title="Próximas Reservas"
            value={stats.upcomingBookings}
            icon={Clock}
            color="#f59e0b"
            trend={0}
          />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickLinkButton
              title="Ver Catálogo"
              description="Busca y explora niñeras disponibles"
              icon={MapPin}
              to="/catalog/"
              color="#3b82f6"
            />
            <QuickLinkButton
              title="Mis Favoritos"
              description="Accede a tus niñeras favoritas"
              icon={Heart}
              to="/favorites/"
              color="#f43f5e"
            />
            <QuickLinkButton
              title="Mis Reservas"
              description="Gestiona tus reservas y horarios"
              icon={Clock}
              to="/bookings/"
              color="#10b981"
            />
            <QuickLinkButton
              title="Mi Perfil"
              description="Actualiza tu información personal"
              icon={BookOpen}
              to="/dashboard/profile"
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Activity Feed */}
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

        {/* Logout */}
        <div className="flex justify-end pt-4">
          <LogoutButton onLogout={handleLogout} />
        </div>
      </div>
    </DashboardLayout>
  );
}
