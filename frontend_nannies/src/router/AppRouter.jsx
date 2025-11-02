import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../../views/Landing";
import Login from "../../views/auth/Login";
import Register from "../../views/auth/Register";
import Dashboard from "../views/Dashboard";
import Catalog from "../views/Catalog";
import FavoriteList from "../views/FavoriteList";
import Verify from "../../views/auth/Verify";

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
        <Route path="/dashboard/" element={<Dashboard />} />

        {/* Ruta para ver la lista de niñeras */}
        <Route path="/catalog/" element={<Catalog />} />

        {/* Ruta para ver la lista de niñeras favoritas */}
        <Route path="/favorites/" element={<FavoriteList />} />

        {/* Ruta para verificación de cuenta */}
        <Route path="/verify/:uid/:token/" element={<Verify />} />
        
      </Routes>
    </BrowserRouter>
  );
}
