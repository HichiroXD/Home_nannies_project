/**
 * UserActionButtons - Botones de acción para gestión de usuarios (Sprint 3)
 * Permite: Aprobar, Suspender, Reactivar, Rechazar usuarios
 */

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Check, Ban, UserCheck, UserX } from 'lucide-react';
import API from '@api/api';

export const UserActionButtons = ({ user, onActionComplete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenDialog = (type) => {
    setActionType(type);
    setReason('');
    setError('');
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setActionType('');
    setReason('');
    setError('');
  };

  const handleAction = async () => {
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let body = {};

      switch (actionType) {
        case 'approve':
          endpoint = `/users/${user.id}/approve/`;
          break;
        case 'suspend':
          endpoint = `/users/${user.id}/suspend/`;
          body = { reason };
          break;
        case 'reactivate':
          endpoint = `/users/${user.id}/reactivate/`;
          break;
        case 'reject':
          endpoint = `/users/${user.id}/reject/`;
          body = { reason };
          break;
        default:
          throw new Error('Acción no válida');
      }

      const response = await API.post(endpoint, body);
      
      console.log(`✅ ${actionType} exitoso:`, response.data);
      
      // Llamar al callback para actualizar la lista
      if (onActionComplete) {
        onActionComplete();
      }
      
      handleClose();
    } catch (err) {
      console.error(`Error en ${actionType}:`, err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Error al realizar la acción'
      );
    } finally {
      setLoading(false);
    }
  };

  const getDialogContent = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Aprobar Usuario',
          message: `¿Estás seguro de aprobar a ${user.username}?`,
          color: 'success',
          needsReason: false,
        };
      case 'suspend':
        return {
          title: 'Suspender Usuario',
          message: `¿Estás seguro de suspender a ${user.username}?`,
          color: 'warning',
          needsReason: true,
        };
      case 'reactivate':
        return {
          title: 'Reactivar Usuario',
          message: `¿Estás seguro de reactivar a ${user.username}?`,
          color: 'info',
          needsReason: false,
        };
      case 'reject':
        return {
          title: 'Rechazar Usuario',
          message: `¿Estás seguro de rechazar a ${user.username}?`,
          color: 'error',
          needsReason: true,
        };
      default:
        return {};
    }
  };

  const dialogContent = getDialogContent();

  // No mostrar admin
  if (user.role === 'admin') {
    return null;
  }

  return (
    <>
      <Stack direction="row" spacing={1}>
        {/* Aprobar (solo si está pendiente) */}
        {user.verification_status === 'pending' && !user.is_verified && (
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<Check size={16} />}
            onClick={() => handleOpenDialog('approve')}
          >
            Aprobar
          </Button>
        )}

        {/* Suspender (solo si está activo) */}
        {user.is_active && !user.is_suspended && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<Ban size={16} />}
            onClick={() => handleOpenDialog('suspend')}
          >
            Suspender
          </Button>
        )}

        {/* Reactivar (solo si está suspendido) */}
        {user.is_suspended && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<UserCheck size={16} />}
            onClick={() => handleOpenDialog('reactivate')}
          >
            Reactivar
          </Button>
        )}

        {/* Rechazar (solo si está pendiente) */}
        {user.verification_status === 'pending' && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<UserX size={16} />}
            onClick={() => handleOpenDialog('reject')}
          >
            Rechazar
          </Button>
        )}
      </Stack>

      {/* Dialog de confirmación */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <Alert severity={dialogContent.color}>
              {dialogContent.message}
            </Alert>

            {dialogContent.needsReason && (
              <TextField
                label="Motivo (requerido)"
                multiline
                rows={3}
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="Ingresa el motivo de esta acción..."
              />
            )}

            <Alert severity="info" variant="outlined">
              El usuario recibirá una notificación por email y en la aplicación.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={dialogContent.color}
            disabled={loading || (dialogContent.needsReason && !reason.trim())}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserActionButtons;
