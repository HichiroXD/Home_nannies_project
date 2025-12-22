import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageHeader, Loader, AlertToast, PageContainer } from "@components/layout";
import { ProfileSection, FormInput, FormTextarea } from "@components/profile";
import ImageUploader from "@components/common/ImageUploader";
import { PasswordChangeModal, LoginHistoryModal } from "@/components/security";
import { usePasswordChange, useLoginHistory } from "@/hooks";
import { getMediaUrl } from "@/config/constants";
import { Star, MapPin, Briefcase, Heart } from "lucide-react";
import { getNannyProfile, updateNannyProfile } from "@api/profileApi";

export default function NannyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    experience_years: 0,
    certifications: "",
    description: "",
    hourly_rate: "",
    age: "",
    rating_avg: 0,
    total_bookings: 0,
    acceptance_rate: null,
    profile_photo: null,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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
    
    if (!roleNormalized || !(roleNormalized.includes("nanny") || roleNormalized.includes("niñ"))) {
      navigate("/dashboard/");
      return;
    }

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getNannyProfile();
      console.log("Datos recibidos del backend:", data);
      console.log("Tipo de hourly_rate:", typeof data.hourly_rate, data.hourly_rate);
      
      // Construir URL completa para la foto de perfil
      if (data.profile_photo) {
        data.profile_photo = getMediaUrl(data.profile_photo);
      }
      
      setProfile(data);
    } catch (error) {
      setAlert({ type: "error", message: "Error al cargar el perfil" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`handleChange - ${name}:`, value, typeof value);
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    setProfilePhoto(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log("Profile antes de enviar:", profile);
      
      // Manejar hourly_rate si es un array (tomar el primer elemento)
      let hourlyRateValue = profile.hourly_rate;
      if (Array.isArray(hourlyRateValue)) {
        hourlyRateValue = hourlyRateValue[0];
      }
      
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('first_name', profile.first_name || '');
      formData.append('last_name', profile.last_name || '');
      formData.append('experience_years', parseInt(profile.experience_years) || 0);
      formData.append('hourly_rate', parseInt(hourlyRateValue) || 0);
      formData.append('description', profile.description || '');
      formData.append('certifications', profile.certifications || '');
      
      if (profile.age) {
        formData.append('age', parseInt(profile.age));
      }
      
      // Agregar foto si se seleccionó una nueva
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
        console.log("Foto agregada al FormData:", profilePhoto.name, profilePhoto.type, profilePhoto.size);
      }
      
      // Debug: Mostrar todos los campos del FormData
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }
      
      await updateNannyProfile(formData);
      setAlert({ type: "success", message: "Perfil actualizado correctamente" });
      setIsEditing(false);
      setProfilePhoto(null);
      await loadProfile(); // Recargar datos actualizados
    } catch (error) {
      console.error("Error completo:", error);
      
      // Mostrar errores de validación específicos si existen
      if (error && typeof error === 'object') {
        const errorMessages = [];
        for (let key in error) {
          if (error.hasOwnProperty(key) && key !== 'detail') {
            errorMessages.push(`${key}: ${error[key]}`);
          }
        }
        if (errorMessages.length > 0) {
          setAlert({ type: "error", message: errorMessages.join(', ') });
        } else {
          setAlert({ type: "error", message: error.detail || "Error al guardar el perfil" });
        }
      } else {
        setAlert({ type: "error", message: "Error al guardar el perfil" });
      }
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
          {/* Foto de perfil - Siempre visible */}
          <div className="mb-6">
            {isEditing ? (
              <ImageUploader
                onImageSelect={handleImageSelect}
                currentImage={profile.profile_photo}
                label="Foto de Perfil"
                maxSizeMB={5}
              />
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Foto de Perfil</p>
                {profile.profile_photo ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={profile.profile_photo}
                      alt="Foto de perfil" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                      key={profile.profile_photo}
                    />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Foto actual</p>
                      <p className="text-xs">Haz clic en "Editar" para cambiarla</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1 text-gray-700">Sin foto de perfil</p>
                      <p className="text-xs">Haz clic en "Editar" para agregar una foto</p>
                      <p className="text-xs text-gray-500 mt-1">Recomendado: Agrega una foto profesional</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={profile.email || ""}
              onChange={handleChange}
              disabled={true}
            />
            <FormInput
              label="Edad"
              name="age"
              type="number"
              value={profile.age || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Ej: 25"
            />
          </div>
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
              name="experience_years"
              type="number"
              value={profile.experience_years || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Ej: 5"
            />
            <FormInput
              label="Tarifa por Hora ($)"
              name="hourly_rate"
              type="number"
              value={profile.hourly_rate || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Ej: 15000"
              maxLength={7}
            />
          </div>
          <div className="mt-4">
            <FormInput
              label="Certificaciones"
              name="certifications"
              value={profile.certifications || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Primeros auxilios, RCP infantil, etc."
            />
          </div>
        </ProfileSection>

        {/* Descripción */}
        <ProfileSection
          title="Sobre Mí"
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onSave={handleSave}
          isSaving={saving}
        >
          <FormTextarea
            label="Descripción"
            name="description"
            value={profile.description || ""}
            onChange={handleChange}
            disabled={!isEditing}
            placeholder="Cuéntanos sobre tu experiencia y por qué te apasiona cuidar niños..."
            rows={5}
          />
        </ProfileSection>

        {/* Estadísticas (Solo lectura) */}
        { !isEditing && (
          <ProfileSection
            title="Estadísticas"
            isEditing={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Calificación</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.rating_avg > 0 ? Number(profile.rating_avg).toFixed(1) : "Sin calificaciones"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">Reservas Completadas</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.total_bookings || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">Tasa de Aceptación</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.acceptance_rate !== null ? `${profile.acceptance_rate}%` : "N/A"}
                </p>
              </div>
            </div>
          </ProfileSection>
        )}

        {/* Acciones de Cuenta */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones de Cuenta</h2>
          <div className="space-y-3">
            <button 
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Ver Notificaciones
            </button>
            <button 
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Cambiar Contraseña
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
              className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingHistory ? 'Cargando...' : 'Ver Historial de Acceso'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/settings')}
              className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              Preferencias de Notificación
            </button>
            <button 
              type="button"
              className="w-full px-4 py-2 text-left border border-red-300 rounded-lg hover:bg-red-50 transition text-red-600 cursor-pointer"
              onClick={() => alert('Funcionalidad próximamente')}
            >
              Eliminar Cuenta
            </button>
          </div>
        </div>
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
          onSave={async () => {
            const success = await performPasswordChange();
            if (success) {
              resetPasswordData();
            }
          }}
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
