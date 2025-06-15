import React from 'react';
import { PhoneCall, PhoneOff, Keyboard, Loader2 } from 'lucide-react';

interface ConversationControlsProps {
  isConnected: boolean;
  isConnecting?: boolean;
  showTextInput: boolean;
  onToggleConnection: () => void;
  onToggleTextInput: () => void;
}

export const ConversationControls: React.FC<ConversationControlsProps> = ({
  isConnected,
  isConnecting = false,
  showTextInput,
  onToggleConnection,
  onToggleTextInput
}) => {
  return (
    <div className="flex items-center justify-center gap-4 p-6">
      {/* Only show keyboard button when connected */}
      {isConnected && (
        <button
          onClick={onToggleTextInput}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
            ${showTextInput 
              ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg' 
              : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md border border-gray-200'
            }
            hover:scale-105
          `}
          title="Toggle text input"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      )}

      <button
        onClick={onToggleConnection}
        disabled={isConnecting}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg
          ${isConnected 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : isConnecting
            ? 'bg-yellow-500 text-white cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
          ${!isConnecting ? 'hover:scale-105' : ''}
          disabled:opacity-75
        `}
        title={
          isConnecting 
            ? 'Connecting...' 
            : isConnected 
            ? 'End call' 
            : 'Start call'
        }
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isConnected ? (
          <PhoneOff className="w-6 h-6" />
        ) : (
          <PhoneCall className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};