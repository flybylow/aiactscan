import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isSending) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            className="
              w-full resize-none border-0 bg-transparent text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-0 text-sm leading-6 max-h-[120px] overflow-y-auto
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{ minHeight: '24px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled || isSending}
          className="
            flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500
            hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400
            text-white flex items-center justify-center transition-all duration-200
            disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100
            shadow-lg hover:shadow-xl disabled:shadow-md
          "
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};