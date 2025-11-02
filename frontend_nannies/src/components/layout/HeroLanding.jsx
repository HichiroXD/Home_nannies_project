import { useNavigate } from "react-router-dom";

export default function HeroLanding() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center flex-grow px-6 py-20 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
        Cuida lo más importante con <span className="text-pink-600">Home Nannies</span>
      </h2>
      <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-600">
        Encuentra niñeras confiables y con disponibilidad verificada en tu zona.
      </p>
      <button
        onClick={() => navigate("/catalog")}
        className="px-6 py-3 bg-pink-600 text-white text-lg font-semibold rounded-lg hover:bg-pink-700"
      >
        Ver catálogo de niñeras
      </button>
    </main>
  );
}
