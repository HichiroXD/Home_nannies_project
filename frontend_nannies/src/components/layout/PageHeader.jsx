import React from 'react';

/**
 * Componente reutilizable para encabezado de página
 * Muestra título y descripción
 */
const PageHeader = ({ title, description }) => {
  return (
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
};

export default PageHeader;
