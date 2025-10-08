import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../views/Landing";
import Login from "../views/Login";
import Register from "../views/Register";
import Dashboard from "../views/Dashboard";
import NannyList from "../views/NannyList";
import FavoriteList from "../views/FavoriteList";
import Verify from "../views/Verify";

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
        <Route path="/catalog/" element={<NannyList />} />

        {/* Ruta para ver la lista de niñeras favoritas */}
        <Route path="/favorites/" element={<FavoriteList />} />

        {/* Ruta para verificación de cuenta */}
        <Route path="/verify/:uid/:token/" element={<Verify />} />
        
      </Routes>
    </BrowserRouter>
  );
}
