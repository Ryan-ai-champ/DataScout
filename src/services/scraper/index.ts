import axios from 'axios';
import type { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { store } from '../../store';
import {
  appendScrapedData,
  completeScraping,
  setError,
  updateProgress,
  stopScraping,
} from '../../store/slices/scraperSlice';
import {
  ScraperConfig,
  SelectorConfig,
  PaginationConfig,
  RateLimitConfig,
  ScrapedItem,
} from '../../types/scraper';

// Define service-specific types
interface ScraperServiceConfig {
  baseURL?: string;
  proxyURL?: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
  cookies?: string;
}

interface ScrapingResult {
  success: boolean;
  data?: ScrapedItem[];
  error?: string;
  nextPage?: string | null;
}

interface SelectorResult {
  name: string;
  value: string | string[] | null;
}

// Main scraper class
class ScraperService {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private shouldStop: boolean = false;
  private currentPage: number = 1;
  private totalItems: number = 0;
  private processedItems: number = 0;
  private serviceConfig: ScraperServiceConfig = {
    baseURL: 'http://localhost:5173', // Base URL for the frontend
    proxyURL: 'http://localhost:8000/proxy', // Default proxy URL
    timeout: 30000,
    maxRetries: 3,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  };

  // Initialize the scraper service
  constructor(config?: ScraperServiceConfig) {
    if (config) {
      this.serviceConfig = { ...this.serviceConfig, ...config };
    }
  }

  // Main scraping method
  async startScraping(config: ScraperConfig): Promise<void> {
    const { url, selectors, pagination, rateLimit, headers } = config;
    
    if (!url || selectors.length === 0) {
      store.dispatch(setError('URL and at least one selector are required'));
      return;
    }
    
    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;
    this.currentPage = 1;
    this.totalItems = 0;
    this.processedItems = 0;
    
    try {
      // Initial scraping
      await this.scrapeUrl(url, selectors, headers);
      
      // Handle pagination if enabled
      if (pagination?.enabled && pagination.selector) {
        let nextPageUrl: string | null = url;
        let pagesScraped = 1;
        
        while (
          nextPageUrl && 
          this.isRunning && 
          !this.shouldStop && 
          (!pagination.maxPages || pagesScraped < pagination.maxPages)
        ) {
          // Check if paused
          if (this.isPaused) {
            await new Promise<void>(resolve => {
              const checkPause = () => {
                if (!this.isPaused || this.shouldStop) {
                  resolve();
                } else {
                  setTimeout(checkPause, 500);
                }
              };
              checkPause();
            });
            
            if (this.shouldStop) break;
          }
          
          // Rate limiting
          await this.applyRateLimit(rateLimit);
          
          // Get next page
          nextPageUrl = await this.getNextPageUrl(nextPageUrl, pagination, pagesScraped + 1);
          
          if (nextPageUrl) {
            pagesScraped++;
            await this.scrapeUrl(nextPageUrl, selectors, headers);
          }
        }
      }
      
      // Complete scraping
      if (!this.shouldStop) {
        store.dispatch(completeScraping());
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isRunning = false;
    }
  }
  
  // Pause scraping
  pauseScraping(): void {
    this.isPaused = true;
  }
  
  // Resume scraping
  resumeScraping(): void {
    this.isPaused = false;
  }
  
  // Stop scraping
  stopScraping(): void {
    this.shouldStop = true;
    this.isPaused = false;
    store.dispatch(stopScraping());
  }
  
  // Apply rate limiting
  private async applyRateLimit(rateLimit: RateLimitConfig): Promise<void> {
    if (rateLimit.requestDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, rateLimit.requestDelay));
    }
  }
  
  // Scrape a single URL
  private async scrapeUrl(
    url: string,
    selectors: SelectorConfig[],
    headers: Record<string, string>
  ): Promise<void> {
    try {
      // Fetch the page
      const html = await this.fetchUrl(url, headers);
      
      if (!html) {
        throw new Error(`Failed to fetch content from ${url}`);
      }
      
      // Process selectors
      const results: ScrapedItem[] = await this.processSelectors(html, selectors);
      
      // Update progress
      this.processedItems += results.length;
      this.totalItems += results.length;
      store.dispatch(updateProgress({
        current: this.processedItems,
        total: this.totalItems,
      }));
      
      // Store data
      store.dispatch(appendScrapedData(results));
      
      return;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  // Fetch URL with retry logic
  private async fetchUrl(
    url: string,
    headers: Record<string, string>,
    retryCount: number = 0
  ): Promise<string | null> {
    try {
      const config = {
        timeout: this.serviceConfig.timeout,
        headers: {
          'User-Agent': this.serviceConfig.userAgent,
          ...headers,
        },
      };
      
      // Use proxy URL if configured (to bypass CORS in browser)
      const requestUrl = this.serviceConfig.proxyURL 
        ? `${this.serviceConfig.proxyURL}?url=${encodeURIComponent(url)}`
        : url;
      
      const response = await axios.get(requestUrl, config);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Received status code ${response.status}`);
      }
    } catch (error: any) {
      const maxRetries = this.serviceConfig.maxRetries || 3;
      
      // Check for specific proxy errors
      if (error.response && error.response.status === 502) {
        this.handleError(new Error(`Proxy error: ${error.response.data?.error || 'Bad Gateway'}`));
      } else if (error.response && error.response.status === 504) {
        this.handleError(new Error(`Proxy error: ${error.response.data?.error || 'Gateway Timeout'}`));
      } else if (error.message && error.message.includes('Network Error')) {
        this.handleError(new Error('Proxy server connection failed. Make sure the proxy server is running.'));
      }
      
      if (retryCount < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying ${url} in ${delay}ms... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchUrl(url, headers, retryCount + 1);
      }
      
      this.handleError(error);
      return null;
    }
  }
  
  // Process all selectors on HTML content
  private async processSelectors(
    html: string,
    selectors: SelectorConfig[]
  ): Promise<ScrapedItem[]> {
    try {
      // Load HTML with cheerio
      const $ = cheerio.load(html);
      
      // Create object to store selector results
      const selectorResults: Record<string, SelectorResult[]> = {};
      
      // Apply each selector
      for (const selector of selectors) {
        const results = await this.applySelector($, html, selector);
        if (results.length > 0) {
          selectorResults[selector.name] = results;
        }
      }
      
      // Convert results to structured data
      const scrapedItems: ScrapedItem[] = this.structureResults(selectorResults);
      
      return scrapedItems;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }
  
  // Apply a single selector to HTML content
  private async applySelector(
    $: cheerio.CheerioAPI,
    html: string,
    selector: SelectorConfig
  ): Promise<SelectorResult[]> {
    const results: SelectorResult[] = [];
    
    try {
      switch (selector.type) {
        case 'css':
          // Handle CSS selector with cheerio
          const elements = $(selector.value);
          
          if (elements.length === 0) {
            return [];
          }
          
          if (selector.multiple) {
            elements.each((_, el) => {
              const value = this.extractValueFromElement($, el, selector.attribute || 'text');
              if (value !== null) {
                results.push({ name: selector.name, value });
              }
            });
          } else {
            const firstEl = elements.first();
            const value = this.extractValueFromElement($, firstEl[0], selector.attribute || 'text');
            if (value !== null) {
              results.push({ name: selector.name, value });
            }
          }
          break;
          
        case 'xpath':
          // For XPath, we would need a library like xpath-ts
          // This is a simplified implementation
          console.warn('XPath support requires additional libraries');
          // Placeholder for XPath implementation
          break;
          
        case 'regex':
          // Apply regex pattern to HTML
          const regex = new RegExp(selector.value, 'g');
          const matches: string[] = [];
          
          let match;
          while ((match = regex.exec(html)) !== null) {
            matches.push(match[0]);
          }
          
          if (matches.length > 0) {
            if (selector.multiple) {
              results.push({ name: selector.name, value: matches });
            } else {
              results.push({ name: selector.name, value: matches[0] });
            }
          }
          break;
          
        default:
          console.warn(`Unknown selector type: ${selector.type}`);
      }
    } catch (error) {
      this.handleError(error);
    }
    
    return results;
  }
  
  // Extract value from an element based on attribute
  private extractValueFromElement(
    $: cheerio.CheerioAPI,
    element: cheerio.Element,
    attribute: string
  ): string | null {
    try {
      const $el = $(element);
      
      switch (attribute) {
        case 'text':
          return $el.text().trim();
        case 'html':
          return $el.html() || null;
        default:
          return $el.attr(attribute) || null;
      }
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }
  
  // Structure raw selector results into usable data items
  private structureResults(
    selectorResults: Record<string, SelectorResult[]>
  ): ScrapedItem[] {
    // Determine the maximum array length among multiple selectors
    let maxLength = 1;
    for (const key in selectorResults) {
      if (selectorResults[key].length > maxLength) {
        maxLength = selectorResults[key].length;
      }
    }
    
    const items: ScrapedItem[] = [];
    
    // Create structured items
    for (let i = 0; i < maxLength; i++) {
      const item: ScrapedItem = {};
      
      for (const key in selectorResults) {
        const results = selectorResults[key];
        
        if (i < results.length) {
          // Use value directly from result
          item[key] = results[i].value;
        } else if (results.length === 1) {
          // If only one result exists, use it for all items
          item[key] = results[0].value;
        } else {
          // Otherwise set to null
          item[key] = null;
        }
      }
      
      items.push(item);
    }
    
    return items;
  }
  
  // Get the next page URL
  private async getNextPageUrl(
    currentUrl: string,
    pagination: PaginationConfig,
    nextPageNum: number
  ): Promise<string | null> {
    if (!pagination.enabled || !pagination.selector) {
      return null;
    }
    
    try {
      switch (pagination.type) {
        case 'url':
          // Replace {page} placeholder with page number
          return pagination.selector.replace('{page}', nextPageNum.toString());
          
        case 'button':
          // Need to fetch the page and find the next button
          // Simplified implementation
          return null;
          
        case 'infinite':
          // For infinite scroll, would need a more complex implementation
          // Simplified implementation
          return null;
          
        default:
          return null;
      }
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }
  
  // Handle errors
  private handleError(error: unknown): void {
    let errorMessage = 'An unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Handle axios error object
      const axiosError = error as any;
      if (axiosError.response) {
        errorMessage = `Server responded with error ${axiosError.response.status}: ${axiosError.response.data?.error || axiosError.message}`;
      } else if (axiosError.request) {
        errorMessage = 'No response received from server. Check your network connection or the proxy server.';
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
    }
    
    console.error('Scraping error:', errorMessage);
    store.dispatch(setError(errorMessage));
  }
}

// Create singleton instance
const scraperService = new ScraperService();

export default scraperService;

