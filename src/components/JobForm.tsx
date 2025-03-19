import React, { useState } from 'react';
import { Globe, Search, Plus, X } from 'lucide-react';
import { JobType, JsonPrompts } from '../types';

interface JobFormProps {
  onSubmit: (url: string, type: JobType, prompts?: JsonPrompts) => void;
  isLoading: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState<JobType>('crawl');
  const [prompts, setPrompts] = useState<{ key: string; value: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    const jsonPrompts = prompts.length > 0 && type === 'scrape'
      ? prompts.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
      : undefined;

    onSubmit(url, type, jsonPrompts);
  };

  const addPrompt = () => {
    setPrompts([...prompts, { key: '', value: '' }]);
  };

  const removePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, field: 'key' | 'value', value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index][field] = value;
    setPrompts(newPrompts);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl">
      <div className="flex flex-col gap-2">
        <label htmlFor="url" className="text-sm font-medium text-gray-700">
          URL to Process
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Operation Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="crawl"
              checked={type === 'crawl'}
              onChange={(e) => {
                setType(e.target.value as JobType);
                setPrompts([]);
              }}
              className="w-4 h-4 text-blue-600"
            />
            <span>Crawl</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="scrape"
              checked={type === 'scrape'}
              onChange={(e) => setType(e.target.value as JobType)}
              className="w-4 h-4 text-blue-600"
            />
            <span>Scrape</span>
          </label>
        </div>
      </div>

      {type === 'scrape' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Custom Prompts</label>
            <button
              type="button"
              onClick={addPrompt}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Prompt
            </button>
          </div>
          
          {prompts.map((prompt, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={prompt.key}
                onChange={(e) => updatePrompt(index, 'key', e.target.value)}
                placeholder="Prompt name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                value={prompt.value}
                onChange={(e) => updatePrompt(index, 'value', e.target.value)}
                placeholder="Extract..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => removePrompt(index)}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      >
        <Search className="h-5 w-5" />
        {isLoading ? 'Processing...' : 'Start Processing'}
      </button>
    </form>
  );
};
