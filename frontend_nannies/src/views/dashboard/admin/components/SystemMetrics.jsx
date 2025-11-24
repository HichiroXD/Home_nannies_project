/**
 * SystemMetrics - Métricas del sistema
 */

import React from 'react';
import { Grid } from '@mui/material';
import { StatCard, formatters } from '@/components/common';
import { Users, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';

export const SystemMetrics = ({ metrics = {} }) => {
  const {
    totalUsers = 0,
    activeUsers = 0,
    totalNannies = 0,
    totalBookings = 0,
  } = metrics;

  const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Usuarios"
          value={totalUsers}
          subtitle={`${activeUsers} activos`}
          icon={Users}
          color="primary"
          trend={{ value: activePercentage, isPositive: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Niñeras"
          value={totalNannies}
          subtitle="Verificadas"
          icon={CheckCircle}
          color="success"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          subtitle="Histórico"
          icon={BarChart3}
          color="warning"
          trend={{ value: 8, isPositive: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tasa de Éxito"
          value={`${metrics.successRate || 0}%`}
          subtitle="Bookings completados"
          icon={TrendingUp}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

export default SystemMetrics;
