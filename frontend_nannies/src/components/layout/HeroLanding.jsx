import { useNavigate } from "react-router-dom";

export default function HeroLanding() {
  const navigate = useNavigate();

  return (
    <main className="relative flex flex-col items-center justify-center flex-grow px-6 py-20 md:py-32 text-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Cuida lo más importante con{" "}
          <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Home Nannies
          </span>
        </h2>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-gray-700 leading-relaxed text-center">
          Encuentra niñeras confiables y con disponibilidad verificada en tu zona. 
          <span className="block mt-2 text-lg text-gray-600">Cuidado de calidad cuando más lo necesitas.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate("/catalog")}
            className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Ver catálogo de niñeras
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-4 bg-white text-pink-600 text-lg font-semibold rounded-xl border-2 border-pink-500 hover:bg-pink-50 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Comenzar ahora
          </button>
        </div>
      </div>
    </main>
  );
}
