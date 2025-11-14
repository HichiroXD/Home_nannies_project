import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@views/Landing";
import Login from "@views/auth/Login";
import Register from "@views/auth/Register";
import Verify from "@views/auth/Verify";
import DashboardUser from "@views/dashboard/DashboardUser";
import Catalog from "@views/Catalog";
import FavoriteList from "@views/FavoriteList";
import MyBookings from "@views/MyBookings";
import BookingCreate from "@views/BookingCreate";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta de la página de inicio */}
        <Route path="/" element={<Landing />} />

        {/* Ruta de login */}
        <Route path="/login/" element={<Login />} />

        {/* Ruta de registro */}
        <Route path="/register/" element={<Register />} />

        {/* Ruta del dashboard */}
        <Route path="/dashboard/" element={<DashboardUser />} />

        {/* Ruta para ver la lista de niñeras */}
        <Route path="/catalog/" element={<Catalog />} />

        {/* Ruta para ver la lista de niñeras favoritas */}
        <Route path="/favorites/" element={<FavoriteList />} />

        {/* Ruta para ver y gestionar mis reservas */}
        <Route path="/bookings/" element={<MyBookings />} />
  {/* Ruta para crear una reserva seleccionando disponibilidad */}
  <Route path="/bookings/create/:nannyId" element={<BookingCreate />} />

        {/* Ruta para verificación de cuenta */}
        <Route path="/verify/:uid/:token/" element={<Verify />} />

        {/* Ruta para manejo de rutas no encontradas */}
        <Route path="*" element={<h1>404 Not Found</h1>} />

        {/* Dashboards según rol */}
        
        
      </Routes>
    </BrowserRouter>
  );
}
