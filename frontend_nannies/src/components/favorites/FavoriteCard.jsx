export default function FavoriteCard({ fav, onDelete }) {
  const nannyName = `${fav.nanny.first_name || ''} ${fav.nanny.last_name || ''}`.trim() || fav.nanny.username || 'Niñera';
  
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{nannyName}</h3>
        <p className="text-gray-500">
          ${fav.nanny.hourly_rate}/hora • {fav.nanny.experience_years} años exp.
        </p>
      </div>
      <button
        onClick={() => onDelete(fav.id)}
        className="text-red-500 hover:text-red-700 text-lg"
      >
        🗑️
      </button>
    </div>
  );
}
