import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Componente de redirección de dashboard genérico
 * Redirige al usuario al dashboard correcto según su rol
 */
export default function DashboardUser() {
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener el rol del usuario desde localStorage (usar "role" en lugar de "user_role")
    const userRole = localStorage.getItem("role");

    if (!userRole) {
      // Si no hay rol, redirigir a login
      navigate("/login/", { replace: true });
      return;
    }

    // Redirigir según el rol
    switch (userRole) {
      case "parent":
        navigate("/dashboard/parent/", { replace: true });
        break;
      case "nanny":
        navigate("/dashboard/nanny/", { replace: true });
        break;
      case "admin":
        navigate("/admin/dashboard/", { replace: true });
        break;
      default:
        // Rol desconocido, redirigir a login
        navigate("/login/", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Redirigiendo al dashboard...</p>
    </div>
  );
}
