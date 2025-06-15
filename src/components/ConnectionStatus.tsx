import React from 'react';
import { Phone, PhoneOff, AlertCircle, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Phone,
          text: 'Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting...',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Connection Error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: PhoneOff,
          text: 'Disconnected',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
      ${config.color} ${config.bgColor} ${config.borderColor}
    `}>
      <Icon className={`w-3 h-3 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {config.text}
    </div>
  );
};