import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@components/dashboard";
import { PageHeader, Loader, AlertToast } from "@components/layout";
import { ProfileSection, FormInput, FormTextarea } from "@components/profile";
import { Shield, Lock, Bell } from "lucide-react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

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
      // En producción: const data = await getProfile();
      setProfile({
        firstName: "Admin",
        lastName: "Sistema",
        email: "admin@homenannies.com",
        phone: "+34 900 000 000",
        department: "Administración",
        bio: "Administrador del sistema Home Nannies",
      });
    } catch (error) {
      setAlert({ type: "error", message: "Error al cargar el perfil" });
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
      // En producción: await updateProfile(profile);
      setAlert({ type: "success", message: "Perfil actualizado correctamente" });
      setIsEditing(false);
    } catch (error) {
      setAlert({ type: "error", message: "Error al guardar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <DashboardLayout>
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Seguridad
          </h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Cambiar Contraseña
            </button>
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Autenticación de Dos Factores (2FA)
            </button>
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Ver Historial de Acceso
            </button>
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Cerrar Sesiones Activas
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Preferencias de Notificación
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">Alertas de seguridad</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">Reportes de actividad</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">Notificaciones del sistema</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">Emails de notificación</span>
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
