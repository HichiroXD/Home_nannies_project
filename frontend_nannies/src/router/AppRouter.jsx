import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../views/Login";
import Register from "../views/Register";
import Dashboard from "../views/Dashboard";
import Home from "../views/home";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de registro */}
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Ruta por defecto (redirigir a login si no existe) */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
