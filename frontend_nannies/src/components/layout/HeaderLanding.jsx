import { useNavigate } from "react-router-dom";

export default function HeaderLanding() {
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-pink-600">Home Nannies</h1>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors duration-300"
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-4 py-2 text-sm font-medium border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50"
        >
          Registrarse
        </button>
      </div>
    </header>
  );
}
