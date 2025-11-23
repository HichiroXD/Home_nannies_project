import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageHeader, Loader, AlertToast, PageContainer } from "@components/layout";
import { ProfileSection, FormInput, FormTextarea } from "@components/profile";
import { User, Mail, Phone, MapPin, Users } from "lucide-react";
import { getParentProfile, updateParentProfile } from "@api/profileApi";

export default function ParentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    emergency_contact: "",
    children_count: 1,
    preferences: "",
    total_bookings: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const roleNormalized = role ? String(role).toLowerCase() : null;
    
    if (!roleNormalized || 
        (roleNormalized !== "parent" && 
         !roleNormalized.includes("padre") && 
         !roleNormalized.includes("madre"))) {
      navigate("/dashboard/");
      return;
    }

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getParentProfile();
      setProfile(data);
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
      await updateParentProfile(profile);
      setAlert({ type: "success", message: "Perfil actualizado correctamente" });
      setIsEditing(false);
      await loadProfile(); // Recargar datos actualizados
    } catch (error) {
      setAlert({ type: "error", message: error.detail || "Error al guardar el perfil" });
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
            title="Mi Perfil"
            description="Actualiza tu información personal"
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
              name="first_name"
              value={profile.first_name || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <FormInput
              label="Apellidos"
              name="last_name"
              value={profile.last_name || ""}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </ProfileSection>

        {/* Contacto */}
        <ProfileSection
          title="Información de Contacto"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={profile.email || ""}
              onChange={handleChange}
              disabled={true}
              icon={Mail}
            />
            <FormInput
              label="Teléfono"
              name="phone"
              type="tel"
              value={profile.phone || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="+34 612 345 678"
            />
          </div>
        </ProfileSection>

        {/* Ubicación y Emergencias */}
        <ProfileSection
          title="Ubicación y Emergencias"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Dirección"
              name="address"
              value={profile.address || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Calle Principal 123"
            />
            <FormInput
              label="Contacto de Emergencia"
              name="emergency_contact"
              value={profile.emergency_contact || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Nombre y teléfono de emergencia"
            />
          </div>
        </ProfileSection>

        {/* Información Familiar */}
        <ProfileSection
          title="Información Familiar"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Número de Niños"
              name="children_count"
              type="number"
              value={profile.children_count || 1}
              onChange={handleChange}
              disabled={!isEditing}
              min="1"
            />
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Reservas Realizadas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {profile.total_bookings || 0}
              </p>
            </div>
          </div>
        </ProfileSection>

        {/* Preferencias */}
        <ProfileSection
          title="Preferencias y Notas"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <FormTextarea
            label="Preferencias"
            name="preferences"
            value={profile.preferences || ""}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Cuéntanos sobre ti y qué buscas en una niñera..."
            maxLength={500}
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Máximo 500 caracteres
          </p>
        </ProfileSection>

        {/* Acciones de Cuenta */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones de Cuenta</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Cambiar Contraseña
            </button>
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Preferencias de Notificación
            </button>
            <button className="w-full px-4 py-2 text-left border border-red-300 rounded-lg hover:bg-red-50 transition text-red-600">
              Eliminar Cuenta
            </button>
          </div>
        </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
}
