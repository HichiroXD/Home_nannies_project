import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardLayout,
  TokenDisplay,
  LogoutButton,
} from "@components/dashboard";

export default function Dashboard() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">
        Bienvenido al Dashboard 🚀
      </h1>
      <p className="text-gray-700 mb-6">
        Este es un panel de prueba. Si ves esto después de iniciar sesión,
        significa que el login y la redirección funcionan correctamente.
      </p>
      <TokenDisplay token={token} />
      <LogoutButton onLogout={handleLogout} />
    </DashboardLayout>
  );
}
