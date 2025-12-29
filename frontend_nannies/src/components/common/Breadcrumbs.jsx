/**
 * Breadcrumbs - Componente de navegación por migas de pan
 * Muestra la ruta de navegación actual
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { ChevronRight } from 'lucide-react';

export const BreadcrumbsComponent = ({
  items = [], // [{ label: string, href?: string, onClick?: function }]
  variant = 'outlined', // 'outlined', 'filled', 'standard'
  separator = '/',
  showHome = true,
  onNavigate,
}) => {
  const breadcrumbItems = showHome
    ? [{ label: 'Inicio', href: '/' }, ...items]
    : items;

  const handleClick = (item, index) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      onNavigate?.(item.href);
    }
  };

  const getSeparator = () => {
    if (separator === '/') return '/';
    if (separator === 'chevron') return <ChevronRight size={18} />;
    if (separator === 'arrow') return '→';
    return separator;
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor:
          variant === 'filled' ? '#f5f5f5' : 'transparent',
        border: variant === 'outlined' ? '1px solid #e0e0e0' : 'none',
        borderRadius: variant === 'filled' ? '8px' : '0px',
        mb: 2,
      }}
    >
      <MuiBreadcrumbs separator={getSeparator()} aria-label="breadcrumb">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isClickable = item.href || item.onClick;

          if (isLast) {
            return (
              <Typography
                key={index}
                sx={{
                  color: '#666',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              href={item.href || '#'}
              onClick={(e) => {
                e.preventDefault();
                handleClick(item, index);
              }}
              sx={{
                cursor: isClickable ? 'pointer' : 'default',
                color: isClickable ? '#1976d2' : '#999',
                textDecoration: 'none',
                fontSize: '0.95rem',
                transition: 'color 0.2s ease',
                '&:hover': isClickable && {
                  color: '#1565c0',
                  textDecoration: 'underline',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

BreadcrumbsComponent.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
    })
  ),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  separator: PropTypes.oneOf(['/', 'chevron', 'arrow']),
  showHome: PropTypes.bool,
  onNavigate: PropTypes.func,
};

export const BreadcrumbsWithIcon = ({
  items = [],
  onNavigate,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ p: 2, mb: 2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.icon && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            )}

            {isLast ? (
              <Typography sx={{ fontWeight: 500, color: '#333' }}>
                {item.label}
              </Typography>
            ) : (
              <>
                <Link
                  href={item.href || '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick();
                    else if (item.href) onNavigate?.(item.href);
                  }}
                  sx={{
                    cursor: 'pointer',
                    color: '#1976d2',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {item.label}
                </Link>
                <ChevronRight size={18} style={{ color: '#bbb' }} />
              </>
            )}
          </Box>
        );
      })}
    </Stack>
  );
};

export default memo(BreadcrumbsComponent);
