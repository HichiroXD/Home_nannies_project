/**
 * Tabs - Componente de navegación por pestañas
 * Permite cambiar entre múltiples vistas
 */

import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Tabs as MuiTabs,
  Tab,
  Typography,
  Stack,
} from '@mui/material';

// Panel content wrapper - Custom implementation (not from MUI)
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

export const TabsComponent = ({
  tabs = [], // [{ label: string, content: ReactNode, icon?: ReactNode, disabled?: boolean }]
  variant = 'standard', // 'standard', 'scrollable', 'fullWidth'
  orientation = 'horizontal', // 'horizontal', 'vertical'
  defaultTab = 0,
  onChange,
  showBorder = true,
}) => {
  const [value, setValue] = useState(defaultTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onChange?.(newValue, tabs[newValue]);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <MuiTabs
        value={value}
        onChange={handleChange}
        variant={variant === 'scrollable' ? 'scrollable' : 'standard'}
        scrollButtons="auto"
        orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
        sx={{
          borderBottom: showBorder ? '2px solid #e0e0e0' : 'none',
          '& .MuiTabs-indicator': {
            backgroundColor: '#1976d2',
          },
          '& .MuiTab-root': {
            minWidth: 100,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: '#666',
            '&.Mui-selected': {
              color: '#1976d2',
            },
          },
        }}
      >
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            label={
              tab.icon ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </Box>
              ) : (
                tab.label
              )
            }
            id={`tab-${idx}`}
            aria-controls={`tabpanel-${idx}`}
            disabled={tab.disabled || false}
          />
        ))}
      </MuiTabs>

      {tabs.map((tab, idx) => (
        <TabPanel key={idx} value={value} index={idx}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};

export const VerticalTabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
}) => {
  const [value, setValue] = useState(defaultTab);

  const handleChange = (newValue) => {
    setValue(newValue);
    onChange?.(newValue, tabs[newValue]);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, minHeight: 400 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '2px solid #e0e0e0',
          minWidth: 150,
        }}
      >
        {tabs.map((tab, idx) => (
          <Box
            key={idx}
            onClick={() => handleChange(idx)}
            sx={{
              p: 2,
              cursor: 'pointer',
              backgroundColor: value === idx ? '#f5f5f5' : 'transparent',
              borderLeft: value === idx ? '4px solid #1976d2' : 'none',
              color: value === idx ? '#1976d2' : '#666',
              fontWeight: value === idx ? 600 : 400,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        {tabs[value] && tabs[value].content}
      </Box>
    </Box>
  );
};

TabsComponent.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
    })
  ),
  variant: PropTypes.oneOf(['standard', 'scrollable', 'fullWidth']),
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  defaultTab: PropTypes.number,
  onChange: PropTypes.func,
  showBorder: PropTypes.bool,
};

export const CardTabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
}) => {
  const [value, setValue] = useState(defaultTab);

  const handleChange = (newValue) => {
    setValue(newValue);
    onChange?.(newValue, tabs[newValue]);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto' }}>
        {tabs.map((tab, idx) => (
          <Box
            key={idx}
            onClick={() => handleChange(idx)}
            sx={{
              px: 2,
              py: 1,
              cursor: 'pointer',
              backgroundColor: value === idx ? '#1976d2' : '#e0e0e0',
              color: value === idx ? 'white' : '#333',
              borderRadius: '6px',
              fontWeight: value === idx ? 600 : 400,
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: value === idx ? '#1565c0' : '#d0d0d0',
              },
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 2 }}>
        {tabs[value] && tabs[value].content}
      </Box>
    </Box>
  );
};

export default memo(TabsComponent);
