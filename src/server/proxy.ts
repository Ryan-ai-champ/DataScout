import express from 'express';
import cors from 'cors';
import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { createLogger, format, transports } from 'winston';

// Configure logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'proxy-error.log', level: 'error' }),
    new transports.File({ filename: 'proxy.log' })
  ],
});

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main proxy endpoint
app.get('/proxy', async (req, res) => {
  const url = req.query.url as string;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Log the request
  logger.info(`Proxying request to: ${url}`);
  
  try {
    // Configure the request
    const config = {
      method: 'GET',
      url,
      headers: {
        // Forward some headers from the original request
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        // Additional headers can be added or forwarded as needed
      },
      // Forward query parameters except 'url'
      params: Object.fromEntries(
        Object.entries(req.query).filter(([key]) => key !== 'url')
      ),
      // Set a reasonable timeout
      timeout: 30000,
      // Don't follow redirects automatically
      maxRedirects: 0,
      // Send response as arraybuffer to handle different content types
      responseType: 'arraybuffer',
    };
    
    // Make the request to the target URL
    const response = await axios(config);
    
    // Forward the response status
    res.status(response.status);
    
    // Forward content type and other relevant headers
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    
    // Return the response data
    res.send(response.data);
    
  } catch (error: any) {
    // Log the error
    logger.error(`Proxy error: ${error.message}`);
    
    // Return an appropriate error message
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json({
        error: `Proxy received error from target: ${error.response.status}`,
        data: error.response.data.toString()
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(504).json({
        error: 'No response received from target server',
        details: error.message
      });
    } else {
      // Something happened in setting up the request
      res.status(500).json({
        error: 'Error setting up the request',
        details: error.message
      });
    }
  }
});

// POST endpoint for more complex requests
app.post('/proxy', async (req, res) => {
  const { url, method = 'POST', headers = {}, data = {} } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required in request body' });
  }

  // Log the request
  logger.info(`Proxying ${method} request to: ${url}`);
  
  try {
    // Configure the request
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        // Default headers
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        // Custom headers provided in the request
        ...headers
      },
      // Request data
      data,
      // Set a reasonable timeout
      timeout: 30000,
      // Don't follow redirects automatically
      maxRedirects: 0,
      // Send response as arraybuffer to handle different content types
      responseType: 'arraybuffer',
    };
    
    // Make the request to the target URL
    const response = await axios(config);
    
    // Forward the response status
    res.status(response.status);
    
    // Forward content type and other relevant headers
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    
    // Return the response data
    res.send(response.data);
    
  } catch (error: any) {
    // Same error handling as GET endpoint
    logger.error(`Proxy error: ${error.message}`);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: `Proxy received error from target: ${error.response.status}`,
        data: error.response.data.toString()
      });
    } else if (error.request) {
      res.status(504).json({
        error: 'No response received from target server',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Error setting up the request',
        details: error.message
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Proxy server running on port ${PORT}`);
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

// Export app for testing
export default app;

