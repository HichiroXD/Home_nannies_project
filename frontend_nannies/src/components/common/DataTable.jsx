/**
 * DataTable - Componente para tablas de datos reutilizable
 * Soporta paginación, sorting, filtrado y acciones
 */

import React, { useState, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  IconButton,
  TextField,
  Stack,
  Chip,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Search, Edit, Trash2, Eye } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  rowsPerPageOptions = [5, 10, 25],
  searchable = true,
  selectable = false,
  onSelectionChange,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [selected, setSelected] = useState(new Set());

  // Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sorting
  const sortedData = useMemo(() => {
    let sorted = [...filteredData];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  // Paginación
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelected = new Set(paginatedData.map(row => row.id));
      setSelected(newSelected);
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSelected));
      }
    } else {
      setSelected(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {searchable && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
            }}
          />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {selectable && (
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selected.size === paginatedData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  sx={{
                    cursor: col.sortable ? 'pointer' : 'default',
                    fontWeight: 600,
                    userSelect: 'none',
                    '&:hover': col.sortable && { backgroundColor: '#eeeeee' },
                  }}
                >
                  {col.label}
                  {sortConfig?.key === col.key && (
                    <span sx={{ ml: 1 }}>
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map(row => (
                <TableRow key={row.id}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                  )}
                  {columns.map(col => (
                    <TableCell key={`${row.id}-${col.key}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {onView && (
                          <IconButton
                            size="small"
                            onClick={() => onView(row)}
                            title="Ver"
                          >
                            <Eye size={18} />
                          </IconButton>
                        )}
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(row)}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(row)}
                            title="Eliminar"
                          >
                            <Trash2 size={18} style={{ color: 'red' }} />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

DataTable.propTypes = {
  /** Definición de columnas */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      sortable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  /** Datos a mostrar */
  data: PropTypes.arrayOf(PropTypes.object),
  /** Callback para editar fila */
  onEdit: PropTypes.func,
  /** Callback para eliminar fila */
  onDelete: PropTypes.func,
  /** Callback para ver fila */
  onView: PropTypes.func,
  /** Estado de carga */
  loading: PropTypes.bool,
  /** Opciones de filas por página */
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  /** Habilitar búsqueda */
  searchable: PropTypes.bool,
  /** Habilitar selección */
  selectable: PropTypes.bool,
  /** Callback cuando cambia selección */
  onSelectionChange: PropTypes.func,
};

DataTable.defaultProps = {
  columns: [],
  data: [],
  loading: false,
  rowsPerPageOptions: [5, 10, 25],
  searchable: true,
  selectable: false,
};

// Comparador personalizado para DataTable
// Ignora cambios en callbacks que son referencias nuevas pero misma funcionalidad
const areEqual = (prevProps, nextProps) => {
  // Comparar props simples
  if (prevProps.loading !== nextProps.loading ||
      prevProps.data?.length !== nextProps.data?.length ||
      prevProps.columns?.length !== nextProps.columns?.length ||
      prevProps.hideColumns !== nextProps.hideColumns ||
      prevProps.hideSearch !== nextProps.hideSearch) {
    return false;
  }
  return true;
};

export default memo(DataTable, areEqual);
