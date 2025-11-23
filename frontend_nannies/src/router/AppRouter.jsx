import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Fallback component para lazy loading
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <p>Cargando...</p>
  </div>
);

// === LAZY LOADING: Vistas de autenticación ===
const Landing = lazy(() => import("@views/Landing"));
const Login = lazy(() => import("@views/auth/Login"));
const Register = lazy(() => import("@views/auth/Register"));
const Verify = lazy(() => import("@views/auth/Verify"));
const ForgotPassword = lazy(() => import("@views/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@views/auth/ResetPassword"));

// === LAZY LOADING: Páginas legales ===
const Terms = lazy(() => import("@views/Terms"));
const Privacy = lazy(() => import("@views/Privacy"));

// === LAZY LOADING: Dashboards por rol ===
const DashboardUser = lazy(() => import("@views/dashboard/DashboardUser"));
const ParentDashboard = lazy(() => import("@views/dashboard/parent/ParentDashboard"));
const NannyDashboard = lazy(() => import("@views/dashboard/nanny/NannyDashboard"));
const AdminDashboard = lazy(() => import("@views/dashboard/admin/AdminDashboard"));

// === LAZY LOADING: Vistas de perfil ===
const ParentProfile = lazy(() => import("@views/profile/ParentProfile"));
const NannyProfile = lazy(() => import("@views/profile/NannyProfile"));
const AdminProfile = lazy(() => import("@views/profile/AdminProfile"));
const Settings = lazy(() => import("@views/Settings"));

// === LAZY LOADING: Catálogo y búsqueda ===
const Catalog = lazy(() => import("@views/Catalog"));
const FavoriteList = lazy(() => import("@views/FavoriteList"));

// === LAZY LOADING: Reservas ===
const MyBookings = lazy(() => import("@views/MyBookings"));
const BookingCreate = lazy(() => import("@views/BookingCreate"));
const AvailabilityManagement = lazy(() => import("@views/AvailabilityManagement"));
const NannyRequests = lazy(() => import("@views/NannyRequests"));
const NannyBookingHistory = lazy(() => import("@views/NannyBookingHistory"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
        {/* ==================== AUTENTICACIÓN ==================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/register/" element={<Register />} />
        <Route path="/verify/:uid/:token/" element={<Verify />} />
        <Route path="/forgot-password/" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token/" element={<ResetPassword />} />

        {/* ==================== PÁGINAS LEGALES ==================== */}
        <Route path="/terms/" element={<Terms />} />
        <Route path="/privacy/" element={<Privacy />} />

        {/* ==================== DASHBOARDS ==================== */}
        {/* Dashboard genérico con redirección por rol */}
        <Route path="/dashboard/" element={<DashboardUser />} />

        {/* Dashboard padre */}
        <Route path="/dashboard/parent/" element={<ParentDashboard />} />

        {/* Dashboard niñera y gestión de perfil */}
        <Route path="/dashboard/nanny/" element={<NannyDashboard />} />

        {/* Dashboard administrador */}
        <Route path="/admin/dashboard/" element={<AdminDashboard />} />

        {/* ==================== PERFILES POR ROL ==================== */}
        {/* Perfil de padre */}
        <Route path="/profile/parent/" element={<ParentProfile />} />

        {/* Perfil de niñera */}
        <Route path="/profile/nanny/" element={<NannyProfile />} />

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
      </Suspense>
    </BrowserRouter>
  );
}
