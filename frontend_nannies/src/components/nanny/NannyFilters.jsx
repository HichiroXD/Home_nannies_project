import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Box,
} from '@mui/material';

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
