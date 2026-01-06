/**
 * Badge - Componente para mostrar estados, etiquetas y badges variados
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BadgeComponentBase = ({
  label,
  variant = 'filled', // 'filled', 'outlined', 'tonal'
  color = 'primary', // 'primary', 'success', 'error', 'warning', 'info', 'default'
  size = 'medium', // 'small', 'medium'
  icon,
  onDelete,
  clickable = false,
  onClick,
  sx,
}) => {
  const getColorConfig = (c, variant) => {
    const colors = {
      primary: {
        filled: { backgroundColor: '#1976d2', color: 'white' },
        outlined: { border: '1px solid #1976d2', color: '#1976d2' },
        tonal: { backgroundColor: '#e3f2fd', color: '#1976d2' },
      },
      success: {
        filled: { backgroundColor: '#4caf50', color: 'white' },
        outlined: { border: '1px solid #4caf50', color: '#4caf50' },
        tonal: { backgroundColor: '#e8f5e9', color: '#4caf50' },
      },
      error: {
        filled: { backgroundColor: '#f44336', color: 'white' },
        outlined: { border: '1px solid #f44336', color: '#f44336' },
        tonal: { backgroundColor: '#ffebee', color: '#f44336' },
      },
      warning: {
        filled: { backgroundColor: '#ff9800', color: 'white' },
        outlined: { border: '1px solid #ff9800', color: '#ff9800' },
        tonal: { backgroundColor: '#fff3e0', color: '#ff9800' },
      },
      info: {
        filled: { backgroundColor: '#2196f3', color: 'white' },
        outlined: { border: '1px solid #2196f3', color: '#2196f3' },
        tonal: { backgroundColor: '#e1f5fe', color: '#2196f3' },
      },
      default: {
        filled: { backgroundColor: '#e0e0e0', color: '#333' },
        outlined: { border: '1px solid #bdbdbd', color: '#333' },
        tonal: { backgroundColor: '#f5f5f5', color: '#666' },
      },
    };
    return colors[c]?.[variant] || colors.default[variant];
  };

  return (
    <Chip
      label={label}
      icon={icon}
      onDelete={onDelete}
      onClick={clickable ? onClick : undefined}
      clickable={clickable}
      size={size}
      sx={{
        ...getColorConfig(color, variant),
        cursor: clickable ? 'pointer' : 'default',
        fontWeight: 500,
        ...sx,
      }}
    />
  );
};

BadgeComponentBase.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['filled', 'outlined', 'tonal']),
  color: PropTypes.oneOf(['primary', 'success', 'error', 'warning', 'info', 'default']),
  size: PropTypes.oneOf(['small', 'medium']),
  icon: PropTypes.node,
  onDelete: PropTypes.func,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  sx: PropTypes.object,
};

export const BadgeComponent = memo(BadgeComponentBase);
BadgeComponent.displayName = 'BadgeComponent';

export const StatusBadge = memo(({
  status = 'pending', // 'active', 'pending', 'inactive', 'error'
  label,
  size = 'small',
}) => {
  const statusConfig = {
    active: { color: 'success', icon: <CheckCircle size={14} />, label: 'Activo' },
    pending: { color: 'warning', icon: <Clock size={14} />, label: 'Pendiente' },
    inactive: { color: 'default', icon: null, label: 'Inactivo' },
    error: { color: 'error', icon: <AlertCircle size={14} />, label: 'Error' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <BadgeComponent
      label={label || config.label}
      color={config.color}
      variant="tonal"
      size={size}
      icon={config.icon}
    />
  );
});

StatusBadge.displayName = 'StatusBadge';
StatusBadge.propTypes = {
  status: PropTypes.oneOf(['active', 'pending', 'inactive', 'error']),
  label: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export const RoleBadge = memo(({ role = 'user' }) => {
  const roleConfig = {
    admin: { label: 'Administrador', color: 'error' },
    user: { label: 'Usuario', color: 'primary' },
    nanny: { label: 'Nanny', color: 'success' },
    parent: { label: 'Padre/Madre', color: 'info' },
    guest: { label: 'Invitado', color: 'default' },
  };

  const config = roleConfig[role] || roleConfig.user;

  return (
    <BadgeComponent
      label={config.label}
      color={config.color}
      variant="filled"
      size="small"
    />
  );
});

RoleBadge.displayName = 'RoleBadge';
RoleBadge.propTypes = {
  role: PropTypes.oneOf(['admin', 'user', 'nanny', 'parent', 'guest']),
};

export const PriorityBadge = memo(({ priority = 'medium' }) => {
  const priorityConfig = {
    high: { label: 'Alta', color: 'error' },
    medium: { label: 'Media', color: 'warning' },
    low: { label: 'Baja', color: 'info' },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <BadgeComponent
      label={config.label}
      color={config.color}
      variant="filled"
      size="small"
    />
  );
});

PriorityBadge.displayName = 'PriorityBadge';
PriorityBadge.propTypes = {
  priority: PropTypes.oneOf(['high', 'medium', 'low']),
};

export const CategoryBadge = memo(({ category, color = 'primary' }) => {
  return (
    <BadgeComponent
      label={category}
      color={color}
      variant="outlined"
      size="small"
    />
  );
});

CategoryBadge.displayName = 'CategoryBadge';
CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'success', 'error', 'warning', 'info', 'default']),
};

export const TagList = memo(({ tags = [], onTagClick, onTagRemove }) => {
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      {tags.map((tag, idx) => (
        <BadgeComponent
          key={idx}
          label={tag}
          variant="outlined"
          color="primary"
          clickable={!!onTagClick}
          onClick={() => onTagClick?.(tag)}
          onDelete={onTagRemove ? () => onTagRemove(idx) : undefined}
        />
      ))}
    </Stack>
  );
});

TagList.displayName = 'TagList';
TagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  onTagClick: PropTypes.func,
  onTagRemove: PropTypes.func,
};

export const NotificationBadge = memo(({ count = 0, max = 99 }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        backgroundColor: '#f44336',
        color: 'white',
        borderRadius: '10px',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {displayCount}
    </Box>
  );
});

NotificationBadge.displayName = 'NotificationBadge';
NotificationBadge.propTypes = {
  count: PropTypes.number,
  max: PropTypes.number,
};

export const AvatarBadge = memo(({
  src,
  name,
  status = 'active', // 'active', 'away', 'offline'
  size = 'medium',
}) => {
  const statusColors = {
    active: '#4caf50',
    away: '#ff9800',
    offline: '#bdbdbd',
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar src={src} alt={name} sx={{ width: 40, height: 40 }}>
        {name?.charAt(0)}
      </Avatar>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          backgroundColor: statusColors[status],
          borderRadius: '50%',
          border: '2px solid white',
        }}
      />
    </Box>
  );
});

AvatarBadge.displayName = 'AvatarBadge';
AvatarBadge.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  status: PropTypes.oneOf(['active', 'away', 'offline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export const ProgressBadge = memo(({ value = 50 }) => {
  const getColor = (v) => {
    if (v >= 75) return '#4caf50';
    if (v >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: `${getColor(value)}20`,
        color: getColor(value),
        fontWeight: 600,
        fontSize: '0.875rem',
      }}
    >
      {value}%
    </Box>
  );
});

ProgressBadge.displayName = 'ProgressBadge';
ProgressBadge.propTypes = {
  value: PropTypes.number,
};

export default BadgeComponent;
