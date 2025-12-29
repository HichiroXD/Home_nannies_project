/**
 * FormBuilder - Componente para construir formularios dinámicos
 * Soporta múltiples tipos de campos y validación
 */

import React, { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const FormBuilder = ({
  fields = [],
  onSubmit,
  submitLabel = 'Enviar',
  cancelLabel = 'Cancelar',
  onCancel,
  loading = false,
  spacing = 2,
}) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.defaultValue || '',
    }), {})
  );

  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Limpiar error cuando usuario corrige
    setErrors(prev => {
      if (prev[name]) {
        return {
          ...prev,
          [name]: '',
        };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    fields.forEach(field => {
      setFormData(prev => {
        const fieldValue = prev[field.name];
        if (field.required && !fieldValue) {
          newErrors[field.name] = `${field.label} es requerido`;
        }
        if (field.validation && fieldValue) {
          const validationError = field.validation(fieldValue);
          if (validationError) {
            newErrors[field.name] = validationError;
          }
        }
        return prev;
      });
    });
    return newErrors;
  }, [fields]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    setFormData(prev => {
      if (Object.keys(newErrors).length === 0) {
        onSubmit(prev);
      } else {
        setErrors(newErrors);
      }
      return prev;
    });
  }, [validateForm, onSubmit]);

  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name],
      onChange: handleChange,
      error: !!errors[field.name],
      helperText: errors[field.name],
      fullWidth: true,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            multiline={field.multiline}
            rows={field.rows || 1}
          />
        );

      case 'select':
        return (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {field.label}
            </Typography>
            <Select
              {...commonProps}
              value={formData[field.name]}
              error={!!errors[field.name]}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors[field.name] && (
              <FormHelperText error>{errors[field.name]}</FormHelperText>
            )}
          </Box>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                name={field.name}
                checked={formData[field.name]}
                onChange={handleChange}
              />
            }
            label={field.label}
          />
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            multiline
            rows={field.rows || 4}
            placeholder={field.placeholder}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={spacing}>
        {fields.map(field => (
          <Box key={field.name}>
            {renderField(field)}
          </Box>
        ))}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Procesando...' : submitLabel}
          </Button>
          {onCancel && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

FormBuilder.propTypes = {
  /** Array de definiciones de campos del formulario */
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'select', 'checkbox', 'textarea']),
      required: PropTypes.bool,
      defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          label: PropTypes.string,
        })
      ),
      validation: PropTypes.func,
      errorMessage: PropTypes.string,
    })
  ),
  /** Callback cuando se envía el formulario */
  onSubmit: PropTypes.func.isRequired,
  /** Label del botón submit */
  submitLabel: PropTypes.string,
  /** Label del botón cancel */
  cancelLabel: PropTypes.string,
  /** Callback para cancelar el formulario */
  onCancel: PropTypes.func,
  /** Estado de carga */
  loading: PropTypes.bool,
  /** Espaciado entre campos */
  spacing: PropTypes.number,
};

FormBuilder.defaultProps = {
  fields: [],
  submitLabel: 'Enviar',
  cancelLabel: 'Cancelar',
  loading: false,
  spacing: 2,
};

export default memo(FormBuilder);
