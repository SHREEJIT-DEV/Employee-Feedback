import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    allVariants: {
      color: '#f8fafc',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#f8fafc',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#f8fafc',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: '#f8fafc',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#94a3b8',
    },
    body2: {
      color: '#94a3b8',
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#06080d',
      paper: 'rgba(13, 18, 30, 0.65)',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#06080d',
          color: '#f8fafc',
          minHeight: '100vh',
          overflowX: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 14,
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            boxShadow: '0 12px 35px rgba(99, 102, 241, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(13, 18, 30, 0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          color: '#f8fafc',
          transition: 'all 0.25s ease',
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(99, 102, 241, 0.4) !important',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#6366f1 !important',
            borderWidth: '1.5px',
          },
        },
      },
    },
  },
});
