import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "@api/userApi";
import { AuthLayout, AuthMessage, AuthForm } from "@components/auth";
import { MainLayout, Loader, PageContainer } from "@components/layout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

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
    setIsLoading(true);
    try {
      const data = await loginUser(username, password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      navigate("/catalog");
    } catch (err) {
      const status = err.response?.status || err.status || (err?.detail ? 400 : null);
      if (status === 401) setError("Credenciales incorrectas. Intenta nuevamente.");
      else if (status === 403) setError("Tu cuenta aún no está verificada. Revisa tu correo.");
      else setError(err.response?.data?.detail || err.detail || "Ocurrió un error al iniciar sesión. Inténtalo más tarde.");
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
      <PageContainer className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <AuthLayout title="Iniciar Sesión">
          <AuthMessage type="info" message={infoMessage} />
          <AuthMessage type="error" message={error} />
          <AuthForm fields={fields} onSubmit={handleLogin} buttonText="Entrar" disabled={isLoading} />
          <p className="text-center text-gray-600 text-sm mt-6">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-pink-500 hover:text-pink-700 font-medium underline">
              Regístrate aquí
            </Link>
          </p>
        </AuthLayout>
      </PageContainer>
    </MainLayout>
  );
}
