/**
 * NannyHeader - Encabezado del dashboard con información de la niñera
 */

import React from 'react';
import { Box, Typography, Avatar, Stack, Button, Rating } from '@mui/material';
import { Settings, LogOut } from 'lucide-react';

export const NannyHeader = ({ nanny = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
          {nanny.avatar || 'N'}
        </Avatar>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {nanny.name || 'Niñera'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating
              value={nanny.rating || 5}
              readOnly
              size="small"
              sx={{ color: '#FCD34D' }}
            />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {nanny.rating || 0}/5 ({nanny.reviews || 0} reseñas)
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Miembro desde {nanny.memberSince ? new Date(nanny.memberSince).toLocaleDateString('es-ES') : 'N/A'}
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

export default NannyHeader;
