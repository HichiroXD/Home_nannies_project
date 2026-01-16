import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "@api/userApi";
import { AuthLayout, AuthMessage, AuthForm } from "@components/auth";
import { MainLayout, Loader } from "@components/layout";
import useAuthStore from "@/stores/useAuthStore";
import logger from "@/utils/logger";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validaciones del lado del cliente
    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    
    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    
    if (password.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres.");
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await loginUser(username, password);
      
      // Usar store de Zustand para gestionar auth
      login({
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        access: data.access,
        refresh: data.refresh,
        role: data.role,
        active_role: data.active_role,
        available_roles: data.available_roles
      });
      
      logger.info('Login exitoso', { username: data.username, role: data.role, activeRole: data.active_role });
      navigate("/catalog");
    } catch (err) {
      logger.error("Error en login", { error: err.message, status: err.response?.status });
      
      const status = err.response?.status || err.status;
      const errorData = err.response?.data || {};
      
      // Manejo específico por código de estado HTTP
      if (status === 401) {
        const detail = errorData.detail || "";
        if (detail.toLowerCase().includes("credentials")) {
          setError("❌ Usuario o contraseña incorrectos. Verifica tus datos.");
        } else if (detail.toLowerCase().includes("inactive")) {
          setError("⚠️ Tu cuenta está inactiva. Contacta al administrador.");
        } else {
          setError("❌ Credenciales inválidas. Por favor, intenta nuevamente.");
        }
      } else if (status === 403) {
        setError("📧 Tu cuenta aún no está verificada. Revisa tu correo electrónico y haz clic en el enlace de verificación.");
      } else if (status === 400) {
        // Errores de validación
        if (errorData.username) {
          setError(`❌ Usuario: ${errorData.username[0]}`);
        } else if (errorData.password) {
          setError(`❌ Contraseña: ${errorData.password[0]}`);
        } else if (errorData.detail) {
          setError(`❌ ${errorData.detail}`);
        } else {
          setError("❌ Datos de inicio de sesión inválidos. Verifica la información ingresada.");
        }
      } else if (status === 404) {
        setError("❌ Usuario no encontrado. ¿Quizás necesitas registrarte?");
      } else if (status === 429) {
        setError("⏱️ Demasiados intentos de inicio de sesión. Por favor, espera unos minutos e intenta nuevamente.");
      } else if (status >= 500) {
        setError("🔧 Error en el servidor. Por favor, intenta más tarde o contacta al soporte.");
      } else if (!status) {
        setError("🌐 No se pudo conectar con el servidor. Verifica tu conexión a internet.");
      } else {
        setError(errorData.detail || err.detail || `⚠️ Error inesperado (${status}). Por favor, intenta nuevamente.`);
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
      value: username,
      onChange: (e) => { setUsername(e.target.value); setError(""); },
    },
    {
      name: "password",
      type: "password",
      placeholder: "Contraseña",
      value: password,
      onChange: (e) => setPassword(e.target.value),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-center py-8 min-h-[calc(100vh-4rem)]">
        <AuthLayout title="Iniciar Sesión">
          <AuthMessage type="info" message={infoMessage} />
          <AuthMessage type="error" message={error} />
          <AuthForm fields={fields} onSubmit={handleLogin} buttonText="Entrar" disabled={isLoading} />
          
          {/* Link para recuperar contraseña */}
          <div className="text-center mt-3">
            <Link to="/forgot-password" className="text-sm text-pink-600 hover:text-pink-700 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          
          <p className="text-center text-gray-600 text-sm mt-4">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-pink-500 hover:text-pink-700 font-medium underline">
              Regístrate aquí
            </Link>
          </p>
        </AuthLayout>
      </div>
    </MainLayout>
  );
}
