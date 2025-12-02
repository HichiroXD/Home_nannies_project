/**
 * Alert - Componente de alertas reutilizable
 * Soporta múltiples tipos: success, error, warning, info
 */

import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Box, IconButton } from '@mui/material';
import { X } from 'lucide-react';

export const AlertComponent = ({
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
  action,
}) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setOpen(false);
        onClose?.();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Alert
      severity={type}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1 }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Box>
      {action && (
        <Box sx={{ ml: 2 }}>
          {action}
        </Box>
      )}
      <IconButton
        size="small"
        onClick={handleClose}
        sx={{ ml: 2 }}
      >
        <X size={18} />
      </IconButton>
    </Alert>
  );
};

AlertComponent.propTypes = {
  /** Tipo de alerta: 'success', 'error', 'warning', 'info' */
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  /** Título de la alerta */
  title: PropTypes.string,
  /** Mensaje de la alerta */
  message: PropTypes.node.isRequired,
  /** Callback al cerrar */
  onClose: PropTypes.func,
  /** Cerrar automáticamente */
  autoClose: PropTypes.bool,
  /** Duración del auto cierre (ms) */
  autoCloseDuration: PropTypes.number,
  /** Acción personalizada */
  action: PropTypes.node,
};

AlertComponent.defaultProps = {
  type: 'info',
  autoClose: true,
  autoCloseDuration: 5000,
};

export default memo(AlertComponent);
