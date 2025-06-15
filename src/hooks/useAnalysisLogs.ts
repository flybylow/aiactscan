import { useState, useCallback } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success' | 'analysis';
  category: 'webhook' | 'analysis' | 'database' | 'ui' | 'system';
  message: string;
  details?: Record<string, any>;
}

export const useAnalysisLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((
    type: LogEntry['type'],
    category: LogEntry['category'],
    message: string,
    details?: Record<string, any>
  ) => {
    const newLog: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      category,
      message,
      details
    };

    setLogs(prev => [newLog, ...prev.slice(0, 199)]); // Keep last 200 logs
    
    // Also log to console for debugging
    const logLevel = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log';
    console[logLevel](`🇪🇺 ${category.toUpperCase()} - ${message}`, details || '');
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Convenience methods for different log types
  const logWebhook = useCallback((type: LogEntry['type'], message: string, details?: Record<string, any>) => {
    addLog(type, 'webhook', message, details);
  }, [addLog]);

  const logAnalysis = useCallback((type: LogEntry['type'], message: string, details?: Record<string, any>) => {
    addLog(type, 'analysis', message, details);
  }, [addLog]);

  const logDatabase = useCallback((type: LogEntry['type'], message: string, details?: Record<string, any>) => {
    addLog(type, 'database', message, details);
  }, [addLog]);

  const logUI = useCallback((type: LogEntry['type'], message: string, details?: Record<string, any>) => {
    addLog(type, 'ui', message, details);
  }, [addLog]);

  const logSystem = useCallback((type: LogEntry['type'], message: string, details?: Record<string, any>) => {
    addLog(type, 'system', message, details);
  }, [addLog]);

  return {
    logs,
    addLog,
    clearLogs,
    logWebhook,
    logAnalysis,
    logDatabase,
    logUI,
    logSystem
  };
};