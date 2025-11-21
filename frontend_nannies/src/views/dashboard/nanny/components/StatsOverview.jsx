/**
 * StatsOverview - Tarjetas de estadísticas para niñeras
 */

import React from 'react';
import { Grid } from '@mui/material';
import { StatCard, formatters } from '@/components/common';
import { TrendingUp, Calendar, CheckCircle, Star } from 'lucide-react';

export const StatsOverview = ({ stats = {} }) => {
  const {
    totalEarnings = 0,
    activeBookings = 0,
    completedBookings = 0,
    averageRating = 0,
  } = stats;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Ingresos Totales"
          value={formatters.currency(totalEarnings, 'EUR')}
          subtitle="Este mes"
          icon={TrendingUp}
          color="success"
          trend={
            totalEarnings > 0 ? { value: 12, isPositive: true } : undefined
          }
        />
      </Grid>

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
          title="Calificación"
          value={`${averageRating}/5`}
          subtitle="Promedio"
          icon={Star}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

export default StatsOverview;
