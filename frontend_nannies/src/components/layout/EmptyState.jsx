import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para mensaje vacío
 * Muestra cuando no hay datos para mostrar
 */
const EmptyState = ({ message, icon: Icon }) => {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
      {Icon && <Icon size={32} className="mx-auto mb-4 text-blue-500" />}
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
};

export default EmptyState;
