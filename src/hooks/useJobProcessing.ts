import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Job, JobType, JsonPrompts } from '../types';
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
    refetchInterval: (data: any) => {
      if (!data || data.status === 'pending' || data.status === 'processing') {
        return 5000;
      }
      return false;
    },
    onSuccess: (data) => {
      if (data) {
        const status = 'status' in data ? data.status : (data.success ? 'completed' : 'failed');
        const result = 'data' in data ? [data.data] : data.data;
        const error = data.error;

        setJobState(prev => ({
          ...prev,
          job: {
            id: prev.id!,
            type: prev.type,
            status: status as Job['status'],
            result,
            error
          }
        }));

        if (status === 'completed') {
          toast.success('Job completed successfully!');
        } else if (status === 'failed') {
          toast.error(error || 'Job failed');
        }
      }
    },
    onError: () => {
      toast.error('Failed to fetch job status');
    }
  });

  const submitJob = async (url: string, type: JobType, prompts?: JsonPrompts) => {
    try {
      const jobId = await createJob(url, type, prompts);
      setJobState({
        id: jobId,
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
    isLoading: !!jobState.id && (!jobState.job || ['pending', 'processing'].includes(jobState.job.status)),
  };
}
