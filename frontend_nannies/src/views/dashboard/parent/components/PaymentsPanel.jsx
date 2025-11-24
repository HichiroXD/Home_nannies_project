/**
 * PaymentsPanel - Panel de pagos y transacciones
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Download, CreditCard } from 'lucide-react';
import { formatters, PaginationComponent } from '@/components/common';

export const PaymentsPanel = ({ payments = [], totalSpent = 0 }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  const paginatedPayments = payments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  return (
    <Stack spacing={3}>
      {/* Resumen de pagos */}
      <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Gasto Total
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatters.currency(totalSpent)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {payments.length} transacciones registradas
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla de pagos */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Historial de Pagos
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Niñera</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Monto
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{payment.nannyName}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatters.currency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {formatters.date(payment.date)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(payment.status)}
                      color={getStatusColor(payment.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" startIcon={<Download size={16} />}>
                      Recibo
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {totalPages > 1 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <PaginationComponent
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </Box>
        )}
      </Box>

      {/* Métodos de pago */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Métodos de Pago
        </Typography>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <CreditCard size={32} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Visa •••• 1234
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Vence 12/26
                    </Typography>
                  </Box>
                </Stack>
                <Chip label="Principal" color="primary" size="small" />
              </Box>

              <Button variant="outlined" fullWidth>
                Agregar Nuevo Método
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Botón para descargar reporte */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<Download size={18} />}
        >
          Descargar Reporte de Pagos
        </Button>
      </Box>
    </Stack>
  );
};

export default PaymentsPanel;
