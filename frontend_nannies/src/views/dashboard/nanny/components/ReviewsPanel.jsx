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
  // Calcular estadísticas
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));

  const verifiedCount = reviews.filter((r) => r.verified).length;

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
                  Basado en {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
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
                  {verifiedCount}/{reviews.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {Math.round((verifiedCount / reviews.length) * 100) || 0}% verificadas
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
                  value={(item.count / reviews.length) * 100}
                  sx={{ flex: 1, height: '8px', borderRadius: '4px' }}
                />
                <Typography variant="caption" sx={{ minWidth: '40px', textAlign: 'right' }}>
                  {Math.round((item.count / reviews.length) * 100)}%
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
          {reviews.length === 0 ? (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                Aún no tienes reseñas
              </Typography>
            </Card>
          ) : (
            reviews.map((review) => (
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
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

export default ReviewsPanel;
