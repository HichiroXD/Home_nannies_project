/**
 * AdminHeader - Encabezado del dashboard administrativo
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Settings, LogOut, Shield } from 'lucide-react';
import useAuthStore from '@/stores/useAuthStore';

export const AdminHeader = ({ admin = {} }) => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    // Usar store de Zustand para logout
    logout();
    
    // Redirigir al login
    navigate('/login');
  };

  const handleSettings = () => {
    // Redirigir a la página de configuración
    navigate('/settings');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        borderRadius: '12px',
        color: 'white',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            width: 56,
            height: 56,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          {admin.avatar || 'A'}
        </Avatar>
        <Stack spacing={0.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield size={20} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {admin.name || 'Administrador'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {admin.role || 'Admin'} • Panel de Control
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          startIcon={<Settings size={18} />}
          sx={{ color: 'white', textTransform: 'none' }}
          onClick={handleSettings}
        >
          Configuración
        </Button>
        <Button
          startIcon={<LogOut size={18} />}
          sx={{ color: 'white', textTransform: 'none' }}
          onClick={handleLogout}
        >
          Salir
        </Button>
      </Stack>
    </Box>
  );
};

export default AdminHeader;
