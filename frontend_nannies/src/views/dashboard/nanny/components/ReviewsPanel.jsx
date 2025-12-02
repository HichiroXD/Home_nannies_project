/**
 * ReviewsPanel - Panel de reseñas y calificaciones
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Rating,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
  Button,
} from '@mui/material';
import { ThumbsUp, MessageSquare, Verified } from 'lucide-react';

export const ReviewsPanel = ({ reviews = [] }) => {
  // Normalizar datos - el API retorna reviews con estructura diferente
  const normalizedReviews = reviews.map(r => ({
    id: r.id,
    rating: r.rating || 0,
    comment: r.comment || '',
    parentName: r.parent__user__first_name || r.parentName || 'Cliente',
    date: r.created_at || r.date,
    verified: r.verified !== undefined ? r.verified : true,
  }));

  // Calcular estadísticas
  const averageRating = normalizedReviews.length > 0
    ? (normalizedReviews.reduce((sum, r) => sum + r.rating, 0) / normalizedReviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: normalizedReviews.filter((r) => r.rating === rating).length,
  }));

  const verifiedCount = normalizedReviews.filter((r) => r.verified).length;

  // Mostrar mensaje si no hay reviews
  if (normalizedReviews.length === 0) {
    return (
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MessageSquare size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Sin reseñas aún
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Completa tus primeros bookings para recibir reseñas de los clientes.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Resumen de reseñas */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Calificación Promedio
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {averageRating}
                  </Typography>
                  <Rating value={parseFloat(averageRating)} readOnly size="large" />
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Basado en {normalizedReviews.length} reseña{normalizedReviews.length !== 1 ? 's' : ''}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Verified size={20} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Reseñas Verificadas
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {verifiedCount}/{normalizedReviews.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.round((verifiedCount / normalizedReviews.length) * 100) || 0}% verificadas
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distribución de calificaciones */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Distribución de Calificaciones
          </Typography>
          <Stack spacing={1.5}>
            {ratingDistribution.map((item) => (
              <Box key={item.rating} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: '80px' }}>
                  <Rating value={item.rating} readOnly size="small" />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {item.count}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(item.count / normalizedReviews.length) * 100}
                  sx={{ flex: 1, height: '8px', borderRadius: '4px' }}
                />
                <Typography variant="caption" sx={{ minWidth: '40px', textAlign: 'right' }}>
                  {Math.round((item.count / normalizedReviews.length) * 100)}%
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Lista de reseñas */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Reseñas Recientes
        </Typography>
        <Stack spacing={2}>
          {normalizedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <Stack spacing={1.5}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Stack direction="row" spacing={1.5} alignItems="start" sx={{ flex: 1 }}>
                      <Avatar>{review.parentName?.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {review.parentName}
                          </Typography>
                          {review.verified && (
                            <Chip
                              icon={<Verified size={14} />}
                              label="Verificado"
                              size="small"
                              variant="outlined"
                              color="success"
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(review.date).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                    </Stack>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>

                  {/* Comentario */}
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#4B5563' }}>
                    "{review.comment}"
                  </Typography>

                  {/* Acciones */}
                  <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<ThumbsUp size={16} />}
                      variant="outlined"
                    >
                      Útil
                    </Button>
                    <Button
                      size="small"
                      startIcon={<MessageSquare size={16} />}
                      variant="outlined"
                    >
                      Responder
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default ReviewsPanel;
