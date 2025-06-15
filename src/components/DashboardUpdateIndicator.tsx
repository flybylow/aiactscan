import React, { useEffect, useState } from 'react';
import { RefreshCw, Database } from 'lucide-react';

interface DashboardUpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdated?: Date;
  newItemsCount?: number;
}

export const DashboardUpdateIndicator: React.FC<DashboardUpdateIndicatorProps> = ({
  isUpdating,
  lastUpdated,
  newItemsCount = 0
}) => {
  const [showNewItems, setShowNewItems] = useState(false);

  useEffect(() => {
    if (newItemsCount > 0) {
      setShowNewItems(true);
      const timer = setTimeout(() => setShowNewItems(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [newItemsCount]);

  if (!isUpdating && !showNewItems && !lastUpdated) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {isUpdating && (
        <div className="flex items-center gap-2 text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Updating dashboard...</span>
        </div>
      )}
      
      {showNewItems && newItemsCount > 0 && (
        <div className="flex items-center gap-2 text-green-600 animate-pulse">
          <Database className="w-4 h-4" />
          <span>
            {newItemsCount} new risk assessment{newItemsCount > 1 ? 's' : ''} added
          </span>
        </div>
      )}
      
      {lastUpdated && !isUpdating && (
        <div className="text-gray-500 text-xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};