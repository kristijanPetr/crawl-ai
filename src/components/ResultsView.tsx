import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Loader, Globe, Info } from 'lucide-react';
import { Job, ContentData } from '../types';

interface ResultsViewProps {
  job: Job;
  isLoading: boolean;
}

const ContentCard: React.FC<{ content: ContentData }> = ({ content }) => {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-white shadow">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <img 
          src={content.metadata.favicon} 
          alt="" 
          className="w-4 h-4"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>';
          }}
        />
        <a 
          href={content.metadata.sourceURL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {content.metadata.title || content.metadata.ogTitle || 'Untitled'}
          <Globe className="w-4 h-4" />
        </a>
      </div>

      <div className="prose max-w-none">
        {content.markdown && <ReactMarkdown>{content.markdown}</ReactMarkdown>}
      </div>

      <details className="mt-4">
        <summary className="flex items-center gap-1 cursor-pointer text-gray-600 hover:text-gray-800">
          <Info className="w-4 h-4" />
          <span>Metadata</span>
        </summary>
        <div className="mt-2 text-sm bg-gray-50 p-3 rounded">
          <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
            {Object.entries(content.metadata)
              .filter(([key, value]) => 
                typeof value === 'string' && 
                !key.startsWith('msapplication') && 
                !['html', 'scrapeId'].includes(key)
              )
              .map(([key, value]) => (
                <React.Fragment key={key}>
                  <dt className="font-medium text-gray-600">{key}:</dt>
                  <dd className="text-gray-800">{value}</dd>
                </React.Fragment>
              ))
            }
          </dl>
        </div>
      </details>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ job, isLoading }) => {
  const handleCopy = () => {
    if (!job.result) return;
    const text = job.result
      .map(content => `# ${content.metadata.title}\n\n${content.markdown || ''}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
  };

  const handleExport = () => {
    if (!job.result) return;
    const text = job.result
      .map(content => `# ${content.metadata.title}\n\n${content.markdown || ''}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.type}-results.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!job) return null;

  return (
    <div className="w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Results</h2>
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                Processing... {job.completed ?? 0}/{job.total ?? 0}
              </span>
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
        <div className="space-y-6">
          {job.result.map((content, index) => (
            <ContentCard key={index} content={content} />
          ))}
        </div>
      )}

      {isLoading && !job.result?.length && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Loader className="h-8 w-8 animate-spin mb-2" />
          <p>Processing your request...</p>
          <p className="text-sm">
            {job.completed !== undefined && job.total !== undefined
              ? `Progress: ${job.completed}/${job.total}`
              : 'This may take a few moments'}
          </p>
        </div>
      )}
    </div>
  );
};
