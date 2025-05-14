import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectScraperConfig,
  selectScraperStatus,
  setUrl,
  addSelector,
  updateSelector,
  removeSelector,
  setPaginationConfig,
  setRateLimitConfig,
  startScraping,
  pauseScraping,
  resumeScraping,
  stopScraping,
} from '../../store/slices/scraperSlice';
import { SelectorConfig, PaginationConfig, RateLimitConfig } from '../../types/scraper';

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
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ScraperForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector(selectScraperConfig);
  const status = useAppSelector(selectScraperStatus);
  
  const [tabValue, setTabValue] = useState(0);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [newSelectorName, setNewSelectorName] = useState('');
  const [newSelectorType, setNewSelectorType] = useState<'css' | 'xpath' | 'regex'>('css');
  const [newSelectorValue, setNewSelectorValue] = useState('');
  const [newSelectorAttribute, setNewSelectorAttribute] = useState('text');
  const [newSelectorMultiple, setNewSelectorMultiple] = useState(false);
  const [selectorError, setSelectorError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    dispatch(setUrl(url));
    
    // Basic URL validation
    if (url && !url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError(null);
    }
  };

  const handleAddSelector = () => {
    if (!newSelectorName || !newSelectorValue) {
      setSelectorError('Name and selector value are required');
      return;
    }

    dispatch(addSelector({
      name: newSelectorName,
      type: newSelectorType,
      value: newSelectorValue,
      attribute: newSelectorAttribute,
      multiple: newSelectorMultiple,
    }));

    // Reset form
    setNewSelectorName('');
    setNewSelectorValue('');
    setNewSelectorAttribute('text');
    setNewSelectorMultiple(false);
    setSelectorError(null);
  };

  const handleUpdateSelector = (updatedSelector: SelectorConfig) => {
    dispatch(updateSelector(updatedSelector));
  };

  const handleRemoveSelector = (id: string) => {
    dispatch(removeSelector(id));
  };

  const handlePaginationChange = (
    key: keyof PaginationConfig,
    value: boolean | string | number
  ) => {
    dispatch(setPaginationConfig({
      ...config.pagination!,
      [key]: value,
    }));
  };

  const handleRateLimitChange = (
    key: keyof RateLimitConfig,
    value: number
  ) => {
    dispatch(setRateLimitConfig({
      ...config.rateLimit,
      [key]: value,
    }));
  };

  const handleStartScraping = () => {
    if (!config.url) {
      setUrlError('URL is required to start scraping');
      return;
    }
    
    if (config.selectors.length === 0) {
      setSelectorError('At least one selector is required to start scraping');
      return;
    }
    
    dispatch(startScraping());
  };

  const handlePauseScraping = () => {
    dispatch(pauseScraping());
  };

  const handleResumeScraping = () => {
    dispatch(resumeScraping());
  };

  const handleStopScraping = () => {
    dispatch(stopScraping());
  };

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';
  const isError = status === 'error';
  const isCompleted = status === 'completed';

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Web Scraper Configuration
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Target URL"
            variant="outlined"
            fullWidth
            value={config.url}
            onChange={handleUrlChange}
            error={!!urlError}
            helperText={urlError}
            placeholder="https://example.com"
            disabled={isRunning || isPaused}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="Enter the full URL of the website you want to scrape">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="scraper configuration tabs">
            <Tab label="Selectors" {...a11yProps(0)} />
            <Tab label="Pagination" {...a11yProps(1)} />
            <Tab label="Rate Limiting" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={2}>
            <Typography variant="h6">Add New Selector</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Selector Name"
                  variant="outlined"
                  fullWidth
                  value={newSelectorName}
                  onChange={(e) => setNewSelectorName(e.target.value)}
                  disabled={isRunning || isPaused}
                  placeholder="e.g., title, price, image"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="selector-type-label">Type</InputLabel>
                  <Select
                    labelId="selector-type-label"
                    value={newSelectorType}
                    label="Type"
                    onChange={(e) => setNewSelectorType(e.target.value as 'css' | 'xpath' | 'regex')}
                    disabled={isRunning || isPaused}
                  >
                    <MenuItem value="css">CSS</MenuItem>
                    <MenuItem value="xpath">XPath</MenuItem>
                    <MenuItem value="regex">Regex</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Selector Value"
                  variant="outlined"
                  fullWidth
                  value={newSelectorValue}
                  onChange={(e) => setNewSelectorValue(e.target.value)}
                  disabled={isRunning || isPaused}
                  placeholder={newSelectorType === 'css' ? '.product-title' : newSelectorType === 'xpath' ? '//h1[@class="title"]' : '\\d+\\.\\d+'}
                />
              </Grid>
              {newSelectorType === 'css' && (
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel id="attribute-label">Attribute</InputLabel>
                    <Select
                      labelId="attribute-label"
                      value={newSelectorAttribute}
                      label="Attribute"
                      onChange={(e) => setNewSelectorAttribute(e.target.value)}
                      disabled={isRunning || isPaused}
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="html">HTML</MenuItem>
                      <MenuItem value="href">href</MenuItem>
                      <MenuItem value="src">src</MenuItem>
                      <MenuItem value="alt">alt</MenuItem>
                      <MenuItem value="title">title</MenuItem>
                      <MenuItem value="value">value</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newSelectorMultiple}
                      onChange={(e) => setNewSelectorMultiple(e.target.checked)}
                      disabled={isRunning || isPaused}
                    />
                  }
                  label="Select multiple elements (returns an array)"
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddSelector}
                  disabled={isRunning || isPaused}
                >
                  Add Selector
                </Button>
              </Grid>
              {selectorError && (
                <Grid item xs={12}>
                  <FormHelperText error>{selectorError}</FormHelperText>
                </Grid>
              )}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6">Configured Selectors</Typography>
            {config.selectors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No selectors configured yet. Add a selector above to begin.
              </Typography>
            ) : (
              config.selectors.map((selector) => (
                <Accordion key={selector.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{selector.name} ({selector.type})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Selector Name"
                          variant="outlined"
                          fullWidth
                          value={selector.name}
                          onChange={(e) => handleUpdateSelector({
                            ...selector,
                            name: e.target.value,
                          })}
                          disabled={isRunning || isPaused}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                          <InputLabel id={`selector-type-label-${selector.id}`}>Type</InputLabel>
                          <Select
                            labelId={`selector-type-label-${selector.id}`}
                            value={selector.type}
                            label="Type"
                            onChange={(e) => handleUpdateSelector({
                              ...selector,
                              type: e.target.value as 'css' | 'xpath' | 'regex',
                            })}
                            disabled={isRunning || isPaused}
                          >
                            <MenuItem value="css">CSS</MenuItem>
                            <MenuItem value="xpath">XPath</MenuItem>
                            <MenuItem value="regex">Regex</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Selector Value"
                          variant="outlined"
                          fullWidth
                          value={selector.value}
                          onChange={(e) => handleUpdateSelector({
                            ...selector,
                            value: e.target.value,
                          })}
                          disabled={isRunning || isPaused}
                        />
                      </Grid>
                      {selector.type === 'css' && (
                        <Grid item xs={12} md={2}>
                          <FormControl fullWidth>
                            <InputLabel id={`attribute-label-${selector.id}`}>Attribute</InputLabel>
                            <Select
                              labelId={`attribute-label-${selector.id}`}
                              value={selector.attribute || 'text'}
                              label="Attribute"
                              onChange={(e) => handleUpdateSelector({
                                ...selector,
                                attribute: e.target.value,
                              })}
                              disabled={isRunning || isPaused}
                            >
                              <MenuItem value="text">Text</MenuItem>
                              <MenuItem value="html">HTML</MenuItem>
                              <MenuItem value="href">href</MenuItem>
                              <MenuItem value="src">src</MenuItem>
                              <MenuItem value="alt">alt</MenuItem>
                              <MenuItem value="title">title</MenuItem>
                              <MenuItem value="value">value</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={selector.multiple}
                              onChange={(e) => handleUpdateSelector({
                                ...selector,
                                multiple: e.target.checked,
                              })}
                              disabled={isRunning || isPaused}
                            />
                          }
                          label="Select multiple elements"
                        />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveSelector(selector.id)}
                          disabled={isRunning || isPaused}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Stack>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Stack spacing={2}>
            <Typography variant="h6">Pagination Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.pagination?.enabled || false}
                      onChange={(e) => handlePaginationChange('enabled', e.target.checked)}
                      disabled={isRunning || isPaused}
                    />
                  }
                  label="Enable Pagination"
                />
              </Grid>
              
              {config.pagination?.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pagination-type-label">Pagination Type</InputLabel>
                      <Select
                        labelId="pagination-type-label"
                        value={config.pagination?.type || 'button'}
                        label="Pagination Type"
                        onChange={(e) => handlePaginationChange('type', e.target.value)}
                        disabled={isRunning || isPaused}
                      >
                        <MenuItem value="button">Next Button</MenuItem>
                        <MenuItem value="url">URL Pattern</MenuItem>
                        <MenuItem value="infinite">Infinite Scroll</MenuItem>
                      </Select>
                      <FormHelperText>
                        {config.pagination?.type === 'button' ? 'Clicks on the "Next" button.' : 
                         config.pagination?.type === 'url' ? 'Navigates to URLs in sequence.' : 
                         'Scrolls down and loads more content.'}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Selector/Pattern"
                      variant="outlined"
                      fullWidth
                      value={config.pagination?.selector || ''}
                      onChange={(e) => handlePaginationChange('selector', e.target.value)}
                      disabled={isRunning || isPaused}
                      placeholder={
                        config.pagination?.type === 'button' ? '.pagination .next' : 
                        config.pagination?.type === 'url' ? 'https://example.com/page/{page}' : 
                        '.load-more-button'
                      }
                      helperText={
                        config.pagination?.type === 'button' ? 'CSS selector for the next button' : 
                        config.pagination?.type === 'url' ? 'URL pattern with {page} placeholder' : 
                        'Selector to detect when new content has loaded'
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Maximum Pages"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={config.pagination?.maxPages || ''}
                      onChange={(e) => handlePaginationChange('maxPages', parseInt(e.target.value) || 1)}
                      disabled={isRunning || isPaused}
                      inputProps={{ min: 1 }}
                      helperText="Maximum number of pages to scrape (0 = unlimited)"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Stack>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Stack spacing={2}>
            <Typography variant="h6">Rate Limiting Settings</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Request Delay (ms)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={config.rateLimit.requestDelay}
                  onChange={(e) => handleRateLimitChange('requestDelay', parseInt(e.target.value) || 0)}
                  disabled={isRunning || isPaused}
                  inputProps={{ min: 0 }}
                  helperText="Delay between requests in milliseconds"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Concurrent Requests"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={config.rateLimit.concurrentRequests}
                  onChange={(e) => handleRateLimitChange('concurrentRequests', parseInt(e.target.value) || 1)}
                  disabled={isRunning || isPaused}
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Number of concurrent requests (1-10)"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Request Timeout (ms)"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={config.rateLimit.timeoutMs}
                  onChange={(e) => handleRateLimitChange('timeoutMs', parseInt(e.target.value) || 30000)}
                  disabled={isRunning || isPaused}
                  inputProps={{ min: 1000 }}
                  helperText="Request timeout in milliseconds"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Retries"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={config.rateLimit.retries}
                  onChange={(e) => handleRateLimitChange('retries', parseInt(e.target.value) || 0)}
                  disabled={isRunning || isPaused}
                  inputProps={{ min: 0 }}
                  helperText="Number of retry attempts for failed requests"
                />
              </Grid>
            </Grid>
          </Stack>
        </TabPanel>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status: <strong>{status.charAt(0).toUpperCase() + status.slice(1)}</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isIdle || isCompleted || isError ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayIcon />}
                onClick={handleStartScraping}
                disabled={!config.url || config.selectors.length === 0}
              >
                Start Scraping
              </Button>
            ) : isPaused ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayIcon />}
                onClick={handleResumeScraping}
              >
                Resume
              </Button>
            ) : (
              <Button
                variant="contained"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={handlePauseScraping}
              >
                Pause
              </Button>
            )}
            
            {(isRunning || isPaused) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopScraping}
              >
                Stop
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScraperForm;

