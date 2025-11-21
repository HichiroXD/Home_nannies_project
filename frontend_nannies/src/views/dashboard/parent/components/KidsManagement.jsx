/**
 * KidsManagement - Panel para gestionar hijos
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
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { FormBuilder, useForm } from '@/components/common';

export const KidsManagement = ({
  kids = [],
  onAddKid,
  showAddForm = false,
  onCancel,
}) => {
  const [editingKid, setEditingKid] = useState(null);

  const form = useForm(
    {
      name: editingKid?.name || '',
      age: editingKid?.age || '',
      interests: '',
    },
    (values) => {
      console.log('Save kid:', values);
      // Aquí iría la llamada a API para guardar
    }
  );

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Mis Hijos ({kids.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={onAddKid}
          size="small"
        >
          Agregar Hijo
        </Button>
      </Box>

      {kids.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Typography color="textSecondary">
            No tienes hijos agregados aún
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {kids.map((kid) => (
            <Grid item xs={12} sm={6} md={4} key={kid.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar sx={{ width: 56, height: 56 }}>
                        {kid.name?.charAt(0)}
                      </Avatar>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          icon={<Edit size={16} />}
                          onClick={() => setEditingKid(kid)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button size="small" color="error">
                          <Trash2 size={16} />
                        </Button>
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {kid.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {kid.age} años
                      </Typography>
                    </Box>

                    {kid.interests && kid.interests.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Intereses:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          {kid.interests.slice(0, 2).map((interest, idx) => (
                            <Chip key={idx} label={interest} size="small" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para agregar/editar hijo */}
      <Dialog open={showAddForm} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingKid ? 'Editar Hijo' : 'Agregar Nuevo Hijo'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormBuilder
            fields={[
              {
                name: 'name',
                label: 'Nombre',
                type: 'text',
                required: true,
                value: form.values.name,
              },
              {
                name: 'age',
                label: 'Edad',
                type: 'number',
                required: true,
                value: form.values.age,
              },
              {
                name: 'interests',
                label: 'Intereses (separados por coma)',
                type: 'textarea',
                value: form.values.interests,
              },
            ]}
            onSubmit={(values) => {
              console.log('Form submitted:', values);
              onCancel?.();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => form.handleSubmit({ preventDefault: () => {} })}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default KidsManagement;
