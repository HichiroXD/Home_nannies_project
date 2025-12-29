import { useNavigate, useLocation } from "react-router-dom";
import { NotificationCenter, UserProfileMenu } from "@components/layout";

export default function HeaderLanding({ isLoggedIn, username }) {
  const navigate = useNavigate();
  const location = useLocation();
  const rawRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const role = rawRole ? String(rawRole).toLowerCase() : null;
  
  // Detectar si estamos en páginas de autenticación
  const isAuthPage = ['/login/', '/register/', '/forgot-password/', '/reset-password/'].some(
    path => location.pathname.startsWith(path.replace(/\/$/, ''))
  );

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-white shadow-md">
      <h1 
        onClick={() => navigate("/")} 
        className="text-2xl font-bold text-pink-600 cursor-pointer hover:text-pink-700"
      >
        Home Nannies
      </h1>
      <div className="space-x-4 flex items-center">
        {isLoggedIn && (
          <>
            {/* Dashboard según rol */}
            {role === 'parent' && (
              <button
                onClick={() => navigate("/dashboard/parent/")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                Mi Dashboard
              </button>
            )}
            {(role && (role.includes("nanny") || role.includes("niñ"))) && (
              <button
                onClick={() => navigate("/dashboard/nanny/")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                Mi Dashboard
              </button>
            )}
            {role === 'admin' && (
              <button
                onClick={() => navigate("/admin/dashboard/")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                Panel Admin
              </button>
            )}
            
            <button
              onClick={() => navigate("/catalog")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Catálogo
            </button>
            <button
              onClick={() => navigate("/favorites")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Favoritos
            </button>
            <button
              onClick={() => navigate("/bookings")}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
            >
              Mis Reservas
            </button>
            {(role && (role.includes("nanny") || role.includes("niñ"))) && (
              <button
                onClick={() => navigate("/reviews/nanny/")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                Mis Reseñas
              </button>
            )}
          </>
        )}
        {isLoggedIn ? (
          <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
            {/* Centro de Notificaciones */}
            <NotificationCenter />
            
            {/* Menú de Perfil */}
            <UserProfileMenu />
          </div>
        ) : (
          !isAuthPage && (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors duration-300"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 text-sm font-medium border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50"
              >
                Registrarse
              </button>
            </>
          )
        )}
      </div>
    </header>
  );
}
