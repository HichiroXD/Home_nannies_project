import React, { useEffect, useState } from "react";
import "./AlertToast.css";

/**
 * Componente reutilizable para mostrar alertas y notificaciones
 * 
 * Uso:
 * <AlertToast
 *   message="¡Éxito!"
 *   type="success"
 *   duration={3000}
 *   onClose={() => {}}
 * />
 */
export default function AlertToast({ message, type = "info", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`alert-toast alert-${type}`}>
      <div className="alert-content">
        <span className="alert-icon">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "warning" && "⚠"}
          {type === "info" && "ⓘ"}
        </span>
        <span className="alert-message">{message}</span>
      </div>
      <button
        className="alert-close"
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
      >
        ×
      </button>
    </div>
  );
}

/**
 * Hook personalizado para manejar alertas
 * Retorna: { showAlert, alert, setAlert }
 * 
 * Uso en componente:
 * const { showAlert, alert, setAlert } = useAlert();
 * 
 * // Mostrar alerta
 * showAlert("¡Éxito!", "success");
 * 
 * // En JSX
 * <AlertToast {...alert} onClose={() => setAlert({})} />
 */
export function useAlert() {
  const [alert, setAlert] = useState({});

  const showAlert = (message, type = "info", duration = 3000) => {
    setAlert({ message, type, duration });
  };

  return { showAlert, alert, setAlert };
}
