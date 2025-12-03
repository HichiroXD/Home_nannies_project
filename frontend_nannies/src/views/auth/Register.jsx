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
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Validar requisitos de contraseña en tiempo real
  const passwordRequirements = {
    minLength: formData.password.length >= 10,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Validaciones del lado del cliente
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError("❌ Por favor, completa todos los campos obligatorios.");
      return;
    }
    
    if (formData.username.length < 3) {
      setError("❌ El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    
    if (formData.username.length > 150) {
      setError("❌ El nombre de usuario no puede exceder 150 caracteres.");
      return;
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("❌ Por favor, ingresa un correo electrónico válido.");
      return;
    }
    
    // Validación de contraseña
    if (formData.password.length < 10) {
      setError("❌ La contraseña debe tener al menos 10 caracteres.");
      return;
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      setError("❌ La contraseña debe contener al menos una letra mayúscula.");
      return;
    }
    
    if (!/[a-z]/.test(formData.password)) {
      setError("❌ La contraseña debe contener al menos una letra minúscula.");
      return;
    }
    
    if (!/[0-9]/.test(formData.password)) {
      setError("❌ La contraseña debe contener al menos un número.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError("❌ La contraseña debe contener al menos un carácter especial.");
      return;
    }
    
    if (formData.password !== formData.password2) {
      setError("❌ Las contraseñas no coinciden. Por favor, verifica que sean iguales.");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await registerUser(formData);

      if (response.status === 201) {
        setSuccessMessage(
          "✅ ¡Cuenta creada exitosamente! Se ha enviado un correo de verificación. Revisa tu bandeja de entrada (y spam) antes de iniciar sesión."
        );

        setFormData({
          username: "",
          email: "",
          role: "parent",
          password: "",
          password2: "",
        });

        setTimeout(() => navigate("/login", { state: { message: "Cuenta creada. Por favor, verifica tu correo antes de iniciar sesión." } }), 3500);
      }
    } catch (err) {
      console.error("Error en registro:", err);
      
      const status = err.response?.status;
      const errorData = err.response?.data || {};
      
      if (status === 400) {
        // Errores de validación específicos
        if (errorData.username) {
          const usernameError = Array.isArray(errorData.username) ? errorData.username[0] : errorData.username;
          if (usernameError.toLowerCase().includes("already exists") || usernameError.toLowerCase().includes("ya existe")) {
            setError("❌ Este nombre de usuario ya está en uso. Por favor, elige otro.");
          } else {
            setError(`❌ Nombre de usuario: ${usernameError}`);
          }
        } else if (errorData.email) {
          const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
          if (emailError.toLowerCase().includes("already exists") || emailError.toLowerCase().includes("ya existe")) {
            setError("❌ Este correo electrónico ya está registrado. ¿Quizás ya tienes una cuenta?");
          } else if (emailError.toLowerCase().includes("invalid") || emailError.toLowerCase().includes("válido")) {
            setError("❌ El formato del correo electrónico no es válido.");
          } else {
            setError(`❌ Correo electrónico: ${emailError}`);
          }
        } else if (errorData.password) {
          const passwordError = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password;
          if (passwordError.toLowerCase().includes("common") || passwordError.toLowerCase().includes("común")) {
            setError("❌ La contraseña es demasiado común. Elige una más segura.");
          } else if (passwordError.toLowerCase().includes("numeric") || passwordError.toLowerCase().includes("numérica")) {
            setError("❌ La contraseña no puede ser completamente numérica.");
          } else if (passwordError.toLowerCase().includes("short") || passwordError.toLowerCase().includes("corta")) {
            setError("❌ La contraseña es demasiado corta. Debe tener al menos 8 caracteres.");
          } else {
            setError(`❌ Contraseña: ${passwordError}`);
          }
        } else if (errorData.detail) {
          setError(`❌ ${errorData.detail}`);
        } else {
          // Si hay múltiples errores, concatenarlos
          const allErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorMsg = Array.isArray(errors) ? errors[0] : errors;
              return `${field}: ${errorMsg}`;
            })
            .join(". ");
          setError(`❌ ${allErrors || "Error en los datos ingresados. Revisa la información."}`);
        }
      } else if (status === 409) {
        setError("❌ Ya existe una cuenta con estos datos. Intenta iniciar sesión.");
      } else if (status === 429) {
        setError("⏱️ Demasiados intentos de registro. Por favor, espera unos minutos e intenta nuevamente.");
      } else if (status >= 500) {
        setError("🔧 Error en el servidor. Por favor, intenta más tarde o contacta al soporte.");
      } else if (!status) {
        setError("🌐 No se pudo conectar con el servidor. Verifica tu conexión a internet.");
      } else {
        setError(`⚠️ Error inesperado al registrar la cuenta (${status}). Por favor, intenta más tarde.`);
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Role */}
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all bg-white"
                required
              >
                <option value="parent">Padre / Madre</option>
                <option value="nanny">Niñera</option>
              </select>
            </div>

            {/* Password con requisitos */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setShowPasswordRequirements(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                required
              />
              
              {/* Requisitos de contraseña */}
              {(showPasswordRequirements || formData.password) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Tu contraseña debe cumplir con:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li className={`flex items-center gap-2 ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.minLength ? '✓' : '○'}</span>
                      Mínimo 10 caracteres
                    </li>
                    <li className={`flex items-center gap-2 ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.hasUpperCase ? '✓' : '○'}</span>
                      Al menos una letra mayúscula (A-Z)
                    </li>
                    <li className={`flex items-center gap-2 ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.hasLowerCase ? '✓' : '○'}</span>
                      Al menos una letra minúscula (a-z)
                    </li>
                    <li className={`flex items-center gap-2 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.hasNumber ? '✓' : '○'}</span>
                      Al menos un número (0-9)
                    </li>
                    <li className={`flex items-center gap-2 ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{passwordRequirements.hasSpecialChar ? '✓' : '○'}</span>
                      Al menos un carácter especial (!@#$%^&*...)
                    </li>
                  </ul>
                  {allRequirementsMet && (
                    <p className="mt-2 text-xs font-semibold text-green-600 flex items-center gap-1">
                      <span>✓</span> ¡Contraseña segura!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="password2"
                placeholder="Confirmar contraseña"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registrando..." : "Registrarse"}
            </button>
          </form>
          
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