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
} from '@mui/material';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/common';

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
      id: 'name',
      label: 'Nombre',
      sortable: true,
      render: (row) => row.name,
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => row.email,
    },
    {
      id: 'role',
      label: 'Rol',
      sortable: true,
      render: (row) => (
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
      id: 'status',
      label: 'Estado',
      sortable: false,
      render: (row) => (
        <Chip
          label={row.status === 'active' ? 'Activo' : 'Inactivo'}
          color={getStatusColor(row.status)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'joinDate',
      label: 'Fecha Registro',
      sortable: true,
      render: (row) => new Date(row.joinDate).toLocaleDateString('es-ES'),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      sortable: true,
      render: (row) => row.bookings,
    },
    {
      id: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            startIcon={<Eye size={14} />}
            onClick={() => setSelectedUser(row)}
          >
            Ver
          </Button>
          <Button
            size="small"
            startIcon={<Edit size={14} />}
            onClick={() => {
              setFormData(row);
              onAddUser();
            }}
          >
            Editar
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<Trash2 size={14} />}
            onClick={() => console.log('Delete:', row.id)}
          >
            Eliminar
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gestión de Usuarios ({users.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={onAddUser}
          size="small"
        >
          Agregar Usuario
        </Button>
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
      <Dialog open={showAddForm} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Usuario</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="parent">Padre</MenuItem>
                <MenuItem value="nanny">Niñera</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log('Save user:', formData);
              onCancel?.();
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para ver detalles */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedUser && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="textSecondary">Nombre</Typography>
                <Typography variant="body1">{selectedUser.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant="body1">{selectedUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Rol</Typography>
                <Chip
                  label={getRoleLabel(selectedUser.role)}
                  size="small"
                  sx={{
                    backgroundColor: getRoleColor(selectedUser.role),
                    color: 'white',
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Estado</Typography>
                <Chip
                  label={selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}
                  color={getStatusColor(selectedUser.status)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Fecha de Registro</Typography>
                <Typography variant="body1">
                  {new Date(selectedUser.joinDate).toLocaleDateString('es-ES')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">Total Bookings</Typography>
                <Typography variant="body1">{selectedUser.bookings}</Typography>
              </Box>
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
