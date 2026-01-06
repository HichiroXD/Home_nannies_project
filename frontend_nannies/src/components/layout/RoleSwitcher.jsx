import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import useAuthStore from '@/stores/useAuthStore';
import logger from '@/utils/logger';

/**
 * RoleSwitcher - Componente para cambiar entre roles disponibles
 * 
 * Permite a usuarios con múltiples roles (ej: niñera que también es padre)
 * cambiar entre roles para acceder a diferentes funcionalidades
 */
export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRoleConfirm, setShowAddRoleConfirm] = useState(false);
  const menuRef = useRef(null);
  
  const { activeRole, availableRoles, role, switchRole, loadAvailableRoles, addRole } = useAuthStore(state => ({
    activeRole: state.activeRole || state.role,
    availableRoles: state.availableRoles || [],
    role: state.role,
    switchRole: state.switchRole,
    loadAvailableRoles: state.loadAvailableRoles,
    addRole: state.addRole
  }));

  // Cargar roles disponibles al montar
  useEffect(() => {
    loadAvailableRoles();
  }, [loadAvailableRoles]);

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

  const handleSwitchRole = async (newRole) => {
    if (newRole === activeRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await switchRole(newRole);
      logger.info('Role switched successfully', { newRole });
      setIsOpen(false);
      
      // Recargar la página para aplicar cambios en rutas y permisos
      window.location.reload();
    } catch (error) {
      logger.error('Failed to switch role', error);
      alert('Error al cambiar de rol: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    // Determinar qué rol agregar (el opuesto al actual)
    const roleToAdd = role === 'nanny' ? 'parent' : 'nanny';
    
    setIsLoading(true);
    try {
      const result = await addRole(roleToAdd);
      logger.info('Role added successfully', result);
      setShowAddRoleConfirm(false);
      setIsOpen(false);
      
      // Mostrar mensaje de éxito
      alert(`✅ ${result.message}\n\n${result.profile_created ? 'Se ha creado tu nuevo perfil.' : ''}\nAhora puedes cambiar entre roles usando este menú.`);
      
      // Recargar roles disponibles
      await loadAvailableRoles();
    } catch (error) {
      logger.error('Failed to add role', error);
      alert('Error al agregar rol: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar si puede agregar más roles
  const canAddRole = availableRoles.length === 1 && (role === 'parent' || role === 'nanny');
  const roleToAdd = role === 'nanny' ? 'parent' : 'nanny';

  // Mostrar siempre si tiene un rol y puede agregar otro, o si ya tiene múltiples roles
  if (!availableRoles || availableRoles.length === 0) {
    return null;
  }

  const getRoleLabel = (role) => {
    const labels = {
      'parent': 'Padre/Madre',
      'nanny': 'Niñera',
      'admin': 'Administrador'
    };
    return labels[role] || role;
  };

  const getRoleIcon = (role) => {
    return role === 'parent' ? '👨‍👩‍👧' : '👶';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors disabled:opacity-50"
        title={canAddRole ? "Gestionar roles" : "Cambiar rol activo"}
      >
        <span>{getRoleIcon(activeRole)}</span>
        <span>{getRoleLabel(activeRole)}</span>
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {availableRoles.length > 1 && (
            <>
              <div className="px-4 py-2 text-xs text-gray-500 font-semibold border-b border-gray-100">
                Cambiar vista a:
              </div>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleSwitchRole(role)}
                  disabled={isLoading || role === activeRole}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    role === activeRole
                      ? 'bg-pink-50 text-pink-600 cursor-default'
                      : 'text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  <span>{getRoleIcon(role)}</span>
                  <span>{getRoleLabel(role)}</span>
                  {role === activeRole && (
                    <span className="ml-auto text-xs">✓ Actual</span>
                  )}
                </button>
              ))}
            </>
          )}
          
          {/* Opción para agregar nuevo rol */}
          {canAddRole && (
            <>
              {availableRoles.length > 1 && <div className="border-t border-gray-100 my-2"></div>}
              <button
                onClick={() => setShowAddRoleConfirm(true)}
                className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 transition-colors flex items-center gap-2 font-medium"
              >
                <span>➕</span>
                <span>Agregar Rol {getRoleLabel(roleToAdd)}</span>
              </button>
            </>
          )}
          
          {availableRoles.length > 1 && (
            <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 mt-2">
              La vista se recargará al cambiar de rol
            </div>
          )}
        </div>
      )}

      {/* Diálogo de confirmación para agregar rol */}
      {showAddRoleConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowAddRoleConfirm(false)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-md w-11/12 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              {roleToAdd === 'parent' ? '¿Agregar rol de Padre/Madre?' : '¿Agregar rol de Niñera?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {roleToAdd === 'parent' 
                ? 'Al agregar el rol de padre/madre podrás buscar y contratar niñeras para el cuidado de tus hijos. Se creará automáticamente tu perfil de padre/madre.'
                : 'Al agregar el rol de niñera podrás ofrecer tus servicios de cuidado infantil. Se creará automáticamente tu perfil de niñera y podrás gestionar tu disponibilidad.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddRoleConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRole}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Agregando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
