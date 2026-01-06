import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function NannyFilters({ filters, onChange, onSubmit }) {
  const handleMinExperienceChange = (e) => {
    const isChecked = e.target.checked;
    onChange({
      target: {
        name: 'min_experience',
        value: isChecked ? '2' : '',
        type: 'text'
      }
    });
  };

  return (
    <Card
      component="form"
      onSubmit={onSubmit}
      elevation={1}
      sx={{
        background: 'linear-gradient(135deg, #fbb6ce 0%, #fce7f3 100%)',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Búsqueda */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar por nombre"
              name="search"
              value={filters.search || ""}
              onChange={onChange}
              placeholder="Escribe el nombre..."
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Experiencia mínima */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Experiencia mínima (años)"
              name="min_experience"
              type="number"
              value={filters.min_experience || ""}
              onChange={onChange}
              placeholder="0"
              inputProps={{ min: 0 }}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Precio máximo */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Precio máximo ($/hora)"
              name="max_rate"
              type="number"
              value={filters.max_rate || ""}
              onChange={onChange}
              placeholder="$0"
              inputProps={{ min: 0 }}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="verified"
                checked={filters.verified || false}
                onChange={onChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ color: 'grey.700' }}>
                Solo verificadas
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              px: 3,
              py: 1,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              borderRadius: 2,
            }}
          >
            Aplicar filtros
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
