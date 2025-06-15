import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  if (isUser) {
    // User messages - right aligned
    return (
      <div className="flex items-start gap-3 mb-4 justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl shadow-sm bg-blue-500 text-white rounded-tr-md">
          <p className="text-sm leading-relaxed">{message.text}</p>
          <p className="text-xs mt-1 opacity-70 text-blue-100 text-right">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }
  
  // AI messages - left aligned
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="max-w-[80%] px-4 py-3 rounded-2xl shadow-sm bg-white text-gray-800 rounded-tl-md border border-gray-200">
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p className="text-xs mt-1 opacity-70 text-gray-500">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};