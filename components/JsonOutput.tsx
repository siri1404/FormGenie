
import React, { useState, useCallback } from 'react';
import { FormData } from '../types';

interface JsonOutputProps {
  data: FormData | null;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Structured JSON Output</h3>
        <div className="relative bg-slate-800 rounded-lg p-4 font-mono text-sm text-white overflow-x-auto">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-sans rounded-md px-2 py-1 transition-colors"
                >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <pre><code>{JSON.stringify(data, null, 2)}</code></pre>
        </div>
    </div>
  );
};

export default JsonOutput;
