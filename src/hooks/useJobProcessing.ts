import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Job, JobType, JsonPrompts, ScrapeResult, CrawlResult } from '../types';
import { createJob, getJobStatus } from '../api/crawler';

export function useJobProcessing() {
  const [jobState, setJobState] = useState<{
    id: string | null;
    type: JobType;
    job: Job | null;
  }>({
    id: null,
    type: 'crawl',
    job: null
  });

  const { data: jobStatus, error } = useQuery({
    queryKey: ['job', jobState.id, jobState.type],
    queryFn: () => (jobState.id ? getJobStatus(jobState.id, jobState.type) : null),
    enabled: !!jobState.id,
    refetchInterval: (data) => {
      if (!data) return 5000;
      
      // For crawl jobs
      if ('status' in data) {
        return data.status === 'pending' || data.status === 'scraping' ? 5000 : false;
      }
      
      return false;
    },
    onSuccess: (data: CrawlResult | ScrapeResult | null) => {
      if (!data) return;

      if ('status' in data) { // CrawlResult
        const isComplete = data.status === 'completed' && data.completed === data.total;
        const isFailed = data.status === 'failed' || data.error;

        setJobState(prev => ({
          ...prev,
          job: {
            id: prev.id!,
            type: prev.type,
            status: isComplete ? 'completed' : isFailed ? 'failed' : data.status,
            // Always update results array with latest data
            result: data.data || [],
            completed: data.completed,
            total: data.total,
            error: data.error
          }
        }));

        if (isComplete) {
          toast.success('Job completed successfully!');
        } else if (isFailed) {
          toast.error(data.error || 'Job failed');
        }
      } else { // ScrapeResult
        setJobState(prev => ({
          ...prev,
          job: {
            id: prev.id!,
            type: prev.type,
            status: data.success ? 'completed' : 'failed',
            result: data.success ? [data.data] : [],
            error: data.error
          }
        }));

        if (data.success) {
          toast.success('Scraping completed successfully!');
        } else {
          toast.error(data.error || 'Scraping failed');
        }
      }
    },
    onError: () => {
      toast.error('Failed to fetch job status');
    }
  });

  const submitJob = async (url: string, type: JobType, prompts?: JsonPrompts) => {
    try {
      const result = await createJob(url, type, prompts);
      
      // Handle immediate result for custom prompt scraping
      if (typeof result !== 'string' && type === 'scrape' && prompts) {
        setJobState({
          id: null,
          type,
          job: {
            id: 'direct',
            type,
            status: result.success ? 'completed' : 'failed',
            result: result.success ? [result.data] : [],
            error: result.error
          }
        });
        
        if (result.success) {
          toast.success('Scraping completed successfully!');
        } else {
          toast.error(result.error || 'Scraping failed');
        }
        return;
      }

      // Handle regular job creation
      setJobState({
        id: result as string,
        type,
        job: null
      });
      toast.success('Job started successfully');
    } catch (error) {
      toast.error('Failed to start job');
    }
  };

  return {
    submitJob,
    currentJob: jobState.job,
    isLoading: !!jobState.id && (!jobState.job || ['pending', 'scraping'].includes(jobState.job.status)),
  };
}
