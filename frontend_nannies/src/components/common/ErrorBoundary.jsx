import React, { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AlertCircle } from 'lucide-react';
import logger from '@/utils/logger';

/**
 * Error Boundary para capturar errores en componentes React
 * Útil para lazy loading y prevenir que toda la app crashee
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error Boundary caught an error', error, {
      errorInfo,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: 3,
            textAlign: 'center',
          }}
        >
          <AlertCircle size={64} color="#f44336" />
          <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
            Oops! Algo salió mal
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>
            Recargar página
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
