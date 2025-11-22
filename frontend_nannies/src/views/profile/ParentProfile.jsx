import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageHeader, Loader, AlertToast, PageContainer } from "@components/layout";
import { ProfileSection, FormInput, FormTextarea } from "@components/profile";
import { User, Mail, Phone, MapPin, Users } from "lucide-react";

export default function ParentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    about: "",
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

    // Simulación: Cargar datos del usuario
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // En producción, llamar a API: const data = await getProfile();
      setProfile({
        firstName: "Juan",
        lastName: "Pérez García",
        email: "juan@example.com",
        phone: "+34 612 345 678",
        address: "Calle Principal 123",
        city: "Madrid",
        about: "Buscamos niñera confiable para nuestros hijos.",
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
              value={profile.email}
              onChange={handleChange}
              disabled={true}
              icon={Mail}
            />
            <FormInput
              label="Teléfono"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="+34 612 345 678"
            />
          </div>
        </ProfileSection>

        {/* Ubicación */}
        <ProfileSection
          title="Ubicación"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Dirección"
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Calle Principal 123"
            />
            <FormInput
              label="Ciudad"
              name="city"
              value={profile.city}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Madrid"
            />
          </div>
        </ProfileSection>

        {/* Acerca de */}
        <ProfileSection
          title="Acerca de Ti"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <FormTextarea
            label="Descripción"
            name="about"
            value={profile.about}
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
