/**
 * BookingQueue - Cola de bookings para niñeras
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Avatar,
  Chip,
  Grid,
} from '@mui/material';
import { CheckCircle, Clock, Trash2, User } from 'lucide-react';
import { formatters } from '@/components/common';

export const BookingQueue = ({
  bookings = [],
  onAccept,
  onReject,
  onComplete,
}) => {
  // Manejar tanto formato antiguo como datos del API
  const normalizedBookings = bookings.map(b => ({
    id: b.id || b.id,
    parentName: b.parentName || `${b.parent__user__first_name || ''} ${b.parent__user__last_name || ''}`.trim(),
    kids: b.kids || 1,
    date: b.date,
    time: b.time || '09:00 - 13:00',
    status: b.status || 'pending',
    rate: b.rate || 0,
  }));

  // Separar bookings por estado
  const pending = normalizedBookings.filter((b) => b.status === 'pending');
  const confirmed = normalizedBookings.filter((b) => b.status === 'confirmed');

  // Mostrar mensaje si no hay bookings
  if (normalizedBookings.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Clock size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Sin reservas
          </Typography>
          <Typography color="textSecondary" variant="body2">
            No tienes bookings próximos. Los nuevos bookings aparecerán aquí.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const BookingCard = ({ booking, actions }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar>{booking.parentName?.charAt(0)}</Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {booking.parentName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {booking.kids} niño{booking.kids !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Stack>
            <Chip
              label={booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
              color={booking.status === 'confirmed' ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          {/* Detalles */}
          <Stack direction="row" spacing={2} sx={{ py: 1, borderY: '1px solid #eee' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={18} />
              <Typography variant="body2">
                {formatters.date(booking.date)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={18} />
              <Typography variant="body2">
                {booking.time}
              </Typography>
            </Stack>
          </Stack>

          {/* Tarifa */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Tarifa: {formatters.currency(booking.rate * 4, 'CLP')} (${booking.rate}/h)
            </Typography>
          </Box>

          {/* Acciones */}
          {actions && (
            <Stack direction="row" spacing={1}>
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'outlined'}
                  size="small"
                  color={action.color || 'primary'}
                  startIcon={action.icon}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Stack spacing={3}>
      {/* Bookings Pendientes */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Solicitudes Pendientes ({pending.length})
        </Typography>
        {pending.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No tienes solicitudes pendientes
            </Typography>
          </Card>
        ) : (
          pending.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={[
                {
                  label: 'Aceptar',
                  variant: 'contained',
                  color: 'success',
                  icon: <CheckCircle size={16} />,
                  onClick: () => onAccept(booking.id),
                },
                {
                  label: 'Rechazar',
                  variant: 'outlined',
                  color: 'error',
                  icon: <Trash2 size={16} />,
                  onClick: () => onReject(booking.id),
                },
              ]}
            />
          ))
        )}
      </Box>

      <Box sx={{ borderTop: '2px solid #eee', pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Confirmados ({confirmed.length})
        </Typography>
        {confirmed.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No tienes bookings confirmados
            </Typography>
          </Card>
        ) : (
          confirmed.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={[
                {
                  label: 'Completar',
                  variant: 'contained',
                  color: 'success',
                  icon: <CheckCircle size={16} />,
                  onClick: () => onComplete(booking.id),
                },
                {
                  label: 'Contactar Padre',
                  variant: 'outlined',
                  color: 'primary',
                  icon: <User size={16} />,
                  onClick: () => console.log('Contact:', booking.id),
                },
              ]}
            />
          ))
        )}
      </Box>
    </Stack>
  );
};

export default BookingQueue;
