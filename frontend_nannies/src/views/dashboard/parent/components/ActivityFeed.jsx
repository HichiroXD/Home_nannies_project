/**
 * ActivityFeed - Feed de actividades y notificaciones
 */

import React, { useMemo } from 'react';
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  Calendar,
  Bell,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { formatters } from '@/components/common';

const getActivityIcon = (activityType) => {
  switch (activityType) {
    case 'booking_completed':
      return <CheckCircle size={20} />;
    case 'rating_received':
      return <Star size={20} />;
    case 'booking_requested':
      return <Calendar size={20} />;
    case 'message_received':
      return <MessageSquare size={20} />;
    case 'nanny_confirmed':
      return <CheckCircle size={20} />;
    case 'promotion':
      return <Zap size={20} />;
    default:
      return <Bell size={20} />;
  }
};

const getActivityColor = (activityType) => {
  switch (activityType) {
    case 'booking_completed':
      return '#10B981';
    case 'rating_received':
      return '#F59E0B';
    case 'booking_requested':
      return '#3B82F6';
    case 'message_received':
      return '#8B5CF6';
    case 'nanny_confirmed':
      return '#06B6D4';
    case 'promotion':
      return '#EC4899';
    default:
      return '#6B7280';
  }
};

const getActivityLabel = (activityType) => {
  switch (activityType) {
    case 'booking_completed':
      return 'Reserva Completada';
    case 'rating_received':
      return 'Calificación Recibida';
    case 'booking_requested':
      return 'Solicitud de Reserva';
    case 'message_received':
      return 'Mensaje Recibido';
    case 'nanny_confirmed':
      return 'Niñera Confirmada';
    case 'promotion':
      return 'Promoción Especial';
    default:
      return 'Actividad';
  }
};

export const ActivityFeed = ({ activities = [] }) => {
  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [activities]);

  const groupedActivities = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped = {
      today: [],
      yesterday: [],
      older: [],
    };

    sortedActivities.forEach((activity) => {
      try {
        // Convertir timestamp string a Date, manejando formato con espacio
        const timestamp = activity.timestamp.replace(' ', 'T');
        const activityDate = new Date(timestamp);
        activityDate.setHours(0, 0, 0, 0);

        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);

        if (activityDate.getTime() === today.getTime()) {
          grouped.today.push(activity);
        } else if (activityDate.getTime() === yesterday.getTime()) {
          grouped.yesterday.push(activity);
        } else {
          grouped.older.push(activity);
        }
      } catch (error) {
        console.error('Error parsing activity date:', error);
        grouped.older.push(activity);
      }
    });

    return grouped;
  }, [sortedActivities]);

  const ActivityCard = ({ activity }) => (
    <Card
      sx={{
        mb: 1.5,
        borderLeft: `4px solid ${getActivityColor(activity.type)}`,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateX(4px)',
          transition: 'all 0.2s ease',
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: `${getActivityColor(activity.type)}20`,
              color: getActivityColor(activity.type),
              flexShrink: 0,
            }}
          >
            {getActivityIcon(activity.type)}
          </Box>

          {/* Content */}
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {activity.title}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatters.relativeTime(activity.timestamp)}
              </Typography>
            </Box>

            <Typography variant="body2" color="textSecondary">
              {activity.description}
            </Typography>

            {/* Activity details */}
            {activity.details && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {Array.isArray(activity.details) ? (
                  activity.details.map((detail, idx) => (
                    <Chip
                      key={idx}
                      label={detail}
                      size="small"
                      variant="outlined"
                      sx={{ height: 24 }}
                    />
                  ))
                ) : (
                  <Chip
                    label={activity.details}
                    size="small"
                    variant="outlined"
                    sx={{ height: 24 }}
                  />
                )}
              </Box>
            )}

            {/* Avatar for related person */}
            {activity.relatedPerson && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Avatar
                  src={activity.relatedPerson.avatar}
                  sx={{ width: 24, height: 24 }}
                />
                <Typography variant="caption" color="textSecondary">
                  {activity.relatedPerson.name}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Stack spacing={3}>
      {/* Hoy */}
      {groupedActivities.today.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#667eea',
              mb: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            Hoy
          </Typography>
          <Stack spacing={1}>
            {groupedActivities.today.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Ayer */}
      {groupedActivities.yesterday.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#667eea',
              mb: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            Ayer
          </Typography>
          <Stack spacing={1}>
            {groupedActivities.yesterday.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Anterior */}
      {groupedActivities.older.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#667eea',
              mb: 1.5,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            }}
          >
            Anterior
          </Typography>
          <Stack spacing={1}>
            {groupedActivities.older.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </Stack>
        </Box>
      )}

      {/* Empty state */}
      {activities.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Bell size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <Typography variant="body2" color="textSecondary">
              No hay actividades recientes
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default ActivityFeed;
