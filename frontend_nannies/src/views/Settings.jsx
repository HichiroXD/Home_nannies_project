import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@components/dashboard";
import { PageHeader, Loader, AlertToast } from "@components/layout";
import { Bell, Lock, Eye, Volume2 } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    profileVisibility: "public",
    soundNotifications: true,
  });

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

  if (loading) return <Loader />;

  return (
    <DashboardLayout>
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
            <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition">
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

            {/* Active Sessions */}
            <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <p className="font-medium text-gray-900">Sesiones Activas</p>
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
      </div>
    </DashboardLayout>
  );
}
