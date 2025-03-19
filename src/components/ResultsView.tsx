import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Loader } from 'lucide-react';
import { Job } from '../types';

interface ResultsViewProps {
  job: Job;
  isLoading: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ job, isLoading }) => {
  const handleCopy = () => {
    if (!job.result) return;
    navigator.clipboard.writeText(job.result.join('\n'));
  };

  const handleExport = () => {
    if (!job.result) return;
    const blob = new Blob([job.result.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.type}-results.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!job) return null;

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Results</h2>
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader className="h-5 w-5 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
          {!isLoading && job.status === 'completed' && (
            <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Completed
            </span>
          )}
          {!isLoading && job.status === 'failed' && (
            <span className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded-full">
              Failed
            </span>
          )}
        </div>
        {job.result?.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export as markdown"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {job.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {job.error}
        </div>
      )}

      {job.result?.length > 0 && (
        <div className="prose max-w-none">
          {job.result.map((content, index) => (
            <ReactMarkdown key={index}>{content}</ReactMarkdown>
          ))}
        </div>
      )}

      {isLoading && !job.result?.length && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Loader className="h-8 w-8 animate-spin mb-2" />
          <p>Processing your request...</p>
          <p className="text-sm">This may take a few moments</p>
        </div>
      )}
    </div>
  );
};
