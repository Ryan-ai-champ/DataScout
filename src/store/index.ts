import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import scraperReducer, { scraperSlice } from './slices/scraperSlice';
import { setupListeners } from '@reduxjs/toolkit/query';
import scraperMiddleware from './middleware/scraperMiddleware';

// Define the store with reducers
export const store = configureStore({
  reducer: {
    scraper: scraperReducer,
  },
  // Add middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in the state if needed
        ignoredActions: [
          // Ignore these actions as they might contain non-serializable data
          scraperSlice.actions.setScrapedData.type,
          scraperSlice.actions.appendScrapedData.type,
        ],
        ignoredPaths: ['scraper.data'], // Ignore the scraped data path which might contain non-serializable values
      },
    }).concat(scraperMiddleware),
});

// Enable listener behavior for refetchOnFocus/refetchOnReconnect in RTK Query
setupListeners(store.dispatch);

// Export types for the Redux store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

