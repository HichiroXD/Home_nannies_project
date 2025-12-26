import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getMediaUrl } from '@/config/constants';
import {
  Card,
  CardHeader,
  Avatar,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';

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

      <CardContent sx={{ pt: 0, pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary"><strong>Tarifa por hora:</strong></Typography>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 700 }}>
              ${typeof nanny.hourly_rate === 'number' ? nanny.hourly_rate.toLocaleString('es-CL') : (nanny.hourly_rate || 'N/A')} CLP
            </Typography>
            <Tooltip title="El costo total se calcula multiplicando la tarifa por hora por el número de horas contratadas">
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>ℹ️</Typography>
            </Tooltip>
          </Box>

          <Typography variant="caption" color="text.secondary">
            <strong>Experiencia:</strong>{' '}
            <span style={{ color: 'rgba(0,0,0,0.87)' }}>{nanny.experience_years || 0} {nanny.experience_years === 1 ? 'año' : 'años'}</span>
          </Typography>

          {nanny.rating_avg && parseFloat(nanny.rating_avg) > 0 && (
            <Typography variant="caption" color="text.secondary">
              <strong>Calificación:</strong>{' '}
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {parseFloat(nanny.rating_avg).toFixed(1)}</span>
            </Typography>
          )}
        </Box>
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
    profile_photo: PropTypes.string,
  }).isRequired,
  onFavorite: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
  isFavorited: PropTypes.bool,
  isLoading: PropTypes.bool,
};
