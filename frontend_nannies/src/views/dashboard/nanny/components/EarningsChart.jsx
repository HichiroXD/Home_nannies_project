/**
 * EarningsChart - Gráfico de ingresos con Recharts
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  Paper,
  Button,
  Collapse,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatters } from '@/components/common';
import { TrendingUp, Calendar, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

export const EarningsChart = ({ earnings = {} }) => {
  const [showAllHistory, setShowAllHistory] = useState(false);
  
  // Extraer datos del objeto earnings que viene del backend
  const earningsData = earnings.monthly || [];
  const thisMonth = earnings.thisMonth || 0;
  const totalEarnings = earnings.total || 0;

  // Calcular promedio y máximo
  const average = earningsData.length > 0 ? earningsData.reduce((sum, e) => sum + e.amount, 0) / earningsData.length : 0;
  const totalBookings = earningsData.length > 0 ? earningsData.reduce((sum, e) => sum + e.bookings, 0) : 0;
  
  // Mostrar solo últimos 6 meses o todo el historial
  const displayData = showAllHistory ? earningsData : earningsData.slice(Math.max(0, earningsData.length - 6));
  
  // Preparar datos para el gráfico
  const chartData = displayData.map(earning => {
    const monthNames = {
      'January': 'Ene', 'February': 'Feb', 'March': 'Mar',
      'April': 'Abr', 'May': 'May', 'June': 'Jun',
      'July': 'Jul', 'August': 'Ago', 'September': 'Sep',
      'October': 'Oct', 'November': 'Nov', 'December': 'Dic'
    };
    
    let shortMonth = earning.month;
    if (earning.month.includes(' ')) {
      const [month, year] = earning.month.split(' ');
      shortMonth = `${monthNames[month] || month.substring(0, 3)} '${year.substring(2)}`;
    } else {
      shortMonth = monthNames[earning.month] || earning.month.substring(0, 3);
    }
    
    return {
      ...earning,
      shortMonth,
      displayAmount: earning.amount
    };
  });

  return (
    <Stack spacing={3}>
      {/* Resumen de ingresos */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Ingresos</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(totalEarnings, 'CLP')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Este Mes</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(thisMonth, 'CLP')}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Promedio</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {formatters.currency(average, 'CLP')}
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

      {/* Gráfico de barras - Solo mostrar si hay datos */}
      {chartData.length > 0 && (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <BarChart3 size={24} color="#667eea" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Evolución Mensual de Ingresos
              </Typography>
            </Stack>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="shortMonth" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${formatters.currency(value, 'CLP')}`, 'Ingreso']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${label} - ${data.bookings} reserva${data.bookings !== 1 ? 's' : ''}`;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="displayAmount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.amount > 0 ? '#10B981' : '#e5e7eb'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              {showAllHistory 
                ? `Mostrando todos los ${chartData.length} meses de historial` 
                : `Mostrando los últimos ${chartData.length} meses`}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay datos */}
      {totalEarnings === 0 && earningsData.length === 0 && (
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Detalles Mensuales {showAllHistory ? '(Historial Completo)' : '(Últimos 6 meses)'}
              </Typography>
              {earningsData.length > 6 && (
                <Button
                  size="small"
                  startIcon={showAllHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  sx={{ textTransform: 'none' }}
                >
                  {showAllHistory ? 'Ver menos' : `Ver todo el historial (${earningsData.length} meses)`}
                </Button>
              )}
            </Box>
            <Stack spacing={1}>
              {displayData.map((earning, idx) => {
                // Traducir nombres de meses al español
                const monthNames = {
                  'January': 'Enero', 'February': 'Febrero', 'March': 'Marzo',
                  'April': 'Abril', 'May': 'Mayo', 'June': 'Junio',
                  'July': 'Julio', 'August': 'Agosto', 'September': 'Septiembre',
                  'October': 'Octubre', 'November': 'Noviembre', 'December': 'Diciembre'
                };
                
                // Manejar formato "Month YYYY" o solo "Month"
                let monthDisplay = earning.month;
                if (earning.month.includes(' ')) {
                  const [month, year] = earning.month.split(' ');
                  monthDisplay = `${monthNames[month] || month} ${year}`;
                } else {
                  monthDisplay = monthNames[earning.month] || earning.month;
                }
                
                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: '8px',
                      backgroundColor: earning.amount > 0 ? '#f0fdf4' : '#f9fafb',
                      border: earning.amount > 0 ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                      '&:hover': { backgroundColor: earning.amount > 0 ? '#dcfce7' : '#f3f4f6' },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      <Calendar size={20} color={earning.amount > 0 ? '#10B981' : '#9ca3af'} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {monthDisplay}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {earning.bookings} reserva{earning.bookings !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {earning.amount > 0 && <TrendingUp size={18} color="#10B981" />}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          minWidth: '120px', 
                          textAlign: 'right',
                          color: earning.amount > 0 ? '#059669' : '#6b7280'
                        }}
                      >
                        {earning.amount > 0 ? formatters.currency(earning.amount, 'CLP') : 'Sin ingresos'}
                      </Typography>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
            
            {/* Resumen adicional cuando se muestra todo el historial */}
            {showAllHistory && earningsData.length > 6 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                <Stack direction="row" spacing={3} justifyContent="space-around" flexWrap="wrap">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">Meses con ingresos</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e40af' }}>
                      {earningsData.filter(e => e.amount > 0).length} / {earningsData.length}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">Mejor mes</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669' }}>
                      {formatters.currency(Math.max(...earningsData.map(e => e.amount)), 'CLP')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">Promedio mensual</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#7c3aed' }}>
                      {formatters.currency(average, 'CLP')}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};

export default EarningsChart;
