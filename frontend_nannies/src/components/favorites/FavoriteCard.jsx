export default function FavoriteCard({ fav, onDelete, onDoubleClick }) {
  const nannyName = `${fav.nanny.first_name || ''} ${fav.nanny.last_name || ''}`.trim() || fav.nanny.username || 'Niñera';
  
  return (
    <div 
      className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onDoubleClick && onDoubleClick(fav.nanny.id)}
      title="Click para ver disponibilidad"
    >
      <div>
        <h3 className="font-semibold">{nannyName}</h3>
        <p className="text-gray-500">
          ${fav.nanny.hourly_rate}/hora • {fav.nanny.experience_years} años exp.
        </p>
        <p className="text-xs text-gray-400 mt-1">Click para ver disponibilidad</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(fav.id);
        }}
        className="text-red-500 hover:text-red-700 text-lg"
        title="Eliminar favorito"
      >
        🗑️
      </button>
    </div>
  );
}
