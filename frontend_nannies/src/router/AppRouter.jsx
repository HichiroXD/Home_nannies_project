import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import RoleProtectedRoute from "@components/auth/RoleProtectedRoute";
import LoadingFallback from "@components/common/LoadingFallback";
import ErrorBoundary from "@components/common/ErrorBoundary";
import { useAutoLogout } from "@hooks/useAutoLogout";

// === LAZY LOADING: Vistas de autenticación ===
const Landing = lazy(() => import("@views/Landing"));
const Login = lazy(() => import("@views/auth/Login"));
const Register = lazy(() => import("@views/auth/Register"));
const Verify = lazy(() => import("@views/auth/Verify"));
const ForgotPassword = lazy(() => import("@views/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@views/auth/ResetPassword"));
const Unauthorized = lazy(() => import("@views/Unauthorized"));

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

// === LAZY LOADING: Notificaciones ===
const Notifications = lazy(() => import("@views/Notifications"));

// === LAZY LOADING: Reseñas ===
const ParentReviews = lazy(() => import("@views/reviews/ParentReviews"));
const NannyReviews = lazy(() => import("@views/reviews/NannyReviews"));
const AdminAllReviews = lazy(() => import("@views/reviews/AdminAllReviews"));

// === LAZY LOADING: Chat ===
const ChatView = lazy(() => import("@views/chat/ChatView"));

// Componente interno que usa el hook dentro del contexto del Router
const RouterContent = () => {
  // SPRINT 3: Auto-logout tras 15 minutos de inactividad
  useAutoLogout();
  
  return (
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
        <Route path="/dashboard/parent/" element={
          <RoleProtectedRoute allowedRoles="parent">
            <ParentDashboard />
          </RoleProtectedRoute>
        } />

        {/* Dashboard niñera y gestión de perfil */}
        <Route path="/dashboard/nanny/" element={
          <RoleProtectedRoute allowedRoles="nanny">
            <NannyDashboard />
          </RoleProtectedRoute>
        } />

        {/* Dashboard administrador */}
        <Route path="/admin/dashboard/" element={
          <RoleProtectedRoute allowedRoles="admin">
            <AdminDashboard />
          </RoleProtectedRoute>
        } />

        {/* ==================== PERFILES POR ROL ==================== */}
        {/* Perfil de padre */}
        <Route path="/profile/parent/" element={
          <RoleProtectedRoute allowedRoles="parent">
            <ParentProfile />
          </RoleProtectedRoute>
        } />

        {/* Perfil de niñera */}
        <Route path="/profile/nanny/" element={
          <RoleProtectedRoute allowedRoles="nanny">
            <NannyProfile />
          </RoleProtectedRoute>
        } />

        {/* Perfil de admin */}
        <Route path="/profile/admin/" element={
          <RoleProtectedRoute allowedRoles="admin">
            <AdminProfile />
          </RoleProtectedRoute>
        } />

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
        <Route path="/availability/" element={
          <RoleProtectedRoute allowedRoles="nanny">
            <AvailabilityManagement />
          </RoleProtectedRoute>
        } />

        {/* Ver solicitudes pendientes */}
        <Route path="/requests/" element={
          <RoleProtectedRoute allowedRoles="nanny">
            <NannyRequests />
          </RoleProtectedRoute>
        } />

        {/* Historial de reservas completadas */}
        <Route path="/history/" element={
          <RoleProtectedRoute allowedRoles="nanny">
            <NannyBookingHistory />
          </RoleProtectedRoute>
        } />

        {/* ==================== NOTIFICACIONES ==================== */}
        <Route path="/notifications/" element={<Notifications />} />

        {/* ==================== CHAT/MENSAJERÍA ==================== */}
        {/* Chat para padres y niñeras */}
        <Route path="/chat/" element={
          <RoleProtectedRoute allowedRoles={['parent', 'nanny']}>
            <ChatView />
          </RoleProtectedRoute>
        } />

        {/* ==================== RESEÑAS ==================== */}
        {/* Vista ADMIN: Todas las reseñas del sistema */}
        <Route path="/reviews/admin/all/" element={
          <RoleProtectedRoute allowedRoles="admin">
            <AdminAllReviews />
          </RoleProtectedRoute>
        } />

        {/* Reseñas del padre (las que ha dado) */}
        <Route path="/reviews/parent/" element={
          <RoleProtectedRoute allowedRoles="parent">
            <ParentReviews />
          </RoleProtectedRoute>
        } />

        {/* Reseñas de la niñera (las que ha recibido) */}
        <Route path="/reviews/nanny/" element={
          <RoleProtectedRoute allowedRoles="nanny">
            <NannyReviews />
          </RoleProtectedRoute>
        } />

        {/* ==================== ACCESO NO AUTORIZADO ==================== */}
        <Route path="/unauthorized/" element={<Unauthorized />} />

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Suspense>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <RouterContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
