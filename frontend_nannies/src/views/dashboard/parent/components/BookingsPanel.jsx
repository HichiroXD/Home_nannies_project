/**
 * BookingsPanel - Panel de bookings con acciones
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
import { Calendar, Clock, Trash2, Edit } from 'lucide-react';
import { formatters } from '@/components/common';

export const BookingsPanel = ({
  bookings = [],
  onSearchNanny,
  onCancelBooking,
  onReschedule,
}) => {
  // Separar bookings por estado
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  const BookingCard = ({ booking }) => (
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
              <Avatar>{booking.nannyName?.charAt(0)}</Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {booking.nannyName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {booking.kids?.join(', ')}
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
              <Calendar size={18} />
              <Typography variant="body2">
                {formatters.date(booking.date)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={18} />
              <Typography variant="body2">
                {booking.startTime} - {booking.endTime}
              </Typography>
            </Stack>
          </Stack>

          {/* Rating */}
          {booking.rating && (
            <Typography variant="body2" color="textSecondary">
              ⭐ {booking.rating}/5
            </Typography>
          )}

          {/* Acciones */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit size={16} />}
              onClick={() => onReschedule(booking.id)}
            >
              Reprogramar
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => onCancelBooking(booking.id)}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Stack spacing={3}>
      {/* Bookings Activos */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Bookings Confirmados ({activeBookings.length})
        </Typography>
        {activeBookings.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No tienes bookings confirmados
            </Typography>
          </Card>
        ) : (
          activeBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </Box>

      <Box sx={{ borderTop: '2px solid #eee', pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Bookings Pendientes ({pendingBookings.length})
        </Typography>
        {pendingBookings.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No tienes bookings pendientes
            </Typography>
          </Card>
        ) : (
          pendingBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        )}
      </Box>

      {/* Botón para buscar niñera */}
      <Box sx={{ textAlign: 'center', pt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={onSearchNanny}
        >
          Buscar Niñera
        </Button>
      </Box>
    </Stack>
  );
};

export default BookingsPanel;
