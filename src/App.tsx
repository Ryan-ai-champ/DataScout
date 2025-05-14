import React, { useState } from 'react';
import { Provider } from 'react-redux';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Container,
  Paper,
  Stack,
  Tabs,
  Tab,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  DataObject as DataObjectIcon,
  BarChart as BarChartIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { store } from './store';
import theme from './theme';
import ScraperForm from './components/ScraperForm';
import DataPreview from './components/DataPreview';

// Drawer width for the navigation sidebar
const drawerWidth = 260;

// Styled components for the dashboard layout
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    boxSizing: 'border-box',
    boxShadow: '0 10px 30px 0 rgba(0,0,0,0.1)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

// Brand logo component
const Logo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
    <DataObjectIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
    <Typography
      variant="h5"
      component="h1"
      sx={{
        fontWeight: 700,
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundClip: 'text',
        color: 'transparent',
        letterSpacing: '-0.5px',
      }}
    >
      DataScout
    </Typography>
  </Box>
);

// Tab interface component for main content area
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>{children}</Box>
      )}
    </div>
  );
}

function App() {
  // State for drawer open/closed
  const [open, setOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Check if screen is mobile size
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Auto-close drawer on mobile
  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile]);

  // Toggle drawer
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh' }}>
          {/* App Bar */}
          <StyledAppBar position="absolute" open={open} elevation={0} color="default">
            <Toolbar
              sx={{
                pr: '24px',
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: '36px',
                  ...(open && { display: 'none' }),
                }}
              >
                <MenuIcon />
              </IconButton>
              
              {!open && <Logo />}
              
              <Box sx={{ flexGrow: 1 }} />
              
              {/* Right side of app bar */}
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton color="inherit">
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                <IconButton color="inherit">
                  <HelpIcon />
                </IconButton>
                <Avatar
                  sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main }}
                  alt="User"
                >
                  <PersonIcon />
                </Avatar>
              </Stack>
            </Toolbar>
          </StyledAppBar>
          
          {/* Side Drawer */}
          <StyledDrawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: [1],
              }}
            >
              <Logo />
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            
            {/* Navigation Menu */}
            <List component="nav" sx={{ px: 2 }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={true}
                  sx={{ 
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <DataObjectIcon />
                  </ListItemIcon>
                  <ListItemText primary="Data Collections" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="History" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <BarChartIcon />
                  </ListItemIcon>
                  <ListItemText primary="Analytics" />
                </ListItemButton>
              </ListItem>
              
              <Divider sx={{ my: 2 }} />
              
              <ListItem disablePadding>
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
            </List>
          </StyledDrawer>
          
          {/* Main Content */}
          <Box
            component="main"
            sx={{
              backgroundColor: theme.palette.background.default,
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Toolbar /> {/* Spacer for AppBar */}
            
            {/* Content */}
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Page Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                  Web Data Extraction
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Configure and run your data extraction tasks with powerful controls and real-time previews.
                </Typography>
              </Box>
              
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="data extraction tabs"
                  sx={{
                    '& .MuiTab-root': {
                      minWidth: 120,
                    },
                  }}
                >
                  <Tab label="Extraction Setup" icon={<CodeIcon />} iconPosition="start" />
                  <Tab label="Data Explorer" icon={<SearchIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              
              {/* Tab Panels */}
              <Box sx={{ flexGrow: 1, mt: 2 }}>
                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={3} sx={{ height: '100%' }}>
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
                        <Grid item xs={12} md={5} lg={4} sx={{ height: '100%' }}>
                          <ScraperForm />
                        </Grid>
                        <Grid item xs={12} md={7} lg={8} sx={{ height: '100%' }}>
                          <DataPreview />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h5" gutterBottom>
                      Data Explorer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      This feature is coming soon! You will be able to explore and analyze your collected data here.
                    </Typography>
                  </Paper>
                </TabPanel>
              </Box>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

