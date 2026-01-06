/**
 * StatsOverview - Tarjetas de estadísticas principales
 */

import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { StatCard, formatters } from '@/components/common';
import { DollarSign, Calendar, Heart, TrendingUp } from 'lucide-react';

export const StatsOverview = ({ stats = {} }) => {
  const {
    totalSpent = 0,
    activeBookings = 0,
    upcomingBookings = 0,
    savedNannies = 0,
  } = stats;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Gasto Total"
          value={formatters.currency(totalSpent, 'CLP')}
          subtitle="En lo que va del mes"
          icon={DollarSign}
          color="success"
          trend={
            totalSpent > 0 ? { value: 15, isPositive: true } : undefined
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
          title="Próximos Bookings"
          value={upcomingBookings}
          subtitle="Esta semana"
          icon={TrendingUp}
          color="warning"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Niñeras Favoritas"
          value={savedNannies}
          subtitle="Guardadas"
          icon={Heart}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

export default StatsOverview;
