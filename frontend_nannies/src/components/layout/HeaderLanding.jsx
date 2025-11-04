import { useNavigate } from "react-router-dom";

export default function HeaderLanding({ isLoggedIn, username }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-white shadow-md">
      <h1 
        onClick={() => navigate("/")} 
        className="text-2xl font-bold text-pink-600 cursor-pointer hover:text-pink-700"
      >
        Home Nannies
      </h1>
      <div className="space-x-4">
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={`https://ui-avatars.com/api/?name=${username}&background=pink&color=fff`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-700">{username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors duration-300"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}
