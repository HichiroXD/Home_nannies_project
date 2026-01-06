/**
 * UserManagement - Gestión de usuarios con DataTable
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
} from '@mui/material';
import { Plus, Edit, Trash2, Eye, User, Baby, Calendar, AlertCircle, Heart } from 'lucide-react';
import { DataTable } from '@/components/common';
import UserActionButtons from './UserActionButtons';

export const UserManagement = ({
  users = [],
  onAddUser,
  showAddForm = false,
  onCancel,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'parent',
  });

  // Debug: Log usuarios recibidos
  React.useEffect(() => {
    console.log('UserManagement - Usuarios recibidos:', users);
    console.log('UserManagement - Cantidad:', users?.length);
  }, [users]);
  const getRoleColor = (role) => {
    switch (role) {
      case 'nanny':
        return '#10B981';
      case 'parent':
        return '#3B82F6';
      case 'admin':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'nanny':
        return 'Niñera';
      case 'parent':
        return 'Padre';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'default';
  };

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value, row) => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Sin nombre',
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value, row) => row.email,
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value, row) => (
        <Chip
          label={getRoleLabel(row.role)}
          size="small"
          sx={{
            backgroundColor: getRoleColor(row.role),
            color: 'white',
          }}
        />
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: false,
      render: (value, row) => (
        <Chip
          label={row.status === 'active' ? 'Activo' : 'Inactivo'}
          color={getStatusColor(row.status)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      key: 'joinDate',
      label: 'Fecha Registro',
      sortable: true,
      render: (value, row) => new Date(row.joinDate).toLocaleDateString('es-ES'),
    },
    {
      key: 'bookings',
      label: 'Bookings',
      sortable: true,
      render: (value, row) => row.bookings,
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (value, row) => (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            startIcon={<Eye size={14} />}
            onClick={() => setSelectedUser(row)}
          >
            Ver
          </Button>
        </Stack>
      ),
    },
    {
      key: 'management',
      label: 'Gestión',
      sortable: false,
      render: (value, row) => (
        <UserActionButtons user={row} onActionComplete={() => window.location.reload()} />
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gestión de Usuarios ({users.length})
        </Typography>
      </Box>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={users}
        striped
        highlightOnHover
        pagination
        searchable
        sortable
      />

      {/* Dialog para agregar/editar usuario */}
      

      {/* Modal para ver detalles */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <User size={24} />
            <Typography variant="h6">Detalles del Usuario</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <Stack spacing={3}>
              {/* Foto de perfil */}
              {(selectedUser.profile_photo || selectedUser.parent_profile?.profile_photo) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar
                    src={selectedUser.profile_photo || selectedUser.parent_profile?.profile_photo}
                    alt={selectedUser.name}
                    sx={{ width: 120, height: 120 }}
                  />
                </Box>
              )}

              {/* Información básica */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    INFORMACIÓN BÁSICA
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Nombre:</Typography>
                        <Typography variant="body2">{selectedUser.name}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Email:</Typography>
                        <Typography variant="body2">{selectedUser.email}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Rol:</Typography>
                        <Chip
                          label={getRoleLabel(selectedUser.role)}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(selectedUser.role),
                            color: 'white',
                          }}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Estado:</Typography>
                        <Chip
                          label={selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}
                          color={getStatusColor(selectedUser.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Fecha de Registro:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedUser.joinDate).toLocaleDateString('es-ES')}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Bookings:</Typography>
                        <Typography variant="body2">{selectedUser.bookings}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Información de hijos (solo para padres) */}
              {selectedUser.role === 'parent' && selectedUser.parent_profile?.children && selectedUser.parent_profile.children.length > 0 && (
                <Card variant="outlined" sx={{ borderColor: '#3B82F6' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Baby size={18} />
                        <span>HIJOS REGISTRADOS ({selectedUser.parent_profile.children.length})</span>
                      </Stack>
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {selectedUser.parent_profile.children.map((child, index) => (
                        <ListItem 
                          key={child.id || index}
                          sx={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1, 
                            mb: 1,
                            '&:last-child': { mb: 0 }
                          }}
                        >
                          <ListItemIcon>
                            <Avatar sx={{ bgcolor: '#3B82F6' }}>
                              {child.name?.charAt(0) || '?'}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {child.name}
                              </Typography>
                            }
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Calendar size={14} />
                                  <Typography variant="caption">
                                    {child.age} años
                                    {child.date_of_birth && ` (${new Date(child.date_of_birth).toLocaleDateString('es-ES')})`}
                                  </Typography>
                                </Stack>
                                {child.gender && (
                                  <Typography variant="caption">
                                    Género: {child.gender === 'male' ? 'Masculino' : child.gender === 'female' ? 'Femenino' : 'Otro'}
                                  </Typography>
                                )}
                                {child.allergies && (
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <AlertCircle size={14} color="#EF4444" />
                                    <Typography variant="caption" color="error">
                                      Alergias: {child.allergies}
                                    </Typography>
                                  </Stack>
                                )}
                                {child.medical_conditions && (
                                  <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Heart size={14} color="#F59E0B" />
                                    <Typography variant="caption" color="warning.main">
                                      Condiciones: {child.medical_conditions}
                                    </Typography>
                                  </Stack>
                                )}
                                {child.special_needs && (
                                  <Typography variant="caption" color="text.secondary">
                                    Necesidades especiales: {child.special_needs}
                                  </Typography>
                                )}
                                {child.notes && (
                                  <Typography variant="caption" color="text.secondary">
                                    Notas: {child.notes}
                                  </Typography>
                                )}
                              </Stack>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Mensaje si no hay hijos registrados */}
              {selectedUser.role === 'parent' && (!selectedUser.parent_profile?.children || selectedUser.parent_profile.children.length === 0) && (
                <Card variant="outlined" sx={{ borderColor: '#F59E0B' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Baby size={24} color="#F59E0B" />
                      <Typography variant="body2" color="text.secondary">
                        Este padre no ha registrado información de hijos aún.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default UserManagement;
