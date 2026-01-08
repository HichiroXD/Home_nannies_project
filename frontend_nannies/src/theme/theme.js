import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') => {
  const palette = {
    mode,
    primary: {
      main: '#667eea'
    },
    secondary: {
      main: '#ec4899'
    },
    ...(mode === 'dark' ? {
      background: { default: '#0f172a', paper: '#0b1220' },
      text: { primary: '#e6eef8', secondary: '#9aa8bf' }
    } : {
      background: { default: '#ffffff', paper: '#ffffff' },
      text: { primary: '#1f2937', secondary: '#6b7280' }
    })
  };

  return createTheme({
    palette,
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background-color 200ms ease, color 200ms ease'
          }
        }
      }
    }
  });
};

export default getTheme;
