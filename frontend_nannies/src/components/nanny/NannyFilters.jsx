export default function NannyFilters({ filters, onChange, onSubmit }) {
  const handleMinExperienceChange = (e) => {
    const isChecked = e.target.checked;
    onChange({ 
      target: { 
        name: 'min_experience', 
        value: isChecked ? '2' : '',
        type: 'text'
      } 
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-pink-200 rounded-xl p-4 mb-6 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Buscar por nombre
          </label>
          <input
            type="text"
            name="search"
            value={filters.search || ""}
            onChange={onChange}
            placeholder="Escribe el nombre..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Experiencia mínima */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Experiencia mínima (años)
          </label>
          <input
            type="number"
            name="min_experience"
            value={filters.min_experience || ""}
            onChange={onChange}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Precio máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Precio máximo ($/hora)
          </label>
          <input
            type="number"
            name="max_rate"
            value={filters.max_rate || ""}
            onChange={onChange}
            placeholder="$0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-4">
        <label className="flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            name="verified"
            checked={filters.verified || false}
            onChange={onChange}
            className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
          />
          Solo verificadas
        </label>
        
        <button
          type="submit"
          className="ml-auto px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}
