import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";
import {
  DashboardLayout,
  StatCard,
  QuickLinkButton,
  ActivityItem,
  LogoutButton,
} from "@components/dashboard";
import { PageHeader } from "@components/layout";

export default function AdminDashboard() {
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNannies: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
  });
  const [systemActivity, setSystemActivity] = useState([]);
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

    // Solo administradores pueden acceder
    if (!roleNormalized || roleNormalized !== "admin") {
      navigate("/dashboard/");
    }

    // Simulación de datos - en producción vendría del backend
    loadStats();
    loadSystemActivity();
  }, [navigate]);

  const loadStats = () => {
    setStats({
      totalUsers: 156,
      totalNannies: 42,
      activeBookings: 18,
      monthlyRevenue: 3250,
    });
  };

  const loadSystemActivity = () => {
    setSystemActivity([
      {
        id: 1,
        timestamp: "Hace 30 min",
        title: "Nuevo usuario registrado",
        description: "Juan Pérez (padre) se registró en el sistema",
        icon: "Users",
        color: "#3b82f6",
      },
      {
        id: 2,
        timestamp: "Hace 2 horas",
        title: "Niñera verificada",
        description: "María García completó la verificación",
        icon: "UserCheck",
        color: "#10b981",
      },
      {
        id: 3,
        timestamp: "Hace 4 horas",
        title: "Reserva confirmada",
        description: "Nueva reserva generada: Elena López - 25/11/2025",
        icon: "TrendingUp",
        color: "#f59e0b",
      },
      {
        id: 4,
        timestamp: "Ayer a las 16:45",
        title: "Reporte creado",
        description: "Reporte mensual generado exitosamente",
        icon: "BarChart3",
        color: "#8b5cf6",
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
      Users: Users,
      UserCheck: UserCheck,
      TrendingUp: TrendingUp,
      BarChart3: BarChart3,
    };
    return iconMap[iconName] || AlertCircle;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Panel de Administración"
          description="Gestiona usuarios, niñeras, reservas y métricas del sistema"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Usuarios Totales"
            value={stats.totalUsers}
            icon={Users}
            color="#3b82f6"
            trend={12}
          />
          <StatCard
            title="Niñeras Registradas"
            value={stats.totalNannies}
            icon={UserCheck}
            color="#10b981"
            trend={8}
          />
          <StatCard
            title="Reservas Activas"
            value={stats.activeBookings}
            icon={TrendingUp}
            color="#f59e0b"
            trend={5}
          />
          <StatCard
            title="Ingresos (Mes)"
            value={`$${stats.monthlyRevenue}`}
            icon={BarChart3}
            color="#8b5cf6"
            trend={15}
          />
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickLinkButton
              title="Gestionar Usuarios"
              description="Ver, editar y eliminar usuarios de la plataforma"
              icon={Users}
              to="/admin/users/"
              color="#3b82f6"
            />
            <QuickLinkButton
              title="Gestionar Niñeras"
              description="Verificación, perfiles y gestión de niñeras"
              icon={UserCheck}
              to="/admin/nannies/"
              color="#10b981"
            />
            <QuickLinkButton
              title="Reseñas y Moderación"
              description="Revisar y moderar reseñas y comentarios"
              icon={AlertCircle}
              to="/admin/reviews/"
              color="#f43f5e"
            />
            <QuickLinkButton
              title="Configuración"
              description="Ajustes del sistema y parámetros globales"
              icon={Settings}
              to="/admin/settings/"
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Actividad del Sistema</h2>
          <div className="space-y-4">
            {systemActivity.length > 0 ? (
              systemActivity.map((item) => (
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
              <p className="text-gray-600">No hay actividad registrada</p>
            )}
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Notificaciones Pendientes</h3>
              <p className="text-sm text-yellow-800 mt-1">
                3 niñeras pendientes de verificación, 1 reseña marcada como inapropiada
              </p>
            </div>
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
