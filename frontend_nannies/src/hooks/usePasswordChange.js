/**
 * Hook Reutilizable - Manejo de Cambio de Contraseña
 */
import { useState } from 'react';
import API from '@api/api';

export function usePasswordChange(onSuccess, onError) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    try {
      // Validaciones
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        onError("Todos los campos son obligatorios");
        return false;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        onError("Las contraseñas no coinciden");
        return false;
      }
      
      if (passwordData.newPassword.length < 8) {
        onError("La contraseña debe tener al menos 8 caracteres");
        return false;
      }

      setSaving(true);
      
      // TODO: Implementar endpoint real cuando esté disponible
      // await API.post('/users/change-password/', {
      //   current_password: passwordData.currentPassword,
      //   new_password: passwordData.newPassword,
      // });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess("✅ Contraseña actualizada correctamente");
      return true;
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      const errorMessage = error.response?.data?.detail || "Error al cambiar la contraseña";
      onError(`❌ ${errorMessage}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetPasswordData = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return {
    passwordData,
    setPasswordData,
    saving,
    handlePasswordChange,
    resetPasswordData,
  };
}
