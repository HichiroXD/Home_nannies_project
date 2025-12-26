import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageHeader, Loader, AlertToast, PageContainer } from "@components/layout";
import { ProfileSection, FormInput, FormTextarea } from "@components/profile";
import { Shield, Lock, Bell } from "lucide-react";
import { PasswordChangeModal, LoginHistoryModal } from "@/components/security";
import { usePasswordChange, useLoginHistory } from "@/hooks";
import API from "@api/api";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    bio: "",
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_booking_events: true,
    email_verification_events: true,
    email_ocr_events: true,
    in_app_notifications: true,
  });
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  // Hooks personalizados para funcionalidad de seguridad
  const {
    passwordData,
    setPasswordData,
    saving: savingPassword,
    handlePasswordChange: performPasswordChange,
    resetPasswordData,
  } = usePasswordChange(
    (message) => {
      setAlert({ type: "success", message });
      setShowPasswordModal(false);
    },
    (message) => setAlert({ type: "error", message })
  );

  const {
    loginHistory,
    loadingHistory,
    loadLoginHistory,
  } = useLoginHistory(
    (message) => setAlert({ type: "error", message })
  );

  useEffect(() => {
    const role = localStorage.getItem("role");
    const roleNormalized = role ? String(role).toLowerCase() : null;
    
    if (!roleNormalized || roleNormalized !== "admin") {
      navigate("/dashboard/");
      return;
    }

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del perfil
      // TODO: Implementar endpoint real de perfil cuando esté listo
      setProfile({
        firstName: "Admin",
        lastName: "Sistema",
        email: "admin@homenannies.com",
        phone: "+34 900 000 000",
        department: "Administración",
        bio: "Administrador del sistema Home Nannies",
      });
      
      // Cargar preferencias de notificación reales
      try {
        const prefsResponse = await API.get('/notifications/preferences/');
        if (prefsResponse.data && prefsResponse.data.length > 0) {
          const prefs = prefsResponse.data[0];
          setNotificationPrefs({
            email_booking_events: prefs.email_booking_events ?? true,
            email_verification_events: prefs.email_verification_events ?? true,
            email_ocr_events: prefs.email_ocr_events ?? true,
            in_app_notifications: prefs.in_app_notifications ?? true,
          });
        }
      } catch (prefsError) {
        console.warn("No se pudieron cargar las preferencias:", prefsError);
        // Usar valores por defecto si hay error
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Error al cargar el perfil";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validaciones básicas
      if (!profile.firstName?.trim()) {
        throw new Error("El nombre es obligatorio");
      }
      if (!profile.lastName?.trim()) {
        throw new Error("El apellido es obligatorio");
      }
      
      // TODO: Implementar llamada real al API cuando esté lista
      // const response = await API.put('/users/profile/', profile);
      // setProfile(response.data);
      
      setAlert({ type: "success", message: "Perfil actualizado correctamente" });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      const errorMessage = error.message || error.response?.data?.detail || "Error al guardar el perfil";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (key) => {
    try {
      setLoadingPrefs(true);
      
      const newPrefs = {
        ...notificationPrefs,
        [key]: !notificationPrefs[key],
      };
      
      // Actualizar en el backend
      await API.patch('/notifications/preferences/', newPrefs);
      
      // Si tiene éxito, actualizar el estado local
      setNotificationPrefs(newPrefs);
      setAlert({ type: "success", message: "✅ Preferencias actualizadas correctamente" });
      
    } catch (error) {
      console.error("Error al actualizar preferencias:", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Error al actualizar preferencias";
      setAlert({ type: "error", message: `❌ ${errorMessage}` });
      
      // Revertir el cambio en caso de error
      await loadProfile();
    } finally {
      setLoadingPrefs(false);
    }
  };

  const handlePasswordChangeClick = async () => {
    const success = await performPasswordChange();
    if (success) {
      resetPasswordData();
    }
  };

  const handleLoadHistory = async () => {
    const success = await loadLoginHistory();
    if (success) {
      setShowHistoryModal(true);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cerrar todas las sesiones activas? Tendrás que iniciar sesión nuevamente.')) {
      return;
    }
    
    try {
      setSaving(true);
      // TODO: Implementar endpoint para cerrar todas las sesiones
      // await API.post('/users/logout-all/');
      
      setAlert({ type: "success", message: "✅ Todas las sesiones han sido cerradas" });
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        localStorage.clear();
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error("Error al cerrar sesiones:", error);
      setAlert({ type: "error", message: "Error al cerrar las sesiones" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <PageContainer>
        <div className="space-y-6">
          <PageHeader
            title="Mi Perfil de Administrador"
            description="Gestiona tu información de administrador"
          />

        {alert && (
          <AlertToast
            isVisible={true}
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Información Personal */}
        <ProfileSection
          title="Información Personal"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nombre"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            <FormInput
              label="Apellidos"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              disabled={true}
            />
            <FormInput
              label="Teléfono"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </ProfileSection>

        {/* Información Laboral */}
        <ProfileSection
          title="Información Laboral"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <FormInput
            label="Departamento"
            name="department"
            value={profile.department}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <FormTextarea
            label="Biografía"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Cuéntanos sobre ti..."
            maxLength={500}
            rows={4}
          />
        </ProfileSection>

        {/* Permisos y Acceso */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Permisos y Acceso
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Gestión de Usuarios</span>
              <span className="text-green-600 font-semibold">✓ Permitido</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Gestión de Niñeras</span>
              <span className="text-green-600 font-semibold">✓ Permitido</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Moderación de Contenido</span>
              <span className="text-green-600 font-semibold">✓ Permitido</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Acceso a Reportes</span>
              <span className="text-green-600 font-semibold">✓ Permitido</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Configuración del Sistema</span>
              <span className="text-green-600 font-semibold">✓ Permitido</span>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-lg shadow-md p-6 relative z-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Seguridad
          </h2>
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => {
                console.log('Click en Ver Notificaciones');
                navigate('/notifications');
              }}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-between group cursor-pointer relative z-10"
            >
              <span className="text-gray-700 group-hover:text-gray-900">Ver Notificaciones</span>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-between group cursor-pointer relative z-10"
            >
              <span className="text-gray-700 group-hover:text-gray-900">Cambiar Contraseña</span>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </button>
            <button 
              type="button"
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
              disabled
            >
              <span className="text-gray-500">Autenticación de Dos Factores (2FA)</span>
              <span className="text-xs text-gray-400 block mt-1">Próximamente</span>
            </button>
            <button 
              type="button"
              onClick={async () => {
                const success = await loadLoginHistory();
                if (success) {
                  setShowHistoryModal(true);
                }
              }}
              disabled={loadingHistory}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-between group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative z-10"
            >
              <span className="text-gray-700 group-hover:text-gray-900">
                {loadingHistory ? 'Cargando...' : 'Ver Historial de Acceso'}
              </span>
              <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </button>
            <button 
              type="button"
              onClick={() => {
                console.log('Click en Cerrar Sesiones');
                handleLogoutAllSessions();
              }}
              disabled={saving}
              className="w-full px-4 py-3 text-left border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition flex items-center justify-between group disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative z-10"
            >
              <span className="font-medium">
                {saving ? 'Cerrando sesiones...' : 'Cerrar Sesiones Activas'}
              </span>
              <span className="group-hover:text-red-700">⚠️</span>
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Preferencias de Notificación
          </h2>
          {loadingPrefs && (
            <div className="text-sm text-gray-500 mb-3">Actualizando...</div>
          )}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={notificationPrefs.email_verification_events}
                onChange={() => handleNotificationChange('email_verification_events')}
                disabled={loadingPrefs}
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">Eventos de verificación</span>
                <p className="text-xs text-gray-500 mt-1">Recibir emails sobre verificación de usuarios y documentos</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={notificationPrefs.email_booking_events}
                onChange={() => handleNotificationChange('email_booking_events')}
                disabled={loadingPrefs}
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">Eventos de reservas</span>
                <p className="text-xs text-gray-500 mt-1">Recibir emails sobre nuevas reservas y cancelaciones</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={notificationPrefs.email_ocr_events}
                onChange={() => handleNotificationChange('email_ocr_events')}
                disabled={loadingPrefs}
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">Eventos OCR</span>
                <p className="text-xs text-gray-500 mt-1">Recibir emails sobre procesamiento de documentos OCR</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={notificationPrefs.in_app_notifications}
                onChange={() => handleNotificationChange('in_app_notifications')}
                disabled={loadingPrefs}
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">Notificaciones en la aplicación</span>
                <p className="text-xs text-gray-500 mt-1">Mostrar notificaciones dentro de la plataforma</p>
              </div>
            </label>
          </div>
        </div>
        </div> {/* Cierre de space-y-6 */}

        {/* Modales Reutilizables */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            resetPasswordData();
          }}
          passwordData={passwordData}
          onPasswordDataChange={setPasswordData}
          onSave={handlePasswordChangeClick}
          saving={savingPassword}
        />

        <LoginHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          loginHistory={loginHistory}
        />
      </PageContainer>
    </MainLayout>
  );
}
