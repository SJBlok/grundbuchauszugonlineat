import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { cn } from '@/lib/utils';
import type { APILogEntry } from '@/types/grundbuch-api';

export function APILogger() {
  const { apiLogs, clearApiLogs } = useGrundbuchTestStore();
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleLog = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (log: APILogEntry) => {
    const text = JSON.stringify({
      request: {
        method: log.method,
        endpoint: log.endpoint,
        headers: log.requestHeaders,
        body: log.requestBody,
      },
      response: {
        status: log.responseStatus,
        body: log.responseBody,
      },
      duration: log.duration,
    }, null, 2);
    
    await navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 400 && status < 500) return 'text-amber-400';
    return 'text-red-400';
  };

  if (apiLogs.length === 0) {
    return (
      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <p className="text-slate-500 text-sm text-center font-mono">
          Geen API calls gelogd
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-300">API Logs ({apiLogs.length})</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearApiLogs}
          className="text-slate-400 hover:text-slate-200 h-7"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {apiLogs.map((log) => (
          <div 
            key={log.id} 
            className="bg-slate-900 rounded border border-slate-700 overflow-hidden"
          >
            <button
              onClick={() => toggleLog(log.id)}
              className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 font-mono text-xs">
                {expandedLogs.has(log.id) ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
                <span className="text-cyan-400">{log.method}</span>
                <span className="text-slate-300">{log.endpoint}</span>
                <span className={getStatusColor(log.responseStatus)}>
                  {log.responseStatus}
                </span>
                <span className="text-slate-500">{log.duration}ms</span>
              </div>
              <span className="text-slate-500 text-xs">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </button>

            {expandedLogs.has(log.id) && (
              <div className="px-3 pb-3 space-y-3 border-t border-slate-700">
                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(log)}
                    className="text-slate-400 hover:text-slate-200 h-6 text-xs"
                  >
                    {copiedId === log.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h4 className="text-xs text-slate-400 mb-1">Request Body</h4>
                  <pre className="text-xs bg-slate-950 p-2 rounded overflow-x-auto text-slate-300 font-mono">
                    {JSON.stringify(log.requestBody, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs text-slate-400 mb-1">Response Body</h4>
                  <pre className="text-xs bg-slate-950 p-2 rounded overflow-x-auto text-slate-300 font-mono max-h-48 overflow-y-auto">
                    {JSON.stringify(log.responseBody, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
