/**
 * EarningsChart - Gráfico de ingresos con Recharts
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatters } from '@/components/common';
import { TrendingUp, Calendar } from 'lucide-react';

export const EarningsChart = ({ earnings = [], totalEarnings = 0 }) => {
  // Calcular promedio y máximo
  const average = earnings.length > 0 ? earnings.reduce((sum, e) => sum + e.amount, 0) / earnings.length : 0;
  const maxEarning = Math.max(...earnings.map(e => e.amount), 0);
  const totalBookings = earnings.reduce((sum, e) => sum + e.bookings, 0);

  return (
    <Stack spacing={3}>
      {/* Resumen de ingresos */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Ingresos</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(totalEarnings, 'EUR')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Promedio Mensual</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(average, 'EUR')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Ingreso Máximo</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(maxEarning, 'EUR')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Bookings</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {totalBookings}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráfico de barras */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Ingresos por Mes
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earnings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatters.currency(value, 'EUR')}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="amount" fill="#667eea" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de línea combinado */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tendencia: Ingresos vs Bookings
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earnings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'amount') return formatters.currency(value, 'EUR');
                  return value;
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="amount"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: '#667eea' }}
                name="Ingresos"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de detalles */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Detalles Mensuales
          </Typography>
          <Stack spacing={1}>
            {earnings.map((earning, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  '&:hover': { backgroundColor: '#f3f4f6' },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                  <Calendar size={20} color="#667eea" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {earning.month}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {earning.bookings} booking{earning.bookings !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TrendingUp size={18} color="#10B981" />
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px', textAlign: 'right' }}>
                    {formatters.currency(earning.amount, 'EUR')}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default EarningsChart;
