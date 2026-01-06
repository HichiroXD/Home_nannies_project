/**
 * StatCard - Componente para mostrar estadísticas
 * Ideal para dashboards
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // { value: number, isPositive: boolean }
  color = 'primary',
  progress, // { current: number, max: number }
  onClick,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive ? (
      <TrendingUp size={20} style={{ color: '#4caf50' }} />
    ) : (
      <TrendingDown size={20} style={{ color: '#f44336' }} />
    );
  };

  const getColorByType = (c) => {
    const colorMap = {
      primary: '#1976d2',
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
    };
    return colorMap[c] || '#1976d2';
  };

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': onClick && {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography color="textSecondary" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="textSecondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                backgroundColor: `${getColorByType(color)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getColorByType(color),
              }}
            >
              {Icon && <Icon size={24} />}
            </Box>
          </Box>

          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getTrendIcon()}
              <Typography
                variant="body2"
                sx={{
                  color: trend.isPositive ? '#4caf50' : '#f44336',
                  fontWeight: 500,
                }}
              >
                {Math.abs(trend.value)}% {trend.isPositive ? 'arriba' : 'abajo'}
              </Typography>
            </Box>
          )}

          {progress && (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="caption">Progreso</Typography>
                <Typography variant="caption">
                  {progress.current} de {progress.max}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(progress.current / progress.max) * 100}
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  /** Título de la tarjeta */
  title: PropTypes.string.isRequired,
  /** Valor principal */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Subtítulo o descripción */
  subtitle: PropTypes.string,
  /** Icono (componente React) */
  icon: PropTypes.elementType,
  /** Tendencia: { value: número, isPositive: booleano } */
  trend: PropTypes.shape({
    value: PropTypes.number,
    isPositive: PropTypes.bool,
  }),
  /** Color: 'primary', 'success', 'error', 'warning', 'info' */
  color: PropTypes.oneOf(['primary', 'success', 'error', 'warning', 'info']),
  /** Progreso: { current: número, max: número } */
  progress: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
  }),
  /** Callback al hacer click */
  onClick: PropTypes.func,
};

StatCard.defaultProps = {
  color: 'primary',
};

export default memo(StatCard);
