import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { deepPurple, blue, grey, lightBlue } from '@mui/material/colors';

// DataScout branding colors
const PRIMARY_MAIN = deepPurple[700]; // Deep purple for primary actions
const SECONDARY_MAIN = blue[600]; // Blue for accents and secondary actions
const SUCCESS_COLOR = '#43a047'; // Green for success states
const ERROR_COLOR = '#d32f2f'; // Red for error states
const WARNING_COLOR = '#f57c00'; // Orange for warnings
const INFO_COLOR = lightBlue[700]; // Light blue for information

// Create the base theme
let theme = createTheme({
  palette: {
    primary: {
      light: deepPurple[500],
      main: PRIMARY_MAIN,
      dark: deepPurple[900],
      contrastText: '#fff',
    },
    secondary: {
      light: blue[400],
      main: SECONDARY_MAIN,
      dark: blue[800],
      contrastText: '#fff',
    },
    success: {
      main: SUCCESS_COLOR,
    },
    error: {
      main: ERROR_COLOR,
    },
    warning: {
      main: WARNING_COLOR,
    },
    info: {
      main: INFO_COLOR,
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: grey[900],
      secondary: grey[700],
    },
  },
  typography: {
    fontFamily: [
      '"Poppins"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
          overflow: 'visible',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${deepPurple[800]} 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${SECONDARY_MAIN} 0%, ${blue[700]} 100%)`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px 0 rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.9rem',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '16px 0',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
        outlined: {
          borderColor: grey[200],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
  },
});

// Apply responsive fonts
theme = responsiveFontSizes(theme);

export default theme;

