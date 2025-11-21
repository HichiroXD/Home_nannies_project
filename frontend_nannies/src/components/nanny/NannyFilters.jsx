export default function NannyFilters({ filters, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-pink-100 mb-8 flex flex-wrap gap-4 items-end"
    >
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Nombre o descripción..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
        />
      </div>
      <div className="w-40 min-w-[140px]">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tarifa máx</label>
        <input
          type="number"
          name="max_rate"
          value={filters.max_rate}
          onChange={onChange}
          placeholder="$/hora"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
        />
      </div>
      <div className="w-48 min-w-[180px]">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Experiencia mín</label>
        <input
          type="number"
          name="min_experience"
          value={filters.min_experience}
          onChange={onChange}
          placeholder="Años"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
        />
      </div>
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          type="checkbox"
          name="verified"
          checked={filters.verified}
          onChange={onChange}
          className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
        />
        <label className="text-sm font-semibold text-gray-700 cursor-pointer">
          Solo verificadas
        </label>
      </div>
      <button
        type="submit"
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
