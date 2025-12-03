import { Navigate, useLocation } from 'react-router-dom';

/**
 * Componente para proteger rutas basado en roles de usuario
 * Redirige a usuarios no autorizados a páginas apropiadas
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene permisos
 * @param {string|Array<string>} props.allowedRoles - Rol(es) permitido(s) para acceder
 * @param {string} props.redirectTo - Ruta de redirección personalizada (opcional)
 */
const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = null 
}) => {
  const location = useLocation();

  // Verificar autenticación
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role');

  // Convertir allowedRoles a array si es string
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Si no está autenticado, redirigir a login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si el usuario tiene el rol permitido
  const hasRequiredRole = userRole && rolesArray.includes(userRole.toLowerCase());

  if (!hasRequiredRole) {
    // Redirigir a página personalizada o a unauthorized
    const destination = redirectTo || '/unauthorized';
    return <Navigate to={destination} state={{ from: location, requiredRole: rolesArray }} replace />;
  }

  // Usuario tiene permisos, renderizar children
  return children;
};

export default RoleProtectedRoute;
