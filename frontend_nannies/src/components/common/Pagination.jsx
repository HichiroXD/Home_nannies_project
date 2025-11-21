/**
 * PaginationComponent - Control de paginación avanzado
 * Alternativa a la paginación dentro de DataTable
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationComponent = ({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
  variant = 'standard', // 'standard', 'outlined', 'text'
  size = 'medium',
  showBoundary = true,
  showFirstLast = true,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(e, value) => onPageChange(value)}
        variant={variant}
        size={size}
        showFirstButton={showFirstLast}
        showLastButton={showFirstLast}
        sx={{
          '& .MuiPaginationItem-page.Mui-selected': {
            backgroundColor: '#1976d2',
            color: 'white',
          },
          '& .MuiPaginationItem-page:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
          },
        }}
      />
    </Box>
  );
};

export const PaginationWithInfo = ({
  currentPage = 1,
  totalPages = 10,
  totalItems = 100,
  itemsPerPage = 10,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Stack spacing={2} sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Mostrando {startItem} a {endItem} de {totalItems} registros
        </Typography>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, value) => onPageChange(value)}
          size="small"
        />
      </Box>
    </Stack>
  );
};

export const CompactPagination = ({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{ p: 2 }}
    >
      <Button
        variant="outlined"
        size="small"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        startIcon={<ChevronLeft size={18} />}
      >
        Anterior
      </Button>

      <Typography variant="body2" sx={{ px: 1, minWidth: 80, textAlign: 'center' }}>
        Página {currentPage} de {totalPages}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        endIcon={<ChevronRight size={18} />}
      >
        Siguiente
      </Button>
    </Stack>
  );
};

export const AdvancedPagination = ({
  currentPage = 1,
  totalPages = 10,
  totalItems = 100,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showJumpTo = true,
}) => {
  const [jumpPage, setJumpPage] = React.useState(currentPage);

  const handleJump = () => {
    if (jumpPage >= 1 && jumpPage <= totalPages) {
      onPageChange(jumpPage);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {/* Info y selector de items por página */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Mostrando {startItem} a {endItem} de {totalItems} registros
        </Typography>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(e.target.value)}
          >
            <MenuItem value={5}>5 por página</MenuItem>
            <MenuItem value={10}>10 por página</MenuItem>
            <MenuItem value={25}>25 por página</MenuItem>
            <MenuItem value={50}>50 por página</MenuItem>
            <MenuItem value={100}>100 por página</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Controles de paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, value) => onPageChange(value)}
          size="small"
        />
      </Box>

      {/* Jump to page */}
      {showJumpTo && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2">Ir a página:</Typography>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(parseInt(e.target.value) || 1)}
            onKeyPress={(e) => e.key === 'Enter' && handleJump()}
            style={{
              width: 60,
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: 4,
            }}
          />
          <Button size="small" variant="outlined" onClick={handleJump}>
            Ir
          </Button>
        </Box>
      )}
    </Stack>
  );
};

PaginationComponent.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['standard', 'outlined', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showBoundary: PropTypes.bool,
  showFirstLast: PropTypes.bool,
};

export default memo(PaginationComponent);
