import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import Loader from "@/components/layout/Loader";
import AlertToast from "@/components/layout/AlertToast";
import { Bell, Lock, Eye, Volume2, RefreshCw } from "lucide-react";
import { PasswordChangeModal, LoginHistoryModal } from "@/components/security";
import { usePasswordChange, useLoginHistory } from "@/hooks";
import useAuthStore from "@/stores/useAuthStore";

function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const refreshUserData = useAuthStore(state => state.refreshUserData);
  const userRole = useAuthStore(state => state.role);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    profileVisibility: "public",
    soundNotifications: true,
  });

  // Hooks personalizados para seguridad
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Simular carga de configuraciones
    setLoading(false);
  }, [navigate]);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setAlert({ type: "success", message: "Configuración actualizada" });
  };

  const handleSelectChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setAlert({ type: "success", message: "Preferencia guardada" });
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
      setShowSessionsModal(true);
    }
  };

  const handleSyncUserData = async () => {
    setSyncing(true);
    try {
      await refreshUserData();
      setAlert({ 
        type: "success", 
        message: `Datos sincronizados. Rol actual: ${userRole || 'desconocido'}` 
      });
    } catch (error) {
      setAlert({ 
        type: "error", 
        message: "Error al sincronizar datos del usuario" 
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Configuraciones"
          description="Personaliza tu experiencia en Home Nannies"
        />

        {alert && (
          <AlertToast
            isVisible={true}
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notificaciones
          </h2>
          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-600">Recibe emails sobre tu actividad</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle("emailNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-600">Alertas en tiempo real en tu navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle("pushNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Notificaciones SMS</p>
                <p className="text-sm text-gray-600">Mensajes de texto para alertas importantes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle("smsNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sound Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sonidos</p>
                <p className="text-sm text-gray-600">Sonido para notificaciones</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundNotifications}
                  onChange={() => handleToggle("soundNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Ver Notificaciones Button */}
            <button 
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-full px-4 py-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-medium flex items-center justify-center gap-2"
            >
              <Bell className="w-5 h-5" />
              Ver Todas las Notificaciones
            </button>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            Privacidad
          </h2>
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Visibilidad del Perfil
              </label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSelectChange("profileVisibility", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="public">Público (Visible para todos)</option>
                <option value="private">Privado (Solo yo)</option>
                <option value="friends">Amigos (Solo amigos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Seguridad
          </h2>
          <div className="space-y-4">
            {/* Change Password */}
            <button 
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <p className="font-medium text-gray-900">Cambiar Contraseña</p>
              <p className="text-sm text-gray-600 mt-1">Actualiza tu contraseña regularmente</p>
            </button>

            {/* Two Factor Auth */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-300">
              <div>
                <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
                <p className="text-sm text-gray-600">Añade una capa extra de seguridad</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle("twoFactorAuth")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* Sync User Data */}
            <button 
              type="button"
              onClick={handleSyncUserData}
              disabled={syncing}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    Sincronizar Datos
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Actualiza tu información desde el servidor (Rol actual: {userRole || 'cargando...'})
                  </p>
                </div>
                {syncing && (
                  <span className="text-sm text-blue-600 font-medium">Sincronizando...</span>
                )}
              </div>
            </button>

            {/* Active Sessions */}
            <button 
              type="button"
              onClick={handleLoadHistory}
              disabled={loadingHistory}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <p className="font-medium text-gray-900">
                {loadingHistory ? 'Cargando...' : 'Sesiones Activas'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Ver y cerrar tus sesiones activas</p>
            </button>
          </div>
        </div>

        {/* Zona de Peligro */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Zona de Peligro</h2>
          <p className="text-red-700 mb-4">Estas acciones son irreversibles. Ten cuidado.</p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Eliminar Cuenta Permanentemente
          </button>
        </div>

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
          isOpen={showSessionsModal}
          onClose={() => setShowSessionsModal(false)}
          loginHistory={loginHistory}
        />
      </div>
    </MainLayout>
  );
}

export default Settings;
