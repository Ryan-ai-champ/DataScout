import React from 'react';
import { Provider } from 'react-redux';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  Link,
  Divider,
  useMediaQuery
} from '@mui/material';
import { grey, blue } from '@mui/material/colors';
import { Code as CodeIcon } from '@mui/icons-material';
import { store } from './store';
import ScraperForm from './components/ScraperForm';
import DataPreview from './components/DataPreview';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: blue[700],
    },
    secondary: {
      main: grey[700],
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Disclaimer component
const Disclaimer: React.FC = () => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      mt: 2,
      mb: 2,
      backgroundColor: 'rgba(255,255,255,0.8)',
      fontSize: '0.9rem',
    }}
  >
    <Typography variant="subtitle2" gutterBottom>
      User Responsibility Notice
    </Typography>
    <Typography variant="body2" color="text.secondary">
      This web scraping tool is provided for educational and personal use. It is your responsibility to:
      <Box component="ul" sx={{ pl: 2, mt: 1 }}>
        <li>Review and comply with websites' Terms of Service before scraping</li>
        <li>Set reasonable rate limits to avoid server overload</li>
        <li>Respect robots.txt and website access policies</li>
        <li>Use the scraped data in accordance with copyright and data protection laws</li>
      </Box>
      By using this tool, you assume full responsibility for how it is used.
    </Typography>
  </Paper>
);

// Footer component
const Footer: React.FC = () => (
  <Box sx={{ py: 3, textAlign: 'center' }}>
    <Divider sx={{ mb: 2 }} />
    <Typography variant="body2" color="text.secondary">
      Web Scraper App © {new Date().getFullYear()} | 
      <Link href="#" color="inherit" sx={{ ml: 1 }}>
        Documentation
      </Link>
      {' | '}
      <Link href="#" color="inherit">
        Terms of Use
      </Link>
    </Typography>
  </Box>
);

// Main App component
function App() {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: '100vh', pb: 4 }}>
          <AppBar position="static" elevation={0} color="default" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar>
              <CodeIcon sx={{ mr: 2 }} color="primary" />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Web Scraper App
              </Typography>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 500 }}>
              Configurable Web Scraper
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              A flexible tool for collecting data from websites with full user control.
            </Typography>
            
            <Disclaimer />
            
            <Grid container spacing={3}>
              {isMobile ? (
                // Mobile layout - vertical stacking
                <>
                  <Grid item xs={12}>
                    <ScraperForm />
                  </Grid>
                  <Grid item xs={12}>
                    <DataPreview />
                  </Grid>
                </>
              ) : (
                // Desktop layout - side by side
                <>
                  <Grid item xs={12} md={5} lg={4}>
                    <ScraperForm />
                  </Grid>
                  <Grid item xs={12} md={7} lg={8}>
                    <DataPreview />
                  </Grid>
                </>
              )}
            </Grid>
            
            <Footer />
          </Container>
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
