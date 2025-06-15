import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, ArrowUp, Bot, User, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: Date;
}

interface ChatModuleProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  isTyping?: boolean;
  disabled?: boolean;
}

export const ChatModule: React.FC<ChatModuleProps> = ({
  messages,
  onSendMessage,
  isConnected,
  isTyping = false,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled || !isConnected) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <TooltipProvider>
      <Card className="flex flex-col h-[600px] bg-card text-card-foreground shadow-sm">
        {/* Header */}
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-assistant-avatar.png" alt="AI Assistant" />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Scale className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium leading-none">EU AI Act Assistant</p>
            <p className="text-xs text-muted-foreground">
              {isConnected ? 'Connected • Ready for compliance assessment' : 'Disconnected'}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="ml-auto h-8 w-8 rounded-full"
                disabled={!isConnected}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New conversation</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start new assessment</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to EU AI Act Compliance
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Describe your AI system to get an instant compliance assessment. 
                  I'll analyze it against EU AI Act requirements and provide risk categorization.
                </p>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md">
                  <p className="text-xs text-muted-foreground mb-2">Try saying:</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-foreground">"I have a recruitment AI system"</p>
                    <p className="text-foreground">"My AI does content recommendation"</p>
                    <p className="text-foreground">"We use AI for medical diagnosis"</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'agent' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            <Bot className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <p className="leading-relaxed">{message.content}</p>
                        <p className={cn(
                          "text-xs mt-1 opacity-70",
                          message.role === 'user' 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        )}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input */}
        <CardFooter className="flex items-center px-6 pt-0">
          <form onSubmit={handleSubmit} className="relative w-full">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isConnected 
                  ? "Describe your AI system for compliance assessment..." 
                  : "Connect to start assessment..."
              }
              disabled={disabled || !isConnected}
              className="flex-1 pr-12 bg-background"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || disabled || !isConnected}
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 rounded-full"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};