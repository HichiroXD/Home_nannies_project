import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@components/dashboard";
import { PageHeader, Loader, AlertToast } from "@components/layout";
import { ProfileSection, FormInput, FormTextarea } from "@components/profile";
import { Star, MapPin, Briefcase, Heart } from "lucide-react";

export default function NannyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    experience: "",
    certifications: "",
    bio: "",
    specialties: "",
    hourlyRate: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const roleNormalized = role ? String(role).toLowerCase() : null;
    
    if (!roleNormalized || !(roleNormalized.includes("nanny") || roleNormalized.includes("niñ"))) {
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
        firstName: "María",
        lastName: "García López",
        email: "maria@example.com",
        phone: "+34 645 123 456",
        city: "Barcelona",
        experience: "5 años de experiencia",
        certifications: "Primeros auxilios, RCP infantil",
        bio: "Me encanta cuidar niños. Paciente, responsable y comprometida.",
        specialties: "Recién nacidos, niños pequeños",
        hourlyRate: "15",
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
          title="Mi Perfil de Niñera"
          description="Completa tu información para que los padres te encuentren"
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
              placeholder="+34 645 123 456"
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
          <FormInput
            label="Ciudad"
            name="city"
            value={profile.city}
            onChange={handleChange}
            disabled={!isEditing}
            icon={MapPin}
            placeholder="Barcelona"
          />
        </ProfileSection>

        {/* Experiencia Profesional */}
        <ProfileSection
          title="Experiencia Profesional"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Años de Experiencia"
              name="experience"
              value={profile.experience}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="5 años de experiencia"
            />
            <FormInput
              label="Certificaciones"
              name="certifications"
              value={profile.certifications}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Primeros auxilios, RCP..."
            />
          </div>
        </ProfileSection>

        {/* Especialidades y Servicios */}
        <ProfileSection
          title="Especialidades y Servicios"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Especialidades (ej: Recién nacidos, niños..."
              name="specialties"
              value={profile.specialties}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Recién nacidos, niños pequeños"
            />
            <FormInput
              label="Tarifa por Hora (€)"
              name="hourlyRate"
              type="number"
              value={profile.hourlyRate}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="15"
            />
          </div>
        </ProfileSection>

        {/* Biografía */}
        <ProfileSection
          title="Acerca de Ti"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <FormTextarea
            label="Biografía"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Cuéntanos sobre ti, tu pasión por el cuidado infantil, tus valores..."
            maxLength={1000}
            rows={5}
          />
          <p className="text-xs text-gray-500">
            Máximo 1000 caracteres
          </p>
        </ProfileSection>

        {/* Información Pública */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Tu Perfil Público
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✓ Calificación promedio: <strong className="text-blue-600">4.8 estrellas</strong></p>
            <p>✓ Total de reseñas: <strong>24 reseñas</strong></p>
            <p>✓ Reservas completadas: <strong>18 reservas</strong></p>
            <p>✓ Tasa de aceptación: <strong>95%</strong></p>
          </div>
        </div>

        {/* Acciones de Cuenta */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones de Cuenta</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Cambiar Contraseña
            </button>
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Verificación de Identidad
            </button>
            <button className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              Documentos y Certificados
            </button>
            <button className="w-full px-4 py-2 text-left border border-red-300 rounded-lg hover:bg-red-50 transition text-red-600">
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
