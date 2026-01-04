/**
 * ReportsView - Vista de reportes y analytics con métricas reales
 * Sprint 4 - Sistema integrado de reporting y analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Grid,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ButtonGroup,
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
import { TrendingUp, Download, FileText, FileSpreadsheet, Calendar, BarChart3 } from 'lucide-react';
import { formatters } from '@/components/common';
import metricsApi from '@/api/metricsApi';
import MetricCard from '@/components/metrics/MetricCard';

export const ReportsView = () => {
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [bookingsData, setBookingsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topNannies, setTopNannies] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, bookingsRes, revenueRes, nanniesRes] = await Promise.all([
        metricsApi.getOverview(period).catch(e => {
          console.error('Error en overview:', e);
          return { total_users: 0, total_bookings: 0, total_revenue: 0, verification_rate: 0, user_growth: 0, booking_growth: 0, revenue_growth: 0 };
        }),
        metricsApi.getBookingMetrics(period).catch(e => {
          console.error('Error en bookings:', e);
          return { by_status: [], by_period: [] };
        }),
        metricsApi.getRevenueMetrics(period).catch(e => {
          console.error('Error en revenue:', e);
          return { by_month: [], total_revenue: 0 };
        }),
        metricsApi.getTopNannies(period).catch(e => {
          console.error('Error en top nannies:', e);
          return { top_nannies: [] };
        }),
      ]);

      setOverview(overviewRes);
      
      // Transform booking data for recharts
      const bookingChart = bookingsRes.by_status?.map(item => ({
        status: item.status,
        count: item.count
      })) || [];
      setBookingsData(bookingChart);

      // Transform revenue data for recharts
      const revenueChart = revenueRes.by_month?.map(item => ({
        month: item.month,
        ingresos: parseFloat(item.total_revenue)
      })) || [];
      setRevenueData(revenueChart);

      setTopNannies(nanniesRes.top_nannies || []);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(`Error al cargar las métricas: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type, format) => {
    try {
      setDownloading(true);
      let response;

      switch (type) {
        case 'payments':
          response = await metricsApi.downloadPaymentReport(format);
          break;
        case 'bookings':
          response = await metricsApi.downloadBookingsReport(format);
          break;
        case 'users':
          response = await metricsApi.downloadUsersReport(format);
          break;
        default:
          return;
      }

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading report:', err);
      alert(`Error al descargar el reporte: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      {/* Header con selector de período */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={600}>
          Reportes y Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Período</InputLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Período">
            <MenuItem value={7}>Últimos 7 días</MenuItem>
            <MenuItem value={30}>Últimos 30 días</MenuItem>
            <MenuItem value={90}>Últimos 90 días</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Métricas principales */}
      {overview && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Usuarios"
              value={overview.total_users}
              trend={overview.user_growth}
              icon={<TrendingUp />}
              color="blue"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Reservas"
              value={overview.total_bookings}
              trend={overview.booking_growth}
              icon={<Calendar />}
              color="green"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Ingresos Totales"
              value={`${formatters.currency(overview.total_revenue, 'CLP')}`}
              trend={overview.revenue_growth}
              icon={<BarChart3 />}
              color="purple"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Tasa de Aprobación"
              value={`${overview.verification_rate}%`}
              icon={<TrendingUp />}
              color="orange"
            />
          </Grid>
        </Grid>
      )}

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reservas por Estado
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3498DB" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingresos Mensuales
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Ingresos (CLP)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Nannies */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top 5 Nannies
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="right">Total Reservas</TableCell>
                  <TableCell align="right">Reservas Completadas</TableCell>
                  <TableCell align="right">Rating Promedio</TableCell>
                  <TableCell align="right">Ingresos Generados</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topNannies.map((nanny, index) => (
                  <TableRow key={index}>
                    <TableCell>{nanny.name}</TableCell>
                    <TableCell align="right">{nanny.total_bookings}</TableCell>
                    <TableCell align="right">{nanny.completed_bookings}</TableCell>
                    <TableCell align="right">{nanny.average_rating?.toFixed(1) || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {formatters.currency(nanny.total_revenue, 'CLP')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Descargas */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Descargar Reportes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Reporte de Pagos
                </Typography>
                <ButtonGroup variant="outlined" disabled={downloading}>
                  <Button
                    startIcon={<FileText size={16} />}
                    onClick={() => handleDownload('payments', 'csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    startIcon={<FileText size={16} />}
                    onClick={() => handleDownload('payments', 'pdf')}
                  >
                    PDF
                  </Button>
                  <Button
                    startIcon={<FileSpreadsheet size={16} />}
                    onClick={() => handleDownload('payments', 'excel')}
                  >
                    Excel
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Reporte de Reservas
                </Typography>
                <ButtonGroup variant="outlined" disabled={downloading}>
                  <Button
                    startIcon={<FileText size={16} />}
                    onClick={() => handleDownload('bookings', 'csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    startIcon={<FileText size={16} />}
                    onClick={() => handleDownload('bookings', 'pdf')}
                  >
                    PDF
                  </Button>
                  <Button
                    startIcon={<FileSpreadsheet size={16} />}
                    onClick={() => handleDownload('bookings', 'excel')}
                  >
                    Excel
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Reporte de Usuarios
                </Typography>
                <ButtonGroup variant="outlined" disabled={downloading}>
                  <Button
                    startIcon={<FileText size={16} />}
                    onClick={() => handleDownload('users', 'csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    startIcon={<FileText size={16} />}
                    onClick={() => handleDownload('users', 'pdf')}
                  >
                    PDF
                  </Button>
                  <Button
                    startIcon={<FileSpreadsheet size={16} />}
                    onClick={() => handleDownload('users', 'excel')}
                  >
                    Excel
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ReportsView;
