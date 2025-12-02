/**
 * AcademicStatus - Estado de verificación académica
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
  LinearProgress,
  Chip,
} from '@mui/material';
import { Award, CheckCircle, Clock, XCircle } from 'lucide-react';

export const AcademicStatus = ({ status = {} }) => {
  const {
    total = 0,
    verified = 0,
    pending = 0,
    rejected = 0,
    lastUpdate = '',
  } = status;

  const verifiedPercentage = total > 0 ? (verified / total) * 100 : 0;
  const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : 0;

  return (
    <Stack spacing={3}>
      {/* Resumen Academic */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Certificados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircle size={20} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Verificados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {verified}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Clock size={20} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Pendientes</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {pending}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <XCircle size={20} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Rechazados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {rejected}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Barra de progreso */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Progreso de Verificación
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                {verifiedPercentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={verifiedPercentage}
              sx={{
                height: '12px',
                borderRadius: '6px',
                backgroundColor: '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">Verificados</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {verified}/{total}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Tasa de Rechazo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#EF4444' }}>
                  {rejectionRate}%
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Detalles */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Estado Detallado
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Award size={24} color="#667eea" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Certificados Totales</Typography>
                  <Typography variant="caption" color="textSecondary">Incluye todos los estados</Typography>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{total}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle size={24} color="#10B981" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Verificados</Typography>
                  <Typography variant="caption" color="textSecondary">Aprobados y válidos</Typography>
                </Box>
              </Box>
              <Chip
                label={`${((verified / total) * 100).toFixed(1)}%`}
                color="success"
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Clock size={24} color="#F59E0B" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>En Revisión</Typography>
                  <Typography variant="caption" color="textSecondary">Esperando revisión manual</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{pending}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <XCircle size={24} color="#EF4444" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Rechazados</Typography>
                  <Typography variant="caption" color="textSecondary">No cumplen criterios</Typography>
                </Box>
              </Box>
              <Chip
                label={rejected}
                color="error"
                size="small"
              />
            </Box>
          </Stack>

          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e5e7eb' }}>
            <Typography variant="caption" color="textSecondary">
              Última actualización: {lastUpdate || 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AcademicStatus;
