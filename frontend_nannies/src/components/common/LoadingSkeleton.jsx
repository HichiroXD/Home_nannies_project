/**
 * LoadingSkeletonComponent - Esqueleto de carga para estados async
 * Mejora la experiencia visual mientras se cargan datos
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export const SkeletonLoader = ({ variant = 'text', count = 1, ...props }) => {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Skeleton key={idx} variant={variant} {...props} />
      ))}
    </Stack>
  );
};

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(['text', 'circular', 'rectangular']),
  count: PropTypes.number,
};

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <Box
          key={rowIdx}
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            p: 2,
            border: '1px solid #eee',
            borderRadius: 1,
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              variant="rectangular"
              sx={{ flex: 1, height: 40 }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx}>
          <CardContent>
            <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export const ListSkeleton = ({ items = 6 }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: items }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            p: 2,
            border: '1px solid #eee',
            borderRadius: 1,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="70%" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export const DashboardSkeleton = () => {
  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Header */}
      <Skeleton variant="text" width="30%" height={40} />

      {/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={30} sx={{ my: 1 }} />
              <Skeleton variant="text" width="50%" />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Chart Area */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>

      {/* Table Area */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width="20%" sx={{ mb: 2 }} />
          <TableSkeleton rows={5} columns={5} />
        </CardContent>
      </Card>
    </Stack>
  );
};

export const LoadingOverlay = ({ loading = false }) => {
  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
      }}
    >
      <Card sx={{ p: 3, minWidth: 200, textAlign: 'center' }}>
        <Skeleton
          variant="circular"
          width={60}
          height={60}
          sx={{ mx: 'auto', mb: 2 }}
        />
        <Skeleton variant="text" width="70%" sx={{ mx: 'auto' }} />
      </Card>
    </Box>
  );
};

export default {
  SkeletonLoader,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
};
