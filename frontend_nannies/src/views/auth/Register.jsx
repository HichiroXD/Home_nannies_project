import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@api/userApi";
import { AuthLayout, AuthMessage, AuthForm } from "@components/auth";
import { MainLayout, Loader } from "@components/layout";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "parent",
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

    if (formData.password !== formData.password2) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerUser(formData);

      if (response.status === 201) {
        setSuccessMessage(
          "Tu cuenta ha sido creada correctamente. Se ha enviado un correo para verificar tu cuenta antes de iniciar sesión."
        );

        setFormData({
          username: "",
          email: "",
          role: "parent",
          password: "",
          password2: "",
        });

        setTimeout(() => navigate("/login"), 3500);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const details = Object.values(err.response.data).flat().join(" ");
        setError(details || "Error en los datos ingresados. Revisa la información.");
      } else {
        setError("Ocurrió un error al registrar la cuenta. Intenta más tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    {
      name: "username",
      type: "text",
      placeholder: "Nombre de usuario",
      value: formData.username,
      onChange: handleChange,
    },
    {
      name: "email",
      type: "email",
      placeholder: "Correo electrónico",
      value: formData.email,
      onChange: handleChange,
    },
    {
      name: "role",
      type: "select",
      value: formData.role,
      onChange: handleChange,
      options: [
        { value: "parent", label: "Padre / Madre" },
        { value: "nanny", label: "Niñera" },
      ],
    },
    {
      name: "password",
      type: "password",
      placeholder: "Contraseña",
      value: formData.password,
      onChange: handleChange,
    },
    {
      name: "password2",
      type: "password",
      placeholder: "Confirmar contraseña",
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
        <AuthLayout title="Crear cuenta">
          <AuthMessage type="success" message={successMessage} />
          <AuthMessage type="error" message={error} />
          <AuthForm fields={fields} onSubmit={handleSubmit} buttonText="Registrarse" />
          
          {/* Link a términos y condiciones */}
          <p className="text-xs text-gray-500 text-center mt-3">
            Al registrarte, aceptas nuestros{" "}
            <Link to="/terms" className="text-pink-600 hover:text-pink-700 underline">
              Términos y Condiciones
            </Link>
            {" "}y nuestra{" "}
            <Link to="/privacy" className="text-pink-600 hover:text-pink-700 underline">
              Política de Privacidad
            </Link>
          </p>
          
          <p className="text-center text-gray-600 text-sm mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-pink-500 hover:text-pink-700 font-medium underline">
              Inicia sesión aquí
            </Link>
          </p>
        </AuthLayout>
      </div>
    </MainLayout>
  );
}