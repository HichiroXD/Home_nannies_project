import { Heart } from "lucide-react";

export default function NannyCard({ nanny, onFavorite, onBook }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition-all">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {nanny.full_name || nanny.username}
        </h2>
        <button
          onClick={() => onFavorite(nanny.id)}
          className="text-pink-500 hover:text-pink-600"
        >
          <Heart size={20} />
        </button>
      </div>
      <p className="text-gray-500 text-sm">{nanny.description || nanny.email}</p>
      <p className="mt-2 text-gray-700">
        <strong>Tarifa:</strong> ${nanny.hourly_rate}/hora
      </p>
      <p className="text-gray-700">
        <strong>Experiencia:</strong> {nanny.experience_years} años
      </p>
      {nanny.verified && (
        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-200 text-green-800 rounded-md">
          ✅ Verificada
        </span>
      )}
      <button
        onClick={() => onBook(nanny.id)}
        className="mt-4 bg-pink-500 text-white w-full py-2 rounded-lg hover:bg-pink-600 transition-colors"
      >
        Agendar
      </button>
    </div>
  );
}
