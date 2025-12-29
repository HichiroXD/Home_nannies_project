/**
 * Modal - Componente modal reutilizable
 * Soporta diferentes tamaños, tipos y contenido personalizado
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';

export const Modal = ({
  open = false,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  size = 'medium',
  type = 'default', // 'default', 'success', 'error', 'warning'
  hideActions = false,
  loading = false,
}) => {
  const getMaxWidth = () => {
    const map = { small: 'xs', medium: 'sm', large: 'md' };
    return map[size] || 'sm';
  };

  const getTitleColor = () => {
    const map = {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      default: 'inherit',
    };
    return map[type] || 'inherit';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={getMaxWidth()}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DialogTitle
          sx={{
            color: getTitleColor(),
            fontWeight: 600,
            fontSize: '1.25rem',
            flex: 1,
          }}
        >
          {title}
        </DialogTitle>
        <IconButton
          onClick={onClose}
          sx={{ mr: 1, mt: 1 }}
          disabled={loading}
        >
          <X size={24} />
        </IconButton>
      </Box>

      <DialogContent sx={{ py: 3 }}>
        {typeof children === 'string' ? (
          <Typography>{children}</Typography>
        ) : (
          children
        )}
      </DialogContent>

      {!hideActions && (
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              onClick={onConfirm}
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor:
                  type === 'error'
                    ? '#f44336'
                    : type === 'success'
                    ? '#4caf50'
                    : 'primary.main',
              }}
            >
              {loading ? 'Procesando...' : confirmLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

Modal.propTypes = {
  /** Modal abierto o cerrado */
  open: PropTypes.bool,
  /** Título del modal */
  title: PropTypes.string,
  /** Contenido del modal */
  children: PropTypes.node,
  /** Callback al cerrar */
  onClose: PropTypes.func.isRequired,
  /** Callback al confirmar */
  onConfirm: PropTypes.func,
  /** Label del botón confirmar */
  confirmLabel: PropTypes.string,
  /** Label del botón cancelar */
  cancelLabel: PropTypes.string,
  /** Tamaño: 'small', 'medium', 'large' */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Tipo: 'default', 'success', 'error', 'warning' */
  type: PropTypes.oneOf(['default', 'success', 'error', 'warning']),
  /** Ocultar acciones */
  hideActions: PropTypes.bool,
  /** Estado de carga */
  loading: PropTypes.bool,
};

Modal.defaultProps = {
  open: false,
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  size: 'medium',
  type: 'default',
  hideActions: false,
  loading: false,
};

export default memo(Modal);
