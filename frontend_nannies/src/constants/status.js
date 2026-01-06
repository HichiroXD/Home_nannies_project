/**
 * Constantes para estados de reservas
 */

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pendiente',
  [BOOKING_STATUS.ACCEPTED]: 'Aceptada',
  [BOOKING_STATUS.REJECTED]: 'Rechazada',
  [BOOKING_STATUS.COMPLETED]: 'Completada',
  [BOOKING_STATUS.CANCELLED]: 'Cancelada',
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.ACCEPTED]: 'info',
  [BOOKING_STATUS.REJECTED]: 'error',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'default',
};

/**
 * Estados de verificación
 */
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const VERIFICATION_STATUS_LABELS = {
  [VERIFICATION_STATUS.PENDING]: 'Pendiente',
  [VERIFICATION_STATUS.VERIFIED]: 'Verificado',
  [VERIFICATION_STATUS.REJECTED]: 'Rechazado',
};
