import { useNavigate } from "react-router-dom";
import { NotificationCenter } from "@components/layout";

export default function HeaderLanding({ isLoggedIn, username }) {
  const navigate = useNavigate();
  const rawRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const role = rawRole ? String(rawRole).toLowerCase() : null;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-pink-100/50 shadow-sm">
      <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
        <h1 
          onClick={() => navigate("/")} 
          className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent cursor-pointer hover:from-pink-700 hover:to-rose-600 transition-all duration-300"
        >
          🏠 Home Nannies
        </h1>
        <div className="space-x-2 md:space-x-4 flex items-center">
          {isLoggedIn && (
            <>
              <button
                onClick={() => navigate("/catalog")}
                className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
              >
                Catálogo
              </button>
              {(role && (role.includes("nanny") || role.includes("niñ"))) && (
                <button
                  onClick={() => navigate("/dashboard/nanny/")}
                  className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
                >
                  Panel Niñera
                </button>
              )}
              <button
                onClick={() => navigate("/favorites")}
                className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
              >
                Favoritos
              </button>
              <button
                onClick={() => navigate("/bookings")}
                className="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200"
              >
                Mis Reservas
              </button>
            </>
          )}
          {isLoggedIn ? (
            <div className="flex items-center space-x-3 md:space-x-4 border-l border-gray-200 pl-3 md:pl-4">
              {/* Centro de Notificaciones */}
              <NotificationCenter />
              
              <div className="flex items-center space-x-2">
                <img
                  src={`https://ui-avatars.com/api/?name=${username}&background=f472b6&color=fff&bold=true`}
                  alt="Profile"
                  className="w-9 h-9 rounded-full ring-2 ring-pink-200 hover:ring-pink-400 transition-all duration-200"
                />
                <span className="hidden md:inline text-gray-700 font-medium">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 md:px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 md:px-6 py-2 text-sm font-semibold border-2 border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 hover:border-pink-600 transition-all duration-300"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
