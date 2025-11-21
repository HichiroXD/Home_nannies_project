/**
 * ReportsView - Vista de reportes y analytics
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
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users } from 'lucide-react';
import { formatters } from '@/components/common';

export const ReportsView = ({ reports = [] }) => {
  // Calcular totales
  const totalBookings = reports.reduce((sum, r) => sum + r.bookings, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const totalUsers = reports.length > 0 ? reports[reports.length - 1].users : 0;
  const avgBookingsPerMonth = Math.round(totalBookings / reports.length);

  return (
    <Stack spacing={3}>
      {/* Resumen de reportes */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Bookings</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {totalBookings}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Ingresos Totales</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(totalRevenue, 'EUR')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Promedio Mensual</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {avgBookingsPerMonth}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Usuarios Activos</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {totalUsers}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráfico de línea: Crecimiento de Usuarios */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Crecimiento de Usuarios
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: '#667eea' }}
                name="Usuarios"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras: Bookings vs Ingresos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Bookings e Ingresos
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reports}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'revenue') return formatters.currency(value, 'EUR');
                  return value;
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="bookings"
                fill="#667eea"
                radius={8}
                name="Bookings"
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                fill="#10B981"
                radius={8}
                name="Ingresos"
              />
            </BarChart>
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
            {reports.map((report, idx) => (
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {report.month}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={3} sx={{ textAlign: 'right' }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Bookings</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {report.bookings}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Ingresos</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatters.currency(report.revenue, 'EUR')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">Usuarios</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {report.users}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ReportsView;
