import React from 'react';

/**
 * Componente reutilizable para botones de filtro
 * Muestra opciones de filtro con estado activo
 */
const FilterTabs = ({ options, activeFilter, onFilterChange }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          className={`px-4 py-2 rounded-md font-medium transition ${
            activeFilter === option.value
              ? 'bg-pink-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
