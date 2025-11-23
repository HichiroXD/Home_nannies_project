import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "@api/userApi";
import { AuthLayout, AuthMessage, AuthForm } from "@components/auth";
import { MainLayout, Loader } from "@components/layout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!email) {
      setError("Por favor ingresa tu correo electrónico");
      setIsLoading(false);
      return;
    }

    try {
      const response = await requestPasswordReset(email);
      setSuccessMessage(
        response.message || 
        "Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña."
      );
      setEmail("");
    } catch (err) {
      setError(
        err.error || 
        err.detail || 
        "Ocurrió un error al procesar tu solicitud. Intenta más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: "email",
      type: "email",
      placeholder: "Correo electrónico",
      value: email,
      onChange: (e) => {
        setEmail(e.target.value);
        setError("");
      },
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-center py-8 min-h-[calc(100vh-4rem)]">
        <AuthLayout title="Recuperar Contraseña">
          <p className="text-gray-600 text-sm text-center mb-4">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          
          <AuthMessage type="success" message={successMessage} />
          <AuthMessage type="error" message={error} />
          
          <AuthForm 
            fields={fields} 
            onSubmit={handleSubmit} 
            buttonText="Enviar enlace" 
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
