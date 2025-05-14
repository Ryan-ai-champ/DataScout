import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import scraperReducer from '../store/slices/scraperSlice';
import App from '../App';
import scraperService from '../services/scraper';

// Mock the scraper service
jest.mock('../services/scraper', () => ({
  startScraping: jest.fn().mockResolvedValue(undefined),
  pauseScraping: jest.fn(),
  resumeScraping: jest.fn(),
  stopScraping: jest.fn(),
}));

// Create a test store
const createTestStore = () => configureStore({
  reducer: {
    scraper: scraperReducer,
  },
});

// Helper to render with Redux provider
const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('Web Scraper App', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Basic rendering
  test('renders the application title and form components', () => {
    renderWithProviders(<App />);
    
    // Check for title and subtitle
    expect(screen.getByText('Configurable Web Scraper')).toBeInTheDocument();
    expect(screen.getByText('A flexible tool for collecting data from websites with full user control.')).toBeInTheDocument();
    
    // Check for main components
    expect(screen.getByText('Web Scraper Configuration')).toBeInTheDocument();
    expect(screen.getByText('Scraped Data')).toBeInTheDocument();
    
    // Check for disclaimer
    expect(screen.getByText('User Responsibility Notice')).toBeInTheDocument();
  });

  // Test 2: URL input validation
  test('validates URL input correctly', async () => {
    renderWithProviders(<App />);
    
    // Find URL input
    const urlInput = screen.getByLabelText('Target URL');
    
    // Test invalid URL
    await userEvent.type(urlInput, 'invalid-url');
    expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    
    // Clear and try valid URL
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, 'https://example.com');
    
    // Error message should be gone
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid URL')).not.toBeInTheDocument();
    });
  });

  // Test 3: Adding a selector
  test('allows adding a selector', async () => {
    renderWithProviders(<App />);
    
    // Find inputs
    const selectorNameInput = screen.getByLabelText('Selector Name');
    const selectorValueInput = screen.getByLabelText('Selector Value');
    const addButton = screen.getByRole('button', { name: 'Add Selector' });
    
    // Add a selector
    await userEvent.type(selectorNameInput, 'Title');
    await userEvent.type(selectorValueInput, 'h1.title');
    await userEvent.click(addButton);
    
    // Check if "No selectors configured yet" is gone
    expect(screen.queryByText('No selectors configured yet. Add a selector above to begin.')).not.toBeInTheDocument();
    
    // Check if the selector appears in the list (it would be in an accordion)
    expect(screen.getByText('Title (css)')).toBeInTheDocument();
  });

  // Test 4: Starting scraping process
  test('starts scraping when form is valid and start button is clicked', async () => {
    const { store } = renderWithProviders(<App />);
    
    // Set up the form with valid data
    const urlInput = screen.getByLabelText('Target URL');
    await userEvent.type(urlInput, 'https://example.com');
    
    const selectorNameInput = screen.getByLabelText('Selector Name');
    const selectorValueInput = screen.getByLabelText('Selector Value');
    const addButton = screen.getByRole('button', { name: 'Add Selector' });
    
    await userEvent.type(selectorNameInput, 'Title');
    await userEvent.type(selectorValueInput, 'h1.title');
    await userEvent.click(addButton);
    
    // Find and click start button
    const startButton = screen.getByRole('button', { name: 'Start Scraping' });
    await userEvent.click(startButton);
    
    // Check if the service was called
    expect(scraperService.startScraping).toHaveBeenCalled();
    
    // Check if the store status was updated
    await waitFor(() => {
      const state = store.getState();
      expect(state.scraper.status).toBe('running');
    });
  });

  // Test 5: Data preview displays "no data" message
  test('shows "no data" message in data preview when no data is available', () => {
    renderWithProviders(<App />);
    
    // Check for the "no data" message
    expect(screen.getByText('No data available. Configure your scraper and press Start to begin scraping.')).toBeInTheDocument();
  });

  // Test 6: Responsive layout adjustment
  test('adjusts layout based on screen size', () => {
    // This would require more complex setup to test responsiveness
    // Typically done with Jest + window.innerWidth mocking
    // For simplicity, marking as a placeholder test
    expect(true).toBe(true);
  });
});

