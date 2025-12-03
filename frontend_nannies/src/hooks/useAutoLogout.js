import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para cerrar sesión automáticamente después de un período de inactividad.
 * 
 * SPRINT 3 - SEGURIDAD:
 * - Cierra sesión tras 15 minutos de inactividad
 * - Detecta eventos: mousedown, keypress, scroll, touchstart
 * - Limpia localStorage y redirige a /login
 * 
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 15 min)
 */
export const useAutoLogout = (timeout = 15 * 60 * 1000) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const logout = () => {
    // Limpiar todo el localStorage
    localStorage.clear();
    
    // Redirigir a login
    navigate('/login', { 
      state: { 
        message: 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.' 
      }
    });
  };

  const resetTimer = () => {
    // Limpiar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Crear nuevo timeout
    timeoutRef.current = setTimeout(logout, timeout);
  };

  useEffect(() => {
    // Eventos que detectan actividad del usuario
    const events = [
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ];

    // Agregar event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar el timer
    resetTimer();

    // Cleanup: remover event listeners y limpiar timeout
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout]); // Dependencia: si cambia el timeout, reiniciar

  return null; // No necesita retornar nada
};

export default useAutoLogout;
