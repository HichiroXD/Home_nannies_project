import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageHeader, Loader, AlertToast, PageContainer } from "@components/layout";
import { FormInput, FormTextarea, ChildrenManager } from "@components/profile";
import ImageUploader from "@components/common/ImageUploader";
import { PasswordChangeModal, LoginHistoryModal } from "@/components/security";
import { usePasswordChange, useLoginHistory } from "@/hooks";
import { getMediaUrl } from "@/config/constants";
import { User, Mail, Phone, MapPin, Users, Save, X } from "lucide-react";
import { getParentProfile, updateParentProfile } from "@api/profileApi";
import { getChildren, createChild, updateChild, deleteChild } from "@/api";

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
    profile_photo: null,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [children, setChildren] = useState([]);

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
    
    if (!roleNormalized || 
        (roleNormalized !== "parent" && 
         !roleNormalized.includes("padre") && 
         !roleNormalized.includes("madre"))) {
      navigate("/dashboard/");
      return;
    }

    loadProfile();
    loadChildren();
  }, [navigate]);

  const loadChildren = async () => {
    try {
      const data = await getChildren();
      setChildren(data);
    } catch (error) {
      console.error("Error al cargar hijos:", error);
      // No mostramos error crítico ya que los hijos son opcionales
    }
  };

  const handleAddChild = async (childData) => {
    try {
      const newChild = await createChild(childData);
      setChildren((prev) => [...prev, newChild]);
      setAlert({ type: "success", message: "Hijo agregado correctamente" });
    } catch (error) {
      console.error("Error al agregar hijo:", error);
      setAlert({ type: "error", message: "Error al agregar hijo" });
      throw error;
    }
  };

  const handleUpdateChild = async (childId, childData) => {
    try {
      const updatedChild = await updateChild(childId, childData);
      setChildren((prev) =>
        prev.map((child) => (child.id === childId ? updatedChild : child))
      );
      setAlert({ type: "success", message: "Información actualizada correctamente" });
    } catch (error) {
      console.error("Error al actualizar hijo:", error);
      setAlert({ type: "error", message: "Error al actualizar la información" });
      throw error;
    }
  };

  const handleDeleteChild = async (childId) => {
    try {
      await deleteChild(childId);
      setChildren((prev) => prev.filter((child) => child.id !== childId));
      setAlert({ type: "success", message: "Hijo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar hijo:", error);
      setAlert({ type: "error", message: "Error al eliminar hijo" });
      throw error;
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getParentProfile();
      
      console.log("Datos recibidos del backend:", data);
      
      // Normalizar valores numéricos para evitar arrays
      if (data.children_count !== undefined && data.children_count !== null) {
        data.children_count = Array.isArray(data.children_count) ? data.children_count[0] : data.children_count;
        data.children_count = Number(data.children_count) || 1;
      }
      
      console.log("Datos normalizados:", {
        children_count: data.children_count
      });
      
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
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file) => {
    setProfilePhoto(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log("Profile antes de enviar:", profile);
      
      // Normalizar children_count
      let childrenCountValue = profile.children_count;
      if (Array.isArray(childrenCountValue)) {
        childrenCountValue = childrenCountValue[0];
      }
      childrenCountValue = Number(childrenCountValue) || 1;
      
      console.log("Valores normalizados para enviar:", {
        children_count: childrenCountValue
      });
      
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('first_name', String(profile.first_name || ''));
      formData.append('last_name', String(profile.last_name || ''));
      formData.append('phone', String(profile.phone || ''));
      formData.append('address', String(profile.address || ''));
      formData.append('emergency_contact', String(profile.emergency_contact || ''));
      formData.append('children_count', String(childrenCountValue));
      formData.append('preferences', String(profile.preferences || ''));
      
      // Agregar foto si se seleccionó una nueva
      if (profilePhoto) {
        formData.append('profile_photo', profilePhoto);
      }
      
      console.log("FormData a enviar:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      await updateParentProfile(formData);
      setAlert({ type: "success", message: "Perfil actualizado correctamente" });
      setIsEditing(false);
      setProfilePhoto(null);
      await loadProfile(); // Recargar datos actualizados
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      
      // Extraer mensaje de error específico
      let errorMessage = "Error al guardar el perfil";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Si hay errores de campo específicos
        if (typeof errorData === 'object' && !errorData.detail && !errorData.error) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join('\n');
          errorMessage = `Errores de validación:\n${fieldErrors}`;
        } else {
          errorMessage = errorData.detail || errorData.error || errorMessage;
        }
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePhoto(null);
    loadProfile(); // Recargar datos originales
  };

  if (loading) return <Loader />;

  return (
    <MainLayout>
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Mi Perfil"
              description="Actualiza tu información personal"
            />
            
            {/* Botones de acción globales */}
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

        {alert && (
          <AlertToast
            isVisible={true}
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Información Personal */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
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
                      <p className="text-xs text-gray-500 mt-1">Opcional: Agrega una foto para personalizar tu perfil</p>
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
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Contacto</h2>
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
        </div>

        {/* Ubicación y Emergencias */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ubicación y Emergencias</h2>
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
        </div>

        {/* Información Familiar */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Familiar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Número de Hijos</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {children.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Calculado automáticamente
              </p>
            </div>
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
        </div>

        {/* Gestión de Hijos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Hijos</h2>
          <ChildrenManager
            children={children}
            onAddChild={handleAddChild}
            onUpdateChild={handleUpdateChild}
            onDeleteChild={handleDeleteChild}
            isEditing={isEditing}
          />
        </div>

        {/* Preferencias */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferencias y Notas</h2>
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
        </div>

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
