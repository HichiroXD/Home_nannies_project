/**
 * KidsManagement - Panel para gestionar hijos
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const KidsManagement = ({
  kids = [],
}) => {
  const navigate = useNavigate();

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Mis Hijos ({kids.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/profile/parent')}
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
                      <Button
                        size="small"
                        onClick={() => navigate('/profile/parent')}
                      >
                        <Edit size={16} />
                      </Button>
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
    </Stack>
  );
};

export default KidsManagement;
