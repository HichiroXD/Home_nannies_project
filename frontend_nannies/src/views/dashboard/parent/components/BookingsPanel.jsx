/**
 * BookingsPanel - Panel de bookings con acciones
 */

import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Divider,
} from '@mui/material';
import { Calendar, Clock, Trash2, Edit, MessageSquare, Star } from 'lucide-react';
import { formatters } from '@/components/common';
import API from '@api/api';

export const BookingsPanel = ({
  bookings = [],
  onSearchNanny,
  onCancelBooking,
  onReschedule,
}) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);

  // Separar bookings por estado
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  // Función para cargar reseña de un booking
  const handleViewReview = async (bookingId, nannyId) => {
    try {
      setLoadingReview(true);
      // Intentar obtener la reseña para este booking
      const response = await API.get(`/reviews/?booking=${bookingId}`);
      
      if (response.data && response.data.length > 0) {
        setSelectedReview(response.data[0]);
        setReviewDialogOpen(true);
      } else {
        // Si no hay reseña por booking, buscar por niñera
        const nannyReviews = await API.get(`/reviews/?nanny=${nannyId}`);
        // Filtrar la reseña del usuario actual
        const userReview = nannyReviews.data?.find(r => r.parent === localStorage.getItem('user_id'));
        
        if (userReview) {
          setSelectedReview(userReview);
          setReviewDialogOpen(true);
        } else {
          alert('No has dejado una reseña para esta reserva aún');
        }
      }
    } catch (error) {
      console.error('Error al cargar reseña:', error);
      alert('No se pudo cargar la reseña');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedReview(null);
  };

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

      {/* Bookings Completados */}
      <Box sx={{ borderTop: '2px solid #eee', pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Bookings Completados ({completedBookings.length})
        </Typography>
        {completedBookings.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No tienes bookings completados
            </Typography>
          </Card>
        ) : (
          completedBookings.map((booking) => (
            <Card key={booking.id} sx={{ mb: 2 }}>
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
                      <Avatar sx={{ bgcolor: '#10B981' }}>
                        {booking.nannyName?.charAt(0)}
                      </Avatar>
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
                      label="Completado"
                      color="success"
                      size="small"
                      icon={<span>✓</span>}
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
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star size={16} fill="#F59E0B" color="#F59E0B" />
                      <span>{booking.rating}/5</span>
                    </Typography>
                  )}

                  {/* Acciones */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MessageSquare size={16} />}
                      onClick={() => handleViewReview(booking.id, booking.nannyId)}
                      disabled={loadingReview}
                    >
                      {loadingReview ? 'Cargando...' : 'Ver mi Reseña'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
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

      {/* Dialog para ver reseña */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={handleCloseReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <MessageSquare size={24} color="#667eea" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mi Reseña
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedReview ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Niñera
                </Typography>
                <Typography variant="h6">
                  {selectedReview.nanny_name || 'Niñera'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Calificación
                </Typography>
                <Rating 
                  value={selectedReview.rating} 
                  readOnly 
                  size="large"
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                  {selectedReview.rating}/5
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Comentario
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedReview.comment || 'Sin comentario'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="textSecondary">
                  Fecha: {selectedReview.created_at 
                    ? new Date(selectedReview.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'}
                </Typography>
              </Box>

              <Box sx={{ 
                backgroundColor: '#f0f9ff', 
                border: '1px solid #bfdbfe',
                borderRadius: 1,
                p: 2
              }}>
                <Typography variant="caption" color="textSecondary">
                  ℹ️ Las reseñas no se pueden modificar una vez publicadas para mantener la integridad del sistema de calificaciones.
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography>No se encontró la reseña</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default BookingsPanel;
