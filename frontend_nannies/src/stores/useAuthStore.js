/**
 * Auth Store - Zustand
 * 
 * Gestión centralizada de autenticación y estado de usuario
 * 
 * Características:
 * - Single source of truth para auth
 * - Persist middleware (localStorage automático)
 * - Login/logout coordinado
 * - Token refresh automático
 * - Estado de loading
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import logger from '@/utils/logger';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login - Guarda tokens y usuario
       * @param {Object} data - { access, refresh, username, role }
       */
      login: (data) => {
        logger.info('User logged in', { username: data.username, role: data.role });
        
        // Guardar en localStorage individual para compatibilidad con componentes existentes
        localStorage.setItem('accessToken', data.accessToken || data.access);
        localStorage.setItem('refreshToken', data.refreshToken || data.refresh);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.user?.username || data.username);
        
        set({
          user: {
            username: data.username,
            role: data.role
          },
          accessToken: data.accessToken || data.access,
          refreshToken: data.refreshToken || data.refresh,
          role: data.role,
          isAuthenticated: true,
          error: null
        });
      },

      /**
       * Logout - Limpia todo el estado
       */
      logout: () => {
        const { user } = get();
        logger.info('User logged out', { username: user?.username });
        
        // Limpiar localStorage individual
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          isAuthenticated: false,
          error: null
        });
      },

      /**
       * Update User - Actualiza datos del usuario
       * @param {Object} userData - Datos parciales del usuario
       */
      updateUser: (userData) => {
        const { user } = get();
        
        set({
          user: { ...user, ...userData }
        });
      },

      /**
       * Set Tokens - Actualiza tokens (útil para refresh)
       * @param {string} access - Access token
       * @param {string} refresh - Refresh token (opcional)
       */
      setTokens: (access, refresh = null) => {
        const update = { accessToken: access };
        if (refresh) update.refreshToken = refresh;
        
        set(update);
      },

      /**
       * Set Loading - Estado de carga
       * @param {boolean} loading
       */
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      /**
       * Set Error - Error de autenticación
       * @param {string} error
       */
      setError: (error) => {
        logger.error('Auth error', new Error(error));
        set({ error });
      },

      /**
       * Clear Error - Limpiar error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Check Auth - Verifica si está autenticado
       * @returns {boolean}
       */
      checkAuth: () => {
        const { accessToken, isAuthenticated } = get();
        return isAuthenticated && !!accessToken;
      },

      /**
       * Get Token - Obtiene el access token
       * @returns {string|null}
       */
      getToken: () => {
        return get().accessToken;
      },

      /**
       * Get Role - Obtiene el rol del usuario
       * @returns {string|null}
       */
      getRole: () => {
        return get().role;
      }
    }),
    {
      name: 'auth-storage', // Clave en localStorage
      partializefalse: (state) => ({
        // Solo persistir lo necesario
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        isAuthenticated: state.isAuthenticated
        // NO persistir: isLoading, error
      })
    }
  )
);

export default useAuthStore;

// Ejemplos de uso:
/*
import useAuthStore from '@/stores/useAuthStore';

// En componentes
const Login = () => {
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(state => state.isLoading);
  
  const handleLogin = async (credentials) => {
    const data = await loginAPI(credentials);
    login(data);
  };
};

// Leer estado
const Header = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  
  return (
    <div>
      <span>{user?.username}</span>
      <button onClick={logout}>Salir</button>
    </div>
  );
};

// Verificar auth
const ProtectedRoute = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  if (!checkAuth()) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;
};
*/
