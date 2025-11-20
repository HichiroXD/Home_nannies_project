import { BrowserRouter, Routes, Route } from "react-router-dom";
// Vistas de autenticación
import Landing from "@views/Landing";
import Login from "@views/auth/Login";
import Register from "@views/auth/Register";
import Verify from "@views/auth/Verify";

// Vistas de dashboard según rol
import DashboardUser from "@views/dashboard/DashboardUser";
import ParentDashboard from "@views/dashboard/ParentDashboard";
import NannyDashboard from "@views/dashboard/NannyDashboard";
import AdminDashboard from "@views/dashboard/AdminDashboard";
import NannyProfile from "@views/dashboard/NannyProfile";

// Vistas de perfil según rol
import ParentProfile from "@views/profile/ParentProfile";
import NannyProfileView from "@views/profile/NannyProfile";
import AdminProfile from "@views/profile/AdminProfile";
import Settings from "@views/Settings";

// Vistas de catálogo y búsqueda
import Catalog from "@views/Catalog";
import FavoriteList from "@views/FavoriteList";

// Vistas de reservas - Padre
import MyBookings from "@views/MyBookings";
import BookingCreate from "@views/BookingCreate";

// Vistas de reservas - Niñera (Fase 0)
import AvailabilityManagement from "@views/AvailabilityManagement";
import NannyRequests from "@views/NannyRequests";
import NannyBookingHistory from "@views/NannyBookingHistory";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== AUTENTICACIÓN ==================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/register/" element={<Register />} />
        <Route path="/verify/:uid/:token/" element={<Verify />} />

        {/* ==================== DASHBOARDS ==================== */}
        {/* Dashboard genérico con redirección por rol */}
        <Route path="/dashboard/" element={<DashboardUser />} />

        {/* Dashboard padre */}
        <Route path="/dashboard/parent/" element={<ParentDashboard />} />

        {/* Dashboard niñera y gestión de perfil */}
        <Route path="/dashboard/nanny/" element={<NannyDashboard />} />
        <Route path="/dashboard/nanny/profile" element={<NannyProfile />} />

        {/* Dashboard administrador */}
        <Route path="/admin/dashboard/" element={<AdminDashboard />} />

        {/* ==================== PERFILES POR ROL ==================== */}
        {/* Perfil de padre */}
        <Route path="/profile/parent/" element={<ParentProfile />} />

        {/* Perfil de niñera */}
        <Route path="/profile/nanny/" element={<NannyProfileView />} />

        {/* Perfil de admin */}
        <Route path="/profile/admin/" element={<AdminProfile />} />

        {/* ==================== CONFIGURACIONES ==================== */}
        <Route path="/settings/" element={<Settings />} />

        {/* ==================== CATÁLOGO Y BÚSQUEDA ==================== */}
        <Route path="/catalog/" element={<Catalog />} />
        <Route path="/favorites/" element={<FavoriteList />} />

        {/* ==================== RESERVAS - PADRE ==================== */}
        <Route path="/bookings/" element={<MyBookings />} />
        <Route path="/bookings/create/:nannyId" element={<BookingCreate />} />

        {/* ==================== RESERVAS - NIÑERA (FASE 0) ==================== */}
        {/* Gestionar disponibilidades */}
        <Route path="/availability/" element={<AvailabilityManagement />} />

        {/* Ver solicitudes pendientes */}
        <Route path="/requests/" element={<NannyRequests />} />

        {/* Historial de reservas completadas */}
        <Route path="/history/" element={<NannyBookingHistory />} />

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
