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
import { formatters } from '@/components/common';
import { TrendingUp, Calendar } from 'lucide-react';

export const EarningsChart = ({ earnings = {} }) => {
  // Manejar tanto formato de array antiguo como objeto nuevo del API
  const earningsData = Array.isArray(earnings) ? earnings : [];
  const thisMonth = typeof earnings === 'object' && !Array.isArray(earnings) ? earnings.thisMonth || 0 : 0;
  const totalEarnings = typeof earnings === 'object' && !Array.isArray(earnings) ? earnings.total || 0 : 0;

  // Calcular promedio y máximo
  const average = earningsData.length > 0 ? earningsData.reduce((sum, e) => sum + e.amount, 0) / earningsData.length : 0;
  const totalBookings = earningsData.reduce((sum, e) => sum + e.bookings, 0);

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
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Este Mes</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(thisMonth, 'EUR')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Promedio</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(average, 'EUR')}
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

      {/* Mensaje cuando no hay datos */}
      {earningsData.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <TrendingUp size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Sin ingresos registrados
            </Typography>
            <Typography color="textSecondary" variant="body2">
              Aún no tienes bookings completados. ¡Comienza a aceptar reservas para ver tus ingresos!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Tabla de detalles - Solo mostrar si hay datos */}
      {earningsData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Detalles Mensuales
            </Typography>
            <Stack spacing={1}>
              {earningsData.map((earning, idx) => (
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
      )}
    </Stack>
  );
};

export default EarningsChart;
