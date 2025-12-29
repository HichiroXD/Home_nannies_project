/**
 * DashboardHeader - Encabezado del dashboard con saludo y acciones rápidas
 */

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Settings, LogOut } from 'lucide-react';

export const DashboardHeader = ({ user = {} }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          {user.avatar || 'P'}
        </Avatar>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {getGreeting()}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {user.name || 'Usuario'} • Miembro desde{' '}
            {user.memberSince ? new Date(user.memberSince).toLocaleDateString('es-ES') : 'N/A'}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          startIcon={<Settings size={18} />}
          sx={{ color: 'white', textTransform: 'none' }}
          onClick={() => console.log('Settings')}
        >
          Configuración
        </Button>
        <Button
          startIcon={<LogOut size={18} />}
          sx={{ color: 'white', textTransform: 'none' }}
          onClick={() => console.log('Logout')}
        >
          Salir
        </Button>
      </Stack>
    </Box>
  );
};

export default DashboardHeader;
