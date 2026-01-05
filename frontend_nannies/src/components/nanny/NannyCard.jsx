import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getMediaUrl } from '@/config/constants';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';

/**
 * Componente NannyCard - Muestra información de una niñera
 * 
 * @param {object} nanny - Datos de la niñera
 * @param {function} onFavorite - Callback para guardar/eliminar de favoritos
 * @param {function} onBook - Callback para agendar reserva
 * @param {boolean} isFavorited - Indica si ya está en favoritos
 * @param {boolean} isLoading - Indica si se está procesando la acción
 */
export default function NannyCard({ nanny, onFavorite, onBook, isFavorited = false, isLoading = false }) {
  const userRole = localStorage.getItem('role');
  const isNanny = userRole === 'nanny';
  const [showImage, setShowImage] = useState(Boolean(nanny.profile_photo));

  const getStatusBadge = () => {
    if (nanny.verified) return { text: 'Disponible', color: 'success' };
    if (!nanny.verified && nanny.experience_years > 5) return { text: 'Limitado', color: 'warning' };
    return { text: 'No disponible', color: 'error' };
  };

  const status = getStatusBadge();

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(255,228,240,0.85) 50%, rgba(255,255,255,0.85) 60%)',
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'pink.100', width: 56, height: 56 }}>
            {showImage ? (
              <img
                src={getMediaUrl(nanny.profile_photo)}
                alt={nanny.first_name || 'Niñera'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setShowImage(false)}
              />
            ) : (
              <PersonIcon sx={{ color: 'gray.500' }} />
            )}
          </Avatar>
        }
        action={
          <Tooltip title={isFavorited ? 'Eliminar de favoritos' : 'Añadir a favoritos'}>
            <span>
              <IconButton onClick={() => onFavorite(nanny.id)} disabled={isLoading} aria-label="favorite">
                <FavoriteIcon color={isFavorited ? 'error' : 'inherit'} />
              </IconButton>
            </span>
          </Tooltip>
        }
        title={
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {nanny.first_name && nanny.last_name ? `${nanny.first_name} ${nanny.last_name}` : nanny.username || 'Niñera'}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip label={status.text} color={status.color} size="small" />
          </Box>
        }
      />

      <CardContent sx={{ pt: 0, pb: 1, px: 2 }}>
        {/* Descripción breve */}
        {nanny.bio && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2, 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.875rem'
            }}
          >
            {nanny.bio}
          </Typography>
        )}
        
        <Stack spacing={1.5}>
          {/* Tarifa por hora - Destacada */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.5,
              bgcolor: 'rgba(103, 58, 183, 0.08)',
              borderRadius: 1.5,
              border: '1px solid rgba(103, 58, 183, 0.2)'
            }}
          >
            <WorkIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Tarifa por hora
              </Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1 }}>
                ${typeof nanny.hourly_rate === 'number' ? nanny.hourly_rate.toLocaleString('es-CL') : (nanny.hourly_rate || 'N/A')} CLP
              </Typography>
            </Box>
          </Box>

          {/* Información adicional */}
          <Stack spacing={1}>
            {/* Experiencia */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant="body2" color="text.secondary">
                <strong>{nanny.experience_years || 0}</strong> {nanny.experience_years === 1 ? 'año' : 'años'} de experiencia
              </Typography>
            </Box>

            {/* Calificación */}
            {nanny.rating_avg && parseFloat(nanny.rating_avg) > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon 
                      key={i} 
                      sx={{ 
                        fontSize: 16, 
                        color: i < Math.round(parseFloat(nanny.rating_avg)) ? '#f59e0b' : '#e5e7eb' 
                      }} 
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>{parseFloat(nanny.rating_avg).toFixed(1)}</strong>
                  {nanny.total_reviews && ` (${nanny.total_reviews} ${nanny.total_reviews === 1 ? 'reseña' : 'reseñas'})`}
                </Typography>
              </Box>
            )}

            {/* Ubicación */}
            {nanny.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {nanny.location}
                </Typography>
              </Box>
            )}

            {/* Educación académica */}
            {nanny.education_level && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {nanny.education_level}
                </Typography>
              </Box>
            )}

            {/* Certificaciones */}
            {nanny.certifications && Array.isArray(nanny.certifications) && nanny.certifications.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Certificaciones:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {nanny.certifications.slice(0, 3).map((cert, idx) => (
                    <Chip 
                      key={idx} 
                      label={cert} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20,
                        bgcolor: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669',
                        fontWeight: 600
                      }} 
                    />
                  ))}
                  {nanny.certifications.length > 3 && (
                    <Chip 
                      label={`+${nanny.certifications.length - 3}`} 
                      size="small" 
                      sx={{ fontSize: '0.7rem', height: 20 }} 
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Especialidades */}
            {nanny.specialties && Array.isArray(nanny.specialties) && nanny.specialties.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Especialidades:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {nanny.specialties.slice(0, 3).map((specialty, idx) => (
                    <Chip 
                      key={idx} 
                      label={specialty} 
                      size="small" 
                      sx={{ 
                        fontSize: '0.7rem', 
                        height: 20,
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        color: '#4f46e5',
                        fontWeight: 600
                      }} 
                    />
                  ))}
                  {nanny.specialties.length > 3 && (
                    <Chip 
                      label={`+${nanny.specialties.length - 3}`} 
                      size="small" 
                      sx={{ fontSize: '0.7rem', height: 20 }} 
                    />
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => onBook(nanny.id)}
          disabled={isLoading || !nanny.verified || isNanny}
        >
          {isLoading ? 'Procesando...' : isNanny ? 'No disponible para niñeras' : !nanny.verified ? 'No disponible' : 'Contactar'}
        </Button>
      </CardActions>
    </Card>
  );
}

NannyCard.propTypes = {
  nanny: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    username: PropTypes.string,
    hourly_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    experience_years: PropTypes.number,
    verified: PropTypes.bool,
    rating_avg: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    total_reviews: PropTypes.number,
    bio: PropTypes.string,
    location: PropTypes.string,
    education_level: PropTypes.string,
    certifications: PropTypes.arrayOf(PropTypes.string),
    specialties: PropTypes.arrayOf(PropTypes.string),
    profile_photo: PropTypes.string,
  }).isRequired,
  onFavorite: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  isFavorited: PropTypes.bool,
  isLoading: PropTypes.bool,
};

