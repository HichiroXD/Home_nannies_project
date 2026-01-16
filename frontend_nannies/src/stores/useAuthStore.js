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
import { API_CONFIG } from '@/config/api.config';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      activeRole: null, // Rol actualmente activo
      availableRoles: [], // Roles disponibles para el usuario
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login - Guarda tokens y usuario
       * @param {Object} data - { access, refresh, username, first_name, last_name, role, active_role, available_roles }
       */
      login: (data) => {
        const accessToken = data.accessToken || data.access;
        const refreshToken = data.refreshToken || data.refresh;
        
        logger.info('User logged in', { 
          username: data.username, 
          role: data.role, 
          activeRole: data.active_role,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        
        // Guardar en localStorage individual para compatibilidad con componentes existentes
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('role', data.active_role || data.role);
        localStorage.setItem('username', data.user?.username || data.username);
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('accessToken');
        if (!savedToken) {
          logger.error('Failed to save access token to localStorage');
        } else {
          logger.debug('Access token saved successfully', { tokenPreview: savedToken.substring(0, 20) + '...' });
        }
        
        set({
          user: {
            username: data.username,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role
          },
          accessToken: data.accessToken || data.access,
          refreshToken: data.refreshToken || data.refresh,
          role: data.active_role || data.role,
          activeRole: data.active_role || data.role,
          availableRoles: data.available_roles || [data.role],
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
        
        // Limpiar estado persistido de Zustand
        localStorage.removeItem('auth-storage');
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          activeRole: null,
          availableRoles: [],
          isAuthenticated: false,
          error: null
        });
      },
      
      /**
       * Update User - Actualiza los datos del usuario en el store
       * @param {Object} userData - Datos actualizados del usuario
       */
      updateUser: (userData) => {
        set({
          user: userData
        });
      },
      
      /**
       * Switch Role - Cambia el rol activo del usuario
       * @param {string} newRole - Nuevo rol ('parent' | 'nanny')
       */
      switchRole: async (newRole) => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('No hay sesión activa');
          }
          
          logger.info('Switching role', { from: get().activeRole || get().role, to: newRole });
          
          const response = await fetch(`${API_CONFIG.baseURL}/users/switch-role/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ role: newRole })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            logger.error('Switch role failed', { error: errorData });
            throw new Error(errorData.error || 'Error al cambiar rol');
          }
          
          const data = await response.json();
          logger.info('Role switched successfully', { 
            activeRole: data.active_role,
            availableRoles: data.available_roles,
            response: data
          });
          
          // Actualizar rol activo y disponibles
          set({
            activeRole: data.active_role,
            availableRoles: data.available_roles,
            role: data.active_role // Actualizar role para compatibilidad
          });
          
          // Actualizar en localStorage para que persista
          localStorage.setItem('role', data.active_role);
          
          logger.info('Store updated', { 
            newState: {
              activeRole: get().activeRole,
              role: get().role,
              availableRoles: get().availableRoles
            }
          });
          
          return data;
        } catch (error) {
          logger.error('Failed to switch role', error);
          set({ error: error.message });
          throw error;
        }
      },
      
      /**
       * Load Available Roles - Carga los roles disponibles del usuario
       */
      loadAvailableRoles: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            return;
          }
          
          const response = await fetch(`${API_CONFIG.baseURL}/users/available-roles/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Error al cargar roles');
          }
          
          const data = await response.json();
          
          set({
            activeRole: data.active_role,
            availableRoles: data.available_roles,
            role: data.active_role || data.role
          });
          
          return data;
        } catch (error) {
          logger.error('Failed to load available roles', error);
        }
      },
      
      /**
       * Add Role - Agrega un rol adicional al usuario
       * @param {string} newRole - Rol a agregar ('parent' | 'nanny')
       */
      addRole: async (newRole) => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            throw new Error('No hay sesión activa');
          }
          
          const response = await fetch(`${API_CONFIG.baseURL}/users/add-role/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ role: newRole })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al agregar rol');
          }
          
          const data = await response.json();
          logger.info('Role added successfully', { newRole, availableRoles: data.available_roles });
          
          // Actualizar roles disponibles
          set({
            availableRoles: data.available_roles
          });
          
          return data;
        } catch (error) {
          logger.error('Failed to add role', error);
          throw error;
        }
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
      },

      /**
       * Refresh User Data - Obtiene datos actualizados del usuario desde el backend
       * Útil para sincronizar cambios hechos desde el admin
       * @returns {Promise<void>}
       */
      refreshUserData: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            logger.warn('No access token available for refreshing user data');
            return;
          }

          // Importar dinámicamente para evitar circular dependency
          const { getProfile } = await import('@/api/userApi');
          const userData = await getProfile();
          
          logger.info('User data refreshed', { 
            username: userData.username, 
            role: userData.role,
            activeRole: userData.active_role,
            availableRoles: userData.available_roles
          });
          
          // Actualizar rol en localStorage para compatibilidad
          const activeRole = userData.active_role || userData.role;
          if (activeRole) {
            localStorage.setItem('role', activeRole);
          }
          
          set({
            user: {
              username: userData.username,
              role: userData.role
            },
            role: activeRole,
            activeRole: activeRole,
            availableRoles: userData.available_roles || [userData.role]
          });
        } catch (error) {
          logger.error('Failed to refresh user data', error);
          set({ error: error.message });
        }
      }
    }),
    {
      name: 'auth-storage', // Clave en localStorage
      partialize: (state) => ({
        // Solo persistir lo necesario
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        activeRole: state.activeRole,
        availableRoles: state.availableRoles,
        isAuthenticated: state.isAuthenticated
        // NO persistir: isLoading, error
      }),
      onRehydrateStorage: () => (state) => {
        // Validar consistencia al restaurar estado desde localStorage
        if (state) {
          const localToken = localStorage.getItem('accessToken');
          const localRole = localStorage.getItem('role');
          
          // Si el estado dice que está autenticado pero no hay token, limpiar estado
          if (state.isAuthenticated && (!localToken || !state.accessToken)) {
            logger.warn('State inconsistency detected - clearing auth state');
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.role = null;
            state.isAuthenticated = false;
            localStorage.removeItem('auth-storage');
          }
          // Sincronizar role si hay discrepancia
          else if (state.role && localRole && state.role !== localRole) {
            logger.warn('Role mismatch detected - syncing from localStorage');
            state.role = localRole;
          }
        }
      }
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
