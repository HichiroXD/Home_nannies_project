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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import { Search, Star, Trash2, Eye, User, Mail, Calendar, MessageSquare } from 'lucide-react';
import { formatters, PaginationComponent } from '@/components/common';
import API from '@api/api';

export const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const itemsPerPage = 10;

  // Obtener reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await API.get('/reviews/admin/all/');
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

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedReview(null);
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
                              {review.nanny_data?.first_name?.charAt(0) || review.nanny_name?.charAt(0) || 'N'}
                            </Avatar>
                            <Stack spacing={0}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {review.nanny_name || review.nanny_data?.username || 'Niñera'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {review.nanny_data?.nanny_profile_id || review.nanny || 'N/A'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10B981' }}>
                              {review.parent_data?.first_name?.charAt(0) || review.parent_username?.charAt(0) || 'P'}
                            </Avatar>
                            <Stack spacing={0}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {review.parent_data?.first_name && review.parent_data?.last_name 
                                  ? `${review.parent_data.first_name} ${review.parent_data.last_name}`.trim()
                                  : review.parent_username || 'Padre'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {review.parent_data?.id || review.parent || 'N/A'}
                              </Typography>
                            </Stack>
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
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewDetails(review)}
                              >
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

      {/* Modal de Detalles */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#667eea', color: 'white' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Eye size={24} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detalles de la Reseña
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedReview && (
            <Stack spacing={3}>
              {/* Información de la Reseña */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    INFORMACIÓN DE LA RESEÑA
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MessageSquare size={18} color="#667eea" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>ID de Reseña:</Typography>
                        <Typography variant="body2">{selectedReview.id}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Star size={18} color="#F59E0B" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Calificación:</Typography>
                        <Rating value={selectedReview.rating} readOnly size="small" />
                        <Typography variant="body2">({selectedReview.rating}/5)</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Calendar size={18} color="#10B981" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Fecha:</Typography>
                        <Typography variant="body2">
                          {selectedReview.created_at 
                            ? new Date(selectedReview.created_at).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'
                          }
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Comentario:</Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {selectedReview.comment || 'Sin comentario'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Información del Padre (quien dio la reseña) */}
              <Card variant="outlined" sx={{ borderColor: '#10B981' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PADRE QUE DIO LA RESEÑA
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 48, height: 48, bgcolor: '#10B981' }}>
                          {selectedReview.parent_data?.first_name?.charAt(0) || selectedReview.parent_username?.charAt(0) || 'P'}
                        </Avatar>
                        <Stack>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedReview.parent_data?.first_name && selectedReview.parent_data?.last_name 
                              ? `${selectedReview.parent_data.first_name} ${selectedReview.parent_data.last_name}`.trim()
                              : selectedReview.parent_username || 'Padre'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Usuario ID: {selectedReview.parent_data?.id || selectedReview.parent || 'N/A'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <User size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Username:</Typography>
                        <Typography variant="body2">{selectedReview.parent_data?.username || selectedReview.parent_username || '-'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Mail size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Email:</Typography>
                        <Typography variant="body2">{selectedReview.parent_data?.email || '-'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Rol:</Typography>
                        <Chip 
                          label={selectedReview.parent_data?.role || 'parent'} 
                          size="small" 
                          color="success"
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Perfil ID:</Typography>
                        <Typography variant="body2">{selectedReview.parent_data?.parent_profile_id || '-'}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Información de la Niñera (quien recibió la reseña) */}
              <Card variant="outlined" sx={{ borderColor: '#667eea' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    NIÑERA QUE RECIBIÓ LA RESEÑA
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 48, height: 48, bgcolor: '#667eea' }}>
                          {selectedReview.nanny_data?.first_name?.charAt(0) || selectedReview.nanny_name?.charAt(0) || 'N'}
                        </Avatar>
                        <Stack>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {selectedReview.nanny_name || selectedReview.nanny_data?.username || 'Niñera'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Perfil ID: {selectedReview.nanny_data?.nanny_profile_id || selectedReview.nanny || 'N/A'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <User size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Username:</Typography>
                        <Typography variant="body2">{selectedReview.nanny_data?.username || '-'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Mail size={16} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Email:</Typography>
                        <Typography variant="body2">{selectedReview.nanny_data?.email || '-'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Rol:</Typography>
                        <Chip 
                          label={selectedReview.nanny_data?.role || 'nanny'} 
                          size="small" 
                          color="primary"
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Usuario ID:</Typography>
                        <Typography variant="body2">{selectedReview.nanny_data?.id || '-'}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} variant="outlined">
            Cerrar
          </Button>
          {selectedReview && (
            <Button 
              onClick={() => {
                handleCloseDetails();
                handleDelete(selectedReview.id);
              }} 
              color="error"
              variant="contained"
              startIcon={<Trash2 size={16} />}
            >
              Eliminar Reseña
            </Button>
          )}
        </DialogActions>
      </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ReviewsManagement;
