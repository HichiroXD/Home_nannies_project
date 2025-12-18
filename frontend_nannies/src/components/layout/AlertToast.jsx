import { useEffect } from "react";
import PropTypes from 'prop-types';

/**
 * Componente AlertToast reutilizable para mostrar mensajes de éxito, error, info y warning
 * 
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta: 'success', 'error', 'info', 'warning'
 * @param {boolean} isVisible - Controla la visibilidad
 * @param {function} onClose - Callback para cerrar la alerta
 * @param {number} duration - Duración en ms antes de cerrarse automáticamente (0 = manual)
 */
export default function AlertToast({ message, type = "info", isVisible, onClose, duration = 4000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible || !message) return null;

  // Estilos según tipo de alerta
  const styles = {
    success: {
      bg: "bg-green-50 border-green-200",
      icon: "text-green-600",
      text: "text-green-800",
      button: "text-green-500 hover:text-green-700",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: "text-red-600",
      text: "text-red-800",
      button: "text-red-500 hover:text-red-700",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-800",
      button: "text-blue-500 hover:text-blue-700",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      text: "text-yellow-800",
      button: "text-yellow-500 hover:text-yellow-700",
    },
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  const style = styles[type] || styles.info;
  const icon = icons[type] || icons.info;

  return (
    <div
      className={`fixed top-4 right-4 max-w-md p-4 border rounded-lg shadow-lg z-50 flex items-start gap-3 ${style.bg} animate-slideIn`}
      role="alert"
    >
      {/* Ícono */}
      <span className={`text-xl font-bold flex-shrink-0 ${style.icon}`}>
        {icon}
      </span>

      {/* Mensaje */}
      <p className={`flex-1 ${style.text} text-sm font-medium`}>
        {message}
      </p>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className={`flex-shrink-0 ml-2 text-lg font-bold transition-colors ${style.button}`}
        aria-label="Cerrar alerta"
      >
        ✕
      </button>
    </div>
  );
}

AlertToast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info', 'warning']),
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};
