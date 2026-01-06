/**
 * StatsOverview - Tarjetas de estadísticas para niñeras
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import { StatCard, formatters } from '@/components/common';
import { TrendingUp, Calendar, CheckCircle, Star } from 'lucide-react';

export const StatsOverview = ({ stats = {} }) => {
  const {
    activeBookings = 0,
    completedBookings = 0,
    avgRating = 0,
    totalReviews = 0,
  } = stats;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Bookings Activos"
          value={activeBookings}
          subtitle="En progreso"
          icon={Calendar}
          color="primary"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Completados"
          value={completedBookings}
          subtitle="Total histórico"
          icon={CheckCircle}
          color="warning"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Reseñas"
          value={totalReviews}
          subtitle="De clientes"
          icon={Star}
          color="error"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Calificación"
          value={`${avgRating.toFixed(1)}/5`}
          subtitle="Promedio"
          icon={TrendingUp}
          color="success"
        />
      </Grid>
    </Grid>
  );
};

export default StatsOverview;
