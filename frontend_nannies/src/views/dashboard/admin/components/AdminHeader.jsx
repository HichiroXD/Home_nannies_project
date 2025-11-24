/**
 * AdminHeader - Encabezado del dashboard administrativo
 */

import React from 'react';
import { Box, Typography, Avatar, Stack, Button } from '@mui/material';
import { Settings, LogOut, Shield } from 'lucide-react';

export const AdminHeader = ({ admin = {} }) => {
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

export default AdminHeader;
