import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import useAuthStore from '@/stores/useAuthStore';
import { getProfile } from '@/api/userApi';

export default function UserProfileMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const menuRef = useRef(null);
  
  const { user, role, logout, updateUser } = useAuthStore(state => ({
    user: state.user,
    role: state.role || localStorage.getItem('role') || "user",
    logout: state.logout,
    updateUser: state.updateUser
  }));
  
  // Determinar el nombre a mostrar: first_name y last_name si existen, sino username
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name
      ? user.first_name
      : user?.username || localStorage.getItem('username') || "Usuario";
  
  // Cargar datos del usuario si no están completos
  useEffect(() => {
    const loadUserData = async () => {
      // Si el usuario no tiene first_name o last_name, intentar cargarlos
      if (user && (!user.first_name || !user.last_name) && !isLoadingUserData) {
        setIsLoadingUserData(true);
        try {
          const userData = await getProfile();
          if (userData.first_name || userData.last_name) {
            updateUser({
              ...user,
              first_name: userData.first_name,
              last_name: userData.last_name
            });
          }
        } catch (error) {
          // Error silencioso, usar username como fallback
          console.log('No se pudieron cargar datos adicionales del usuario');
        } finally {
          setIsLoadingUserData(false);
        }
      }
    };
    
    loadUserData();
  }, [user?.username]); // Solo ejecutar cuando cambie el username

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  const getProfileUrl = () => {
    const roleNormalized = String(role).toLowerCase();
    if (roleNormalized.includes("nanny") || roleNormalized.includes("niñ")) {
      return "/profile/nanny/";
    } else if (roleNormalized === "admin") {
      return "/profile/admin/";
    } else {
      return "/profile/parent/";
    }
  };

  const getDisplayRole = () => {
    const roleNormalized = String(role).toLowerCase();
    if (roleNormalized.includes("nanny") || roleNormalized.includes("niñ")) {
      return "Niñera";
    } else if (roleNormalized === "admin") {
      return "Administrador";
    } else {
      return "Padre/Madre";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón del menú */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all"
      >
        <User className="w-5 h-5" />
        <span className="text-sm font-medium truncate max-w-xs">{displayName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header del menú */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 mt-1">{getDisplayRole()}</p>
          </div>

          {/* Opciones del menú */}
          <div className="py-2">
            {/* Dashboard Admin - Solo para administradores */}
            {String(role).toLowerCase() === "admin" && (
              <button
                onClick={() => {
                  navigate("/admin/dashboard/");
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors flex items-center gap-3"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Control</span>
              </button>
            )}

            {/* Mi Perfil */}
            <button
              onClick={() => {
                navigate(getProfileUrl());
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </button>

            {/* Configuraciones */}
            <button
              onClick={() => {
                navigate("/settings");
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              <span>Configuraciones</span>
            </button>

            {/* Separador */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
