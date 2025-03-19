import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { JobForm } from './components/JobForm';
import { ResultsView } from './components/ResultsView';
import { useJobProcessing } from './hooks/useJobProcessing';

const queryClient = new QueryClient();

function App() {
  const { submitJob, currentJob, isLoading } = useJobProcessing();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Web Crawler Dashboard
          </h1>
          <JobForm onSubmit={submitJob} isLoading={isLoading} />
          {currentJob && <ResultsView job={currentJob} isLoading={isLoading} />}
        </div>
      </div>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
