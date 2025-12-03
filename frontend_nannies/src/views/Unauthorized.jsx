import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

/**
 * Página 403/404 para usuarios que intentan acceder a rutas sin permisos
 * Muestra información clara sobre el error y opciones de navegación
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const requiredRole = location.state?.requiredRole || [];

  const getRoleText = (role) => {
    const roleMap = {
      'nanny': 'niñera',
      'parent': 'padre/madre',
      'admin': 'administrador'
    };
    return roleMap[role] || role;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h1 className="text-6xl font-bold text-gray-800 mb-2">403</h1>
            <h2 className="text-2xl font-semibold text-gray-700">
              Acceso No Autorizado
            </h2>
          </div>

          <div className="space-y-3 text-gray-600">
            <p className="text-base">
              No tienes permisos para acceder a esta página.
            </p>
            
            {requiredRole.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">
                  Esta página requiere rol de:
                </p>
                <p className="text-base font-semibold text-red-900 mt-1">
                  {requiredRole.map(getRoleText).join(' o ')}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Si crees que esto es un error, contacta al administrador.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleGoBack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Ir al inicio
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <p className="mt-6 text-sm text-gray-500">
          ¿Necesitas ayuda? <a href="/contact" className="text-blue-600 hover:underline">Contáctanos</a>
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
