/**
 * AvailabilityCalendar - Calendario de disponibilidad
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

export const AvailabilityCalendar = ({
  availability = [],
  onAddAvailability,
  showAddForm = false,
  onCancel,
}) => {
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({ hours: '', startTime: '09:00', endTime: '18:00' });

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Calendario de Disponibilidad
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={onAddAvailability}
          size="small"
        >
          Agregar Horario
        </Button>
      </Box>

      {availability.length === 0 ? (
        <Card sx={{ textAlign: 'center'}}>
          <Typography color="textSecondary">
            No tienes horarios de disponibilidad configurados
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {availability.map((day, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                sx={{
                  background: day.available
                    ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
                    : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
//                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Día */}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {day.day}
                    </Typography>

                    {/* Disponibilidad */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={18} color={day.available ? '#10B981' : '#6B7280'} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: day.available ? '#10B981' : '#6B7280',
                          fontWeight: 600,
                        }}
                      >
                        {day.hours}
                      </Typography>
                    </Box>

                    {/* Bookings */}
                    {day.available && (
                      <Chip
                        label={`${day.bookings} booking${day.bookings !== 1 ? 's' : ''} programado${day.bookings !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}

                    {/* Acciones */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<Edit size={16} />}
                        onClick={() => setEditingDay(day)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Trash2 size={16} />}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para agregar/editar disponibilidad */}
      <Dialog open={showAddForm || !!editingDay} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDay ? `Editar ${editingDay.day}` : 'Agregar Disponibilidad'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Día"
              fullWidth
              disabled
              value={editingDay?.day || ''}
            />
            <TextField
              label="Hora inicio"
              type="time"
              fullWidth
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora fin"
              type="time"
              fullWidth
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log('Save availability:', formData);
              onCancel?.();
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AvailabilityCalendar;
