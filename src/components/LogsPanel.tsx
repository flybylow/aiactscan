import React, { useState, useEffect } from 'react';
import { X, FileText, Clock, AlertTriangle, CheckCircle, Ban, Shield, Scale } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success' | 'analysis';
  category: 'webhook' | 'analysis' | 'database' | 'ui' | 'system';
  message: string;
  details?: Record<string, any>;
}

interface LogsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({ 
  isOpen, 
  onClose, 
  logs, 
  onClearLogs 
}) => {
  const [filter, setFilter] = useState<'all' | 'webhook' | 'analysis' | 'database' | 'ui' | 'system'>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = logs.filter(log => filter === 'all' || log.category === filter);

  const getLogIcon = (type: LogEntry['type'], category: LogEntry['category']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'analysis':
        return <Scale className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'analysis':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryBadge = (category: LogEntry['category']) => {
    const badges = {
      webhook: 'bg-purple-100 text-purple-700',
      analysis: 'bg-blue-100 text-blue-700',
      database: 'bg-green-100 text-green-700',
      ui: 'bg-orange-100 text-orange-700',
      system: 'bg-gray-100 text-gray-700'
    };
    
    return badges[category] || badges.system;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">EU AI Act Analysis Logs</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {filteredLogs.length} entries
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClearLogs}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {['all', 'webhook', 'analysis', 'database', 'ui', 'system'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${filter === filterType 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                Auto-scroll
              </label>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No logs found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {filter === 'all' 
                      ? 'Start a conversation to see EU AI Act analysis logs'
                      : `No ${filter} logs available`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`
                      border rounded-lg p-3 transition-all duration-200
                      ${getLogColor(log.type)}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {getLogIcon(log.type, log.category)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-medium
                            ${getCategoryBadge(log.category)}
                          `}>
                            {log.category}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {log.message}
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 p-2 bg-white/50 rounded border">
                            <details className="text-xs">
                              <summary className="cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                                View Details
                              </summary>
                              <div className="mt-2 font-mono text-gray-600">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Webhook</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Database</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>UI</span>
              </div>
            </div>
            <div>
              Real-time EU AI Act analysis monitoring
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};