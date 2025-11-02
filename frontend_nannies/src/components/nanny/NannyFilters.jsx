export default function NannyFilters({ filters, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-4 rounded-xl shadow mb-8 flex flex-wrap gap-4 items-center justify-center"
    >
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={onChange}
        placeholder="Buscar por nombre o descripción..."
        className="flex-1 p-2 border rounded-md"
      />
      <input
        type="number"
        name="max_rate"
        value={filters.max_rate}
        onChange={onChange}
        placeholder="Tarifa máx ($/h)"
        className="w-40 p-2 border rounded-md"
      />
      <input
        type="number"
        name="min_experience"
        value={filters.min_experience}
        onChange={onChange}
        placeholder="Experiencia mínima (años)"
        className="w-52 p-2 border rounded-md"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="verified"
          checked={filters.verified}
          onChange={onChange}
        />
        Solo verificadas
      </label>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
