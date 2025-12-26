/**
 * ReviewsManagement - Panel de gestión de reseñas
 * Permite ver todas las reseñas dadas a las niñeras por los padres
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Rating,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Star, Trash2, Eye } from 'lucide-react';
import { formatters, PaginationComponent } from '@/components/common';
import API from '@api/api';

export const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await API.get('/reviews/');
        setReviews(response.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filtrar reseñas por búsqueda
  const filteredReviews = reviews.filter((review) => {
    const searchLower = searchTerm.toLowerCase();
    const nannyName = review.nanny_name?.toLowerCase() || '';
    const parentName = review.parent_name?.toLowerCase() || '';
    const comment = review.comment?.toLowerCase() || '';
    
    return (
      nannyName.includes(searchLower) ||
      parentName.includes(searchLower) ||
      comment.includes(searchLower)
    );
  });

  // Paginación
  const paginatedReviews = filteredReviews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // Calcular estadísticas
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length * 100).toFixed(1)
      : 0
  }));

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      return;
    }

    try {
      await API.delete(`/reviews/${reviewId}/`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Error al eliminar la reseña');
    }
  };

  return (
    <Stack spacing={3}>
      {/* Estadísticas generales */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Reseñas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {totalReviews}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', color: 'white' }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Calificación Promedio
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {averageRating.toFixed(1)}
                </Typography>
                <Star size={24} fill="white" />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Distribución de calificaciones */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Distribución de Calificaciones
          </Typography>
          <Stack spacing={1}>
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ minWidth: '60px' }}>
                  {stars} estrellas
                </Typography>
                <Box 
                  sx={{ 
                    flex: 1, 
                    height: 24, 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      height: '100%', 
                      width: `${percentage}%`,
                      backgroundColor: stars >= 4 ? '#10B981' : stars >= 3 ? '#F59E0B' : '#EF4444',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: '80px', textAlign: 'right' }}>
                  {count} ({percentage}%)
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Búsqueda */}
      <TextField
        placeholder="Buscar por niñera, padre o comentario..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
        fullWidth
      />

      {/* Tabla de reseñas */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Todas las Reseñas ({filteredReviews.length})
          </Typography>

          {loading ? (
            <Typography sx={{ textAlign: 'center', py: 4 }}>
              Cargando reseñas...
            </Typography>
          ) : paginatedReviews.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              {searchTerm ? 'No se encontraron reseñas' : 'No hay reseñas registradas'}
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Niñera</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Padre</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Calificación</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Comentario</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedReviews.map((review) => (
                      <TableRow key={review.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                              {review.nanny_name?.charAt(0) || 'N'}
                            </Avatar>
                            <Typography variant="body2">
                              {review.nanny_name || 'Niñera'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10B981' }}>
                              {review.parent_name?.charAt(0) || 'P'}
                            </Avatar>
                            <Typography variant="body2">
                              {review.parent_name || 'Padre'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {review.rating}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {review.comment || 'Sin comentario'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {review.created_at 
                              ? new Date(review.created_at).toLocaleDateString('es-ES')
                              : '-'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Ver detalles">
                              <IconButton size="small" color="primary">
                                <Eye size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDelete(review.id)}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Paginación */}
              {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <PaginationComponent
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ReviewsManagement;
