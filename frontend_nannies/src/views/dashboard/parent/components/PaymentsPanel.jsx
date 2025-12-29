/**
 * PaymentsPanel - Panel de pagos y transacciones
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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
                  Reserva
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
                    <Typography variant="caption" color="textSecondary">
                      {payment.bookingId || '-'}
                    </Typography>
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

      {/* Nota sobre pagos */}
      <Card sx={{ backgroundColor: '#f0f9ff', border: '1px solid #bfdbfe' }}>
        <CardContent>
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
            💡 Los pagos se realizan directamente con la niñera. Este es solo un registro de tus transacciones.
          </Typography>
        </CardContent>
      </Card>

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
