export type JobType = 'crawl' | 'scrape';
export type OutputFormat = 'markdown' | 'html' | 'json';

export interface JsonPrompts {
  [key: string]: string;
}

export interface ScrapeOptions {
  formats: OutputFormat[];
  jsonOptions?: JsonPrompts;
}

export interface CrawlOptions extends ScrapeOptions {
  limit?: number;
}

export interface ContentMetadata {
  title: string;
  description?: string;
  language: string;
  sourceURL: string;
  statusCode: number;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogSiteName?: string;
  favicon?: string;
  [key: string]: any;
}

export interface ContentData {
  markdown?: string;
  html?: string;
  json?: Record<string, any>;
  metadata: ContentMetadata;
}

export interface JobResponse {
  success: boolean;
  id: string;
  url: string;
}

export interface CrawlResult {
  success: boolean;
  status: 'pending' | 'scraping' | 'completed' | 'failed';
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  next?: string;
  data: ContentData[];
  error?: string;
}

export interface ScrapeResult {
  success: boolean;
  data: ContentData;
  error?: string;
}

export interface Job {
  id: string;
  type: JobType;
  status: 'pending' | 'scraping' | 'completed' | 'failed';
  result?: ContentData[];
  completed?: number;
  total?: number;
  error?: string;
}
