import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Typography,
  Alert,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  InputAdornment,
  ButtonGroup,
  IconButton,
  Tooltip,
  Stack,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Json as JsonIcon,
  Description as CsvIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  ClearAll as ClearFilterIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store';
import {
  selectScrapedData,
  selectScraperStatus,
  selectScraperError,
  selectScraperProgress,
  selectScraperConfig,
} from '../../store/slices/scraperSlice';
import { ScrapedItem } from '../../types/scraper';

// Helper functions for exporting data
const downloadJson = (data: ScrapedItem[]) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scraped-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadCsv = (data: ScrapedItem[]) => {
  if (data.length === 0) return;
  
  // Get all possible headers from all objects
  const headers = Array.from(
    new Set(
      data.flatMap(item => Object.keys(item))
    )
  );
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle different types, escape commas, quotes, etc.
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `scraped-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  numeric: boolean;
}

interface EnhancedTableProps {
  columns: Column[];
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { columns, order, orderBy, onRequestSort } = props;
  
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.numeric ? 'right' : 'left'}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : 'asc'}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const DataPreview: React.FC = () => {
  const data = useAppSelector(selectScrapedData);
  const status = useAppSelector(selectScraperStatus);
  const error = useAppSelector(selectScraperError);
  const progress = useAppSelector(selectScraperProgress);
  const config = useAppSelector(selectScraperConfig);
  
  // Table state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reset pagination when data changes
  useEffect(() => {
    setPage(0);
  }, [data]);
  
  // Calculate columns from data
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    
    // Get all unique keys from all items
    const allKeys = Array.from(
      new Set(
        data.flatMap(item => Object.keys(item))
      )
    );
    
    // Create columns for each key
    return allKeys.map(key => ({
      id: key,
      label: key,
      numeric: typeof data[0][key] === 'number',
    }));
  }, [data]);
  
  // Handle sort
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First filter
    let filtered = [...data];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value && 
          (typeof value === 'string' || typeof value === 'number') && 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Then sort
    if (orderBy) {
      filtered.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        // Handle different value types or missing values
        if (aValue === undefined) return order === 'asc' ? -1 : 1;
        if (bValue === undefined) return order === 'asc' ? 1 : -1;
        
        // For strings, use localeCompare
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return order === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        // For numbers, use simple comparison
        return order === 'asc' 
          ? (aValue > bValue ? 1 : -1) 
          : (bValue > aValue ? 1 : -1);
      });
    }
    
    return filtered;
  }, [data, searchTerm, orderBy, order]);
  
  // Calculate pagination
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);
  
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (progress.total === 0) return 0;
    return Math.round((progress.current / progress.total) * 100);
  }, [progress]);
  
  // Calculate elapsed time
  const elapsedTime = useMemo(() => {
    if (!progress.startTime) return 0;
    const endTime = progress.endTime || Date.now();
    return endTime - progress.startTime;
  }, [progress]);
  
  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setOrder('asc');
    setOrderBy('');
    setPage(0);
  };
  
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const isIdle = status === 'idle';
  const isError = status === 'error';
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Scraped Data
        </Typography>
        
        {/* Status and Progress */}
        <Box sx={{ mb: 3 }}>
          {isRunning && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ height: 10, borderRadius: 5 }} 
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {progress.current} of {progress.total > 0 ? progress.total : '?'} items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progressPercentage}%
                </Typography>
              </Box>
            </Box>
          )}
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                <Chip 
                  label={status.charAt(0).toUpperCase() + status.slice(1)} 
                  color={
                    isRunning ? 'primary' : 
                    isPaused ? 'warning' : 
                    isCompleted ? 'success' : 
                    isError ? 'error' : 
                    'default'
                  }
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Items Scraped</Typography>
                <Typography variant="h6">{data.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Time Elapsed</Typography>
                <Typography variant="h6">
                  {progress.startTime ? formatElapsedTime(elapsedTime) : '-'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {isError && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography fontWeight="bold">Error:</Typography>
              {error}
            </Alert>
          )}
          
          {data.length === 0 && !isRunning && !isError && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No data available. Configure your scraper and press Start to begin scraping.
            </Alert>
          )}
        </Box>
        
        {/* Data Controls */}
        {data.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        edge="end"
                      >
                        <ClearFilterIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {(searchTerm || orderBy) && (
                <Button
                  size="small"
                  startIcon={<ClearFilterIcon />}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
              
              <Typography variant="body2" color="text.secondary">
                {filteredAndSortedData.length} of {data.length} items
              </Typography>
            </Box>
            
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Export as JSON">
                <Button
                  startIcon={<JsonIcon />}
                  onClick={() => downloadJson(data)}
                  disabled={data.length === 0}
                >
                  JSON
                </Button>
              </Tooltip>
              <Tooltip title="Export as CSV">
                <Button
                  startIcon={<CsvIcon />}
                  onClick={() => downloadCsv(data)}
                  disabled={data.length === 0}
                >
                  CSV
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Box>
        )}
        
        {/* Data Table */}
        {data.length > 0 && (
          <Paper variant="outlined">
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <EnhancedTableHead
                  columns={columns}
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <TableRow
                        hover
                        tabIndex={-1}
                        key={index}
                      >
                        {columns.map((column) => {
                          const value = row[column.id];
                          return (
                            <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                              {value === null || value === undefined 
                                ? '-' 
                                : typeof value === 'object' 
                                  ? JSON.stringify(value) 
                                  : String(value)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        {searchTerm 
                          ? 'No matching records found' 
                          : 'No data available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={filteredAndSortedData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;

