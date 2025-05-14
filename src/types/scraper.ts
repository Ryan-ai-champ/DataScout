export interface ScraperConfig {
  url: string;
  selectors: SelectorConfig[];
  pagination?: PaginationConfig;
  rateLimit: RateLimitConfig;
  headers: Record<string, string>;
}

export interface SelectorConfig {
  id: string;
  name: string;
  type: 'css' | 'xpath' | 'regex';
  value: string;
  attribute?: string; // For CSS selectors, e.g., 'href', 'src', 'text'
  multiple: boolean; // Whether to select multiple elements
}

export interface PaginationConfig {
  enabled: boolean;
  type: 'url' | 'button' | 'infinite';
  selector?: string; // CSS selector for the next button or URL pattern
  maxPages?: number; // Maximum number of pages to scrape
}

export interface RateLimitConfig {
  requestDelay: number; // Delay between requests in milliseconds
  concurrentRequests: number; // Number of concurrent requests
  timeoutMs: number; // Request timeout in milliseconds
  retries: number; // Number of retries for failed requests
}

export interface ScrapedItem {
  [key: string]: any; // Dynamic properties based on selectors
}

export type ScrapedData = ScrapedItem[];

export interface ScraperState {
  config: ScraperConfig;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  data: ScrapedData;
  error: string | null;
  progress: {
    current: number;
    total: number;
    startTime: number | null;
    endTime: number | null;
  };
  history: {
    id: string;
    url: string;
    timestamp: number;
    itemCount: number;
  }[];
}

