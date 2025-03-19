import axios from 'axios';
import { JobType, JobResponse, CrawlResult, ScrapeResult, CrawlOptions, OutputFormat, JsonPrompts } from '../types';

const API_BASE_URL = 'http://localhost:3002/v1';
const API_KEY = 'YOUR_API_KEY'; // This should be configured via environment variables
const MAX_RETRIES = 3;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createJob = async (
  url: string, 
  type: JobType, 
  jsonPrompts?: JsonPrompts
): Promise<string | ScrapeResult> => {
  const formats: OutputFormat[] = jsonPrompts ? ['json'] : ['markdown', 'html'];
  
  const options: CrawlOptions = {
    formats,
    limit: type === 'crawl' ? 10 : undefined,
    jsonOptions: jsonPrompts
  };

  const endpoint = type === 'crawl' ? '/crawl' : '/scrape';
  const payload = type === 'crawl' 
    ? { 
        url, 
        limit: options.limit, 
        scrapeOptions: { 
          formats: options.formats,
          jsonOptions: options.jsonOptions 
        } 
      }
    : { 
        url, 
        formats: options.formats,
        jsonOptions: options.jsonOptions 
      };

  const { data } = await api.post(endpoint, payload);
  
  // For custom prompt scraping, return the result directly
  if (type === 'scrape' && jsonPrompts) {
    return data as ScrapeResult;
  }
  
  return (data as JobResponse).id;
};

export const getJobStatus = async (jobId: string, type: JobType, retryCount = 0): Promise<CrawlResult | ScrapeResult> => {
  try {
    const endpoint = type === 'crawl' ? `/crawl/${jobId}` : `/scrape/${jobId}`;
    const { data } = await api.get(endpoint);
    return data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getJobStatus(jobId, type, retryCount + 1);
    }
    throw error;
  }
};
