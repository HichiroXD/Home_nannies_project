/**
 * AccordionComponent - Componente de acordeón para contenido expandible
 * Ideal para FAQs y secciones colapsables
 */

import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { ChevronDown, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const AccordionComponent = ({
  items = [], // [{ title: string, subtitle?: string, content: ReactNode, icon?: ReactNode, defaultExpanded?: boolean, badge?: string }]
  defaultExpanded = 0,
  onChange,
  allowMultiple = false,
}) => {
  const [expanded, setExpanded] = useState(
    allowMultiple ? [defaultExpanded] : defaultExpanded
  );

  const handleChange = (index) => {
    if (allowMultiple) {
      setExpanded((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setExpanded(expanded === index ? false : index);
    }
    onChange?.(index);
  };

  const isExpanded = (index) => {
    return allowMultiple ? expanded.includes(index) : expanded === index;
  };

  return (
    <Stack spacing={1}>
      {items.map((item, idx) => (
        <Accordion
          key={idx}
          expanded={isExpanded(idx)}
          onChange={() => handleChange(idx)}
          sx={{
            '&:before': { display: 'none' },
            boxShadow: isExpanded(idx) ? 2 : 0,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown size={20} />}
            sx={{
              backgroundColor: isExpanded(idx) ? '#f5f5f5' : 'transparent',
              '&:hover': {
                backgroundColor: '#fafafa',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              {item.icon && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                  {item.icon}
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, color: '#333' }}>
                  {item.title}
                </Typography>
                {item.subtitle && (
                  <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
                    {item.subtitle}
                  </Typography>
                )}
              </Box>
              {item.badge && (
                <Chip label={item.badge} size="small" color="primary" variant="outlined" />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, backgroundColor: '#fafafa' }}>
            {typeof item.content === 'string' ? (
              <Typography variant="body2">{item.content}</Typography>
            ) : (
              item.content
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

AccordionComponent.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      defaultExpanded: PropTypes.bool,
      badge: PropTypes.string,
    })
  ),
  defaultExpanded: PropTypes.number,
  onChange: PropTypes.func,
  allowMultiple: PropTypes.bool,
};

export const FAQAccordion = ({
  faqs = [], // [{ question: string, answer: string }]
  onQuestionClick,
}) => {
  return (
    <AccordionComponent
      items={faqs.map((faq) => ({
        title: faq.question,
        content: faq.answer,
        icon: <Info size={18} />,
      }))}
      onChange={(index) => onQuestionClick?.(faqs[index])}
    />
  );
};

export const SettingsAccordion = ({
  categories = [], // [{ name: string, icon: ReactNode, settings: [{ label: string, control: ReactNode }] }]
  onSettingChange,
}) => {
  return (
    <AccordionComponent
      items={categories.map((cat) => ({
        title: cat.name,
        icon: cat.icon,
        content: (
          <Stack spacing={2}>
            {cat.settings.map((setting, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">{setting.label}</Typography>
                {setting.control}
              </Box>
            ))}
          </Stack>
        ),
      }))}
      allowMultiple
      onChange={(idx) => onSettingChange?.(idx)}
    />
  );
};

export const TimelineAccordion = ({
  events = [], // [{ date: string, title: string, description: string, status: 'completed' | 'pending' | 'failed' }]
}) => {
  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={18} style={{ color: '#4caf50' }} />;
    if (status === 'failed') return <AlertCircle size={18} style={{ color: '#f44336' }} />;
    return <Info size={18} style={{ color: '#ff9800' }} />;
  };

  return (
    <AccordionComponent
      items={events.map((event) => ({
        title: event.title,
        subtitle: event.date,
        icon: getStatusIcon(event.status),
        content: event.description,
        badge: event.status,
      }))}
      allowMultiple
    />
  );
};

export default memo(AccordionComponent);
