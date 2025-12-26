/**
 * OCRStatus - Estado del procesamiento OCR
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
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const OCRStatus = ({ status = {} }) => {
  const {
    total = 0,
    processed = 0,
    pending = 0,
    failed = 0,
    lastUpdate = '',
  } = status;

  const processedPercentage = total > 0 ? (processed / total) * 100 : 0;
  const failureRate = total > 0 ? ((failed / total) * 100).toFixed(1) : 0;

  return (
    <Stack spacing={3}>
      {/* Resumen OCR */}
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <FileText size={20} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Total Documentos</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
              {total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircle size={20} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Procesados</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {processed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
          <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <AlertCircle size={20} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Fallidos</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {failed}
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
                Progreso del Procesamiento
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                {processedPercentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={processedPercentage}
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
                <Typography variant="body2" color="textSecondary">Procesados</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {processed}/{total}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Tasa de Fallo</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#EF4444' }}>
                  {failureRate}%
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
                <FileText size={24} color="#667eea" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Documentos Totales</Typography>
                  <Typography variant="caption" color="textSecondary">Incluye todos los estados</Typography>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{total}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle size={24} color="#10B981" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>OCR Completado</Typography>
                  <Typography variant="caption" color="textSecondary">Procesamiento exitoso</Typography>
                </Box>
              </Box>
              <Chip
                label={`${((processed / total) * 100).toFixed(1)}%`}
                color="success"
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Clock size={24} color="#F59E0B" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>En Proceso</Typography>
                  <Typography variant="caption" color="textSecondary">Esperando procesamiento</Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{pending}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AlertCircle size={24} color="#EF4444" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Fallos</Typography>
                  <Typography variant="caption" color="textSecondary">Requieren revisión manual</Typography>
                </Box>
              </Box>
              <Chip
                label={failed}
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

export default OCRStatus;
