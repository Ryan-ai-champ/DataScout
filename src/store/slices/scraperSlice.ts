import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { 
  ScraperState,
  ScraperConfig,
  SelectorConfig,
  ScrapedData,
  PaginationConfig,
  RateLimitConfig
} from '../../types/scraper';
import { RootState } from '../index';

const initialState: ScraperState = {
  config: {
    url: '',
    selectors: [],
    pagination: {
      enabled: false,
      type: 'button',
      selector: '',
      maxPages: 1
    },
    rateLimit: {
      requestDelay: 1000,
      concurrentRequests: 1,
      timeoutMs: 30000,
      retries: 3
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  },
  status: 'idle',
  data: [],
  error: null,
  progress: {
    current: 0,
    total: 0,
    startTime: null,
    endTime: null
  },
  history: []
};

export const scraperSlice = createSlice({
  name: 'scraper',
  initialState,
  reducers: {
    // Configuration actions
    setUrl: (state, action: PayloadAction<string>) => {
      state.config.url = action.payload;
    },
    addSelector: (state, action: PayloadAction<Omit<SelectorConfig, 'id'>>) => {
      const newSelector = {
        ...action.payload,
        id: uuidv4()
      };
      state.config.selectors.push(newSelector);
    },
    updateSelector: (state, action: PayloadAction<SelectorConfig>) => {
      const index = state.config.selectors.findIndex(
        selector => selector.id === action.payload.id
      );
      if (index !== -1) {
        state.config.selectors[index] = action.payload;
      }
    },
    removeSelector: (state, action: PayloadAction<string>) => {
      state.config.selectors = state.config.selectors.filter(
        selector => selector.id !== action.payload
      );
    },
    setPaginationConfig: (state, action: PayloadAction<PaginationConfig>) => {
      state.config.pagination = action.payload;
    },
    setRateLimitConfig: (state, action: PayloadAction<RateLimitConfig>) => {
      state.config.rateLimit = action.payload;
    },
    setHeaders: (state, action: PayloadAction<Record<string, string>>) => {
      state.config.headers = action.payload;
    },
    
    // Status actions
    startScraping: (state) => {
      state.status = 'running';
      state.error = null;
      state.data = [];
      state.progress = {
        current: 0,
        total: 0,
        startTime: Date.now(),
        endTime: null
      };
    },
    pauseScraping: (state) => {
      state.status = 'paused';
    },
    resumeScraping: (state) => {
      state.status = 'running';
    },
    stopScraping: (state) => {
      state.status = 'idle';
      state.progress.endTime = Date.now();
    },
    completeScraping: (state) => {
      state.status = 'completed';
      state.progress.endTime = Date.now();
      
      // Add to history
      state.history.push({
        id: uuidv4(),
        url: state.config.url,
        timestamp: Date.now(),
        itemCount: state.data.length
      });
    },
    
    // Data actions
    setScrapedData: (state, action: PayloadAction<ScrapedData>) => {
      state.data = action.payload;
    },
    appendScrapedData: (state, action: PayloadAction<ScrapedData>) => {
      state.data = [...state.data, ...action.payload];
    },
    clearScrapedData: (state) => {
      state.data = [];
    },
    
    // Progress actions
    updateProgress: (state, action: PayloadAction<{ current: number; total: number }>) => {
      state.progress.current = action.payload.current;
      state.progress.total = action.payload.total;
    },
    
    // Error actions
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset action
    resetScraper: () => initialState
  }
});

// Export actions
export const {
  setUrl,
  addSelector,
  updateSelector,
  removeSelector,
  setPaginationConfig,
  setRateLimitConfig,
  setHeaders,
  startScraping,
  pauseScraping,
  resumeScraping,
  stopScraping,
  completeScraping,
  setScrapedData,
  appendScrapedData,
  clearScrapedData,
  updateProgress,
  setError,
  clearError,
  resetScraper
} = scraperSlice.actions;

// Selectors
export const selectScraperConfig = (state: RootState) => state.scraper.config;
export const selectScraperStatus = (state: RootState) => state.scraper.status;
export const selectScrapedData = (state: RootState) => state.scraper.data;
export const selectScraperProgress = (state: RootState) => state.scraper.progress;
export const selectScraperError = (state: RootState) => state.scraper.error;
export const selectScraperHistory = (state: RootState) => state.scraper.history;

export default scraperSlice.reducer;

