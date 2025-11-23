import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "@api/userApi";
import { AuthLayout, AuthMessage, AuthForm } from "@components/auth";
import { MainLayout, Loader } from "@components/layout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const [formData, setFormData] = useState({
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!formData.password || !formData.password2) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword(uid, token, formData.password, formData.password2);
      setSuccessMessage(
        response.message || 
        "✅ Tu contraseña ha sido restablecida correctamente. Redirigiendo al inicio de sesión..."
      );
      
      setTimeout(() => {
        navigate("/login", { 
          state: { message: "Tu contraseña ha sido actualizada. Ya puedes iniciar sesión." } 
        });
      }, 2500);
    } catch (err) {
      setError(
        err.error || 
        err.detail || 
        "El enlace es inválido o ha expirado. Por favor solicita uno nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: "password",
      type: "password",
      placeholder: "Nueva contraseña",
      value: formData.password,
      onChange: handleChange,
    },
    {
      name: "password2",
      type: "password",
      placeholder: "Confirmar nueva contraseña",
      value: formData.password2,
      onChange: handleChange,
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-center py-8 min-h-[calc(100vh-4rem)]">
        <AuthLayout title="Nueva Contraseña">
          <p className="text-gray-600 text-sm text-center mb-4">
            Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
          </p>
          
          <AuthMessage type="success" message={successMessage} />
          <AuthMessage type="error" message={error} />
          
          <AuthForm 
            fields={fields} 
            onSubmit={handleSubmit} 
            buttonText="Restablecer contraseña" 
            disabled={isLoading}
          />
          
          <div className="text-center mt-4">
            <Link 
              to="/login" 
              className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </AuthLayout>
      </div>
    </MainLayout>
  );
}
