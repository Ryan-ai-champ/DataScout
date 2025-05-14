import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { RootState } from '../index';
import scraperService from '../../services/scraper';
import { scraperSlice } from '../slices/scraperSlice';

// Extract action types from the slice
const {
  startScraping,
  pauseScraping,
  resumeScraping,
  stopScraping,
  setError,
} = scraperSlice.actions;

// Create the middleware
const scraperMiddleware: Middleware<{}, RootState> = (
  store: MiddlewareAPI<Dispatch<AnyAction>, RootState>
) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
  // Always pass the action to the next middleware or reducer
  next(action);
  
  // Get current state after the action has been processed
  const state = store.getState();
  
  // Handle specific actions
  if (startScraping.match(action)) {
    // Get scraper configuration from the state
    const config = state.scraper.config;
    
    // Start the scraping process
    scraperService.startScraping(config)
      .catch((error: Error) => {
        // Handle any uncaught errors
        store.dispatch(setError(error.message));
      });
  }
  
  else if (pauseScraping.match(action)) {
    // Pause the scraping process
    scraperService.pauseScraping();
  }
  
  else if (resumeScraping.match(action)) {
    // Resume the scraping process
    scraperService.resumeScraping();
  }
  
  else if (stopScraping.match(action)) {
    // Stop the scraping process
    scraperService.stopScraping();
  }
};

export default scraperMiddleware;

