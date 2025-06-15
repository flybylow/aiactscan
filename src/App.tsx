import React, { useState, useEffect, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { MessageBubble } from './components/MessageBubble';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TypingIndicator } from './components/TypingIndicator';
import { ConversationControls } from './components/ConversationControls';
import { ChatInput } from './components/ChatInput';
import { RiskIndicator } from './components/RiskIndicator';
import { RiskDashboard } from './components/RiskDashboard';
import { AdminPage } from './components/AdminPage';
import { RiskNotification } from './components/RiskNotification';
import { PostConversationSummary } from './components/PostConversationSummary';
import { useRiskAssessments } from './hooks/useRiskAssessments';
import { useAnalysisLogs } from './hooks/useAnalysisLogs';
import { Scale, Shield, Settings } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface RiskNotificationData {
  id: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  conversationId: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [currentMode, setCurrentMode] = useState<string>('idle');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showRiskDashboard, setShowRiskDashboard] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [riskNotifications, setRiskNotifications] = useState<RiskNotificationData[]>([]);
  const [currentRiskAssessment, setCurrentRiskAssessment] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [realTimeRiskLevel, setRealTimeRiskLevel] = useState<'critical' | 'high' | 'medium' | 'low' | 'undefined'>('undefined');
  const [realTimeRiskScore, setRealTimeRiskScore] = useState<number | undefined>(undefined);
  const [riskStatusUpdated, setRiskStatusUpdated] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showPostConversationSummary, setShowPostConversationSummary] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Risk assessment hook
  const { 
    riskAssessments, 
    loading: riskLoading, 
    isUpdating,
    lastUpdated,
    newItemsCount,
    fetchRiskAssessments, 
    getLatestRiskAssessment 
  } = useRiskAssessments();

  // Analysis logs hook
  const {
    logs,
    clearLogs,
    logWebhook,
    logAnalysis,
    logDatabase,
    logUI,
    logSystem
  } = useAnalysisLogs();

  // Check if API key is available
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
  
  useEffect(() => {
    if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
      console.error('ElevenLabs API key not found or is placeholder. Please check your .env file.');
      setConnectionStatus('error');
      logSystem('error', 'ElevenLabs API key not found or is placeholder');
    }
    if (!agentId || agentId === 'your_agent_id_here') {
      console.error('ElevenLabs Agent ID not found or is placeholder. Please check your .env file.');
      setConnectionStatus('error');
      logSystem('error', 'ElevenLabs Agent ID not found or is placeholder');
    }
  }, [apiKey, agentId, logSystem]);

  // Fetch risk assessments on component mount
  useEffect(() => {
    fetchRiskAssessments();
    logSystem('info', 'AI Act Scan initialized - EU AI Act compliance system ready');
  }, [fetchRiskAssessments, logSystem]);

  // Listen for risk detection events from webhooks
  useEffect(() => {
    console.log('🎧 Setting up webhook event listeners...');
    logSystem('info', 'Setting up webhook event listeners for EU AI Act analysis');
    
    const handleRiskDetected = (event: CustomEvent) => {
      const riskAssessment = event.detail;
      console.log('🚨 APP EVENT - Risk notification triggered from webhook:', {
        id: riskAssessment.id,
        risk_level: riskAssessment.risk_level,
        risk_score: riskAssessment.risk_score,
        conversation_id: riskAssessment.conversation_id
      });
      
      logUI('success', 'EU AI Act risk assessment notification triggered', {
        risk_level: riskAssessment.risk_level,
        risk_score: riskAssessment.risk_score,
        conversation_id: riskAssessment.conversation_id,
        eu_category: riskAssessment.risk_factors?.eu_assessment?.category,
        eu_label: riskAssessment.risk_factors?.eu_assessment?.label
      });
      
      // Update current risk assessment and top bar status
      setCurrentRiskAssessment(riskAssessment);
      setRealTimeRiskLevel(riskAssessment.risk_level);
      setRealTimeRiskScore(riskAssessment.risk_score);
      setRiskStatusUpdated(true);
      
      console.log('📊 APP - Updated top bar risk indicator:', {
        level: riskAssessment.risk_level,
        score: riskAssessment.risk_score
      });
      
      logUI('info', 'Top bar risk indicator updated', {
        level: riskAssessment.risk_level,
        score: riskAssessment.risk_score,
        eu_category: riskAssessment.risk_factors?.eu_assessment?.category
      });
      
      // Reset the updated indicator after a brief moment
      setTimeout(() => {
        setRiskStatusUpdated(false);
        console.log('✨ APP - Risk indicator highlight reset');
        logUI('info', 'Risk indicator highlight reset');
      }, 2000);
      
      const notification: RiskNotificationData = {
        id: `notification_${Date.now()}`,
        riskLevel: riskAssessment.risk_level,
        riskScore: riskAssessment.risk_score,
        conversationId: riskAssessment.conversation_id
      };
      
      setRiskNotifications(prev => [...prev, notification]);
      console.log('🔔 APP - Added risk notification to UI');
      logUI('success', 'Risk notification added to UI', {
        notification_id: notification.id,
        risk_level: notification.riskLevel
      });

      // Show post-conversation summary if conversation has ended
      if (conversationEnded) {
        console.log('📋 APP - Showing post-conversation summary with webhook data');
        setShowPostConversationSummary(true);
        logUI('info', 'Showing post-conversation summary with final risk assessment');
      }
    };

    window.addEventListener('riskDetected', handleRiskDetected as EventListener);
    
    return () => {
      console.log('🎧 Cleaning up webhook event listeners...');
      logSystem('info', 'Cleaning up webhook event listeners');
      window.removeEventListener('riskDetected', handleRiskDetected as EventListener);
    };
  }, [logUI, logSystem, conversationEnded]);

  // Listen for new risk assessments from real-time updates
  useEffect(() => {
    const handleNewRiskAssessment = (event: CustomEvent) => {
      const newAssessment = event.detail;
      console.log('📊 APP EVENT - New risk assessment from webhook real-time update:', {
        id: newAssessment.id,
        risk_level: newAssessment.risk_level,
        risk_score: newAssessment.risk_score,
        conversation_id: newAssessment.conversation_id
      });
      
      logDatabase('success', 'New EU AI Act risk assessment received from webhook', {
        id: newAssessment.id,
        risk_level: newAssessment.risk_level,
        risk_score: newAssessment.risk_score,
        conversation_id: newAssessment.conversation_id,
        eu_assessment: newAssessment.risk_factors?.eu_assessment
      });
      
      // Update current risk assessment and top bar status
      setCurrentRiskAssessment(newAssessment);
      setRealTimeRiskLevel(newAssessment.risk_level);
      setRealTimeRiskScore(newAssessment.risk_score);
      setRiskStatusUpdated(true);
      
      console.log('📊 APP - Updated top bar with webhook data:', {
        level: newAssessment.risk_level,
        score: newAssessment.risk_score
      });
      
      logUI('info', 'Top bar updated with comprehensive EU AI Act assessment', {
        level: newAssessment.risk_level,
        score: newAssessment.risk_score,
        eu_category: newAssessment.risk_factors?.eu_assessment?.category,
        compliance_requirements: newAssessment.risk_factors?.eu_assessment?.compliance_requirements?.length || 0
      });
      
      // Reset the updated indicator after a brief moment
      setTimeout(() => {
        setRiskStatusUpdated(false);
        console.log('✨ APP - Risk indicator highlight reset');
        logUI('info', 'Risk indicator highlight reset after webhook update');
      }, 2000);

      // Show post-conversation summary if conversation has ended
      if (conversationEnded) {
        console.log('📋 APP - Showing post-conversation summary with comprehensive webhook data');
        setShowPostConversationSummary(true);
        logUI('info', 'Showing post-conversation summary with final risk assessment');
      }
    };

    window.addEventListener('newRiskAssessment', handleNewRiskAssessment as EventListener);
    
    return () => {
      window.removeEventListener('newRiskAssessment', handleNewRiskAssessment as EventListener);
    };
  }, [logDatabase, logUI, conversationEnded]);

  const conversation = useConversation({
    apiKey: apiKey,
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setConnectionStatus('connected');
      setIsConnecting(false);
      setConversationEnded(false);
      
      logSystem('success', 'Connected to ElevenLabs conversational AI');
      
      // Reset risk status when starting new conversation
      setRealTimeRiskLevel('undefined');
      setRealTimeRiskScore(undefined);
      setRiskStatusUpdated(false);
      setCurrentRiskAssessment(null);
      setShowPostConversationSummary(false);
      
      // Generate a conversation ID for tracking
      const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newConversationId);
      console.log('🎯 CONVERSATION - Started with ID:', newConversationId);
      
      logAnalysis('info', 'New EU AI Act assessment conversation started', {
        conversation_id: newConversationId,
        timestamp: new Date().toISOString()
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setConnectionStatus('disconnected');
      setCurrentMode('idle');
      setIsUserSpeaking(false);
      setShowTextInput(false);
      setIsConnecting(false);
      setConversationEnded(true);
      
      logSystem('info', 'Disconnected from ElevenLabs');
      
      if (conversationId) {
        console.log('🏁 CONVERSATION - Ended:', conversationId);
        
        logAnalysis('info', 'Conversation ended - EU AI Act post-call analysis will be triggered', {
          conversation_id: conversationId,
          ended_at: new Date().toISOString()
        });

        // Show post-conversation summary immediately after conversation ends
        console.log('📋 APP - Conversation ended, showing post-conversation summary');
        setTimeout(() => {
          setShowPostConversationSummary(true);
          logUI('info', 'Post-conversation summary triggered after call end');
        }, 1000); // Small delay to allow for any immediate webhook processing
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setConnectionStatus('error');
      setCurrentMode('idle');
      setIsUserSpeaking(false);
      setIsConnecting(false);
      
      logSystem('error', 'ElevenLabs conversation error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error messages based on the error type
      let errorText = 'Connection error occurred.';
      
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorText = 'Authentication failed. Please check your ElevenLabs API key in the .env file.';
        } else if (error.message.includes('404') || error.message.includes('not found')) {
          errorText = 'Agent not found. Please check your ElevenLabs Agent ID in the .env file.';
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          errorText = 'Access denied. Your API key may not have permission to use this agent.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorText = 'Network connection failed. Please check your internet connection.';
        } else if (error.message.includes('WebSocket')) {
          errorText = 'WebSocket connection failed. This may be due to network issues or invalid credentials.';
        } else {
          errorText = `Connection error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      console.log('Message details:', {
        message: message.message,
        source: message.source,
        role: message.role,
        type: message.type,
        isUserSpeaking: isUserSpeaking,
        currentMode: currentMode,
        conversationId: conversationId
      });
      
      setIsTyping(false);
      
      const isUserMessage = 
        message.source === 'user' || 
        message.role === 'user' || 
        message.type === 'user_transcript' ||
        isUserSpeaking ||
        currentMode === 'listening';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.message || 'Message received',
        sender: isUserMessage ? 'user' : 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Log message for webhook debugging
      const messageType = isUserMessage ? 'USER' : 'AGENT';
      console.log(`💬 CONVERSATION ${messageType} MESSAGE:`, {
        conversationId,
        message: message.message,
        timestamp: new Date().toISOString()
      });
      
      logAnalysis('info', `${messageType} message received`, {
        conversation_id: conversationId,
        message_type: messageType.toLowerCase(),
        message_length: message.message?.length || 0,
        message_preview: message.message?.slice(0, 100) + '...'
      });
      
      // Check if this message contains EU AI Act risk indicators
      if (isUserMessage && message.message) {
        const euRiskKeywords = [
          'ai system', 'artificial intelligence', 'machine learning', 'algorithm',
          'biometric', 'facial recognition', 'emotion recognition', 'social scoring',
          'critical infrastructure', 'high risk', 'prohibited', 'compliance',
          'recruitment', 'hiring', 'educational', 'medical', 'credit scoring',
          'surveillance', 'mass surveillance', 'subliminal', 'manipulation'
        ];
        const hasEURiskKeywords = euRiskKeywords.some(keyword => 
          message.message.toLowerCase().includes(keyword)
        );
        
        if (hasEURiskKeywords) {
          console.log('🇪🇺 EU AI ACT DETECTION - Keywords found in user message:', message.message);
          
          const matchedKeywords = euRiskKeywords.filter(keyword => 
            message.message.toLowerCase().includes(keyword)
          );
          
          logAnalysis('warning', 'EU AI Act risk keywords detected in user message', {
            conversation_id: conversationId,
            matched_keywords: matchedKeywords,
            message_content: message.message,
            detection_timestamp: new Date().toISOString()
          });
        }
      }
      
      if (isUserMessage) {
        setIsUserSpeaking(false);
      }
    },
    onModeChange: (mode) => {
      console.log('Mode changed:', mode);
      setCurrentMode(mode.mode);
      
      if (mode.mode === 'listening') {
        console.log('User is speaking');
        setIsTyping(true);
        setIsUserSpeaking(true);
        logSystem('info', 'User started speaking - listening for EU AI Act keywords');
      } else if (mode.mode === 'speaking') {
        console.log('AI is speaking');
        setIsTyping(false);
        setIsUserSpeaking(false);
        logSystem('info', 'AI agent started speaking');
      } else if (mode.mode === 'thinking') {
        console.log('AI is thinking');
        setIsTyping(true);
        setIsUserSpeaking(false);
        logSystem('info', 'AI agent is processing and thinking');
      } else {
        console.log('Mode idle');
        setIsTyping(false);
        setIsUserSpeaking(false);
        logSystem('info', 'Conversation is idle');
      }
    },
    onStatusChange: (status) => {
      console.log('Status changed:', status);
      if (status.status === 'connected') {
        setConnectionStatus('connected');
        setIsConnecting(false);
        logSystem('success', 'ElevenLabs connection status: connected');
      } else if (status.status === 'disconnected') {
        setConnectionStatus('disconnected');
        setCurrentMode('idle');
        setIsUserSpeaking(false);
        setIsConnecting(false);
        logSystem('info', 'ElevenLabs connection status: disconnected');
      } else if (status.status === 'connecting') {
        setConnectionStatus('connecting');
        setIsConnecting(true);
        logSystem('info', 'ElevenLabs connection status: connecting');
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleToggleConnection = async () => {
    // Prevent multiple connection attempts
    if (isConnecting) {
      console.log('Connection attempt already in progress');
      logSystem('warning', 'Connection attempt already in progress');
      return;
    }

    // Validate API key format
    if (!apiKey || apiKey === 'your_elevenlabs_api_key_here') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'ElevenLabs API key is missing or invalid. Please update your .env file with a valid API key from your ElevenLabs account.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      logSystem('error', 'ElevenLabs API key is missing or invalid');
      return;
    }

    // Validate Agent ID format
    if (!agentId || agentId === 'your_agent_id_here') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'ElevenLabs Agent ID is missing or invalid. Please update your .env file with a valid agent ID from your ElevenLabs account.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      logSystem('error', 'ElevenLabs Agent ID is missing or invalid');
      return;
    }

    // Check API key format (ElevenLabs API keys typically start with 'sk_')
    if (!apiKey.startsWith('sk_')) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Invalid API key format. ElevenLabs API keys should start with "sk_". Please check your .env file.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      logSystem('error', 'Invalid API key format - should start with "sk_"');
      return;
    }

    // Check Agent ID format (ElevenLabs Agent IDs typically start with 'agent_')
    if (!agentId.startsWith('agent_')) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Invalid Agent ID format. ElevenLabs Agent IDs should start with "agent_". Please check your .env file.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      logSystem('error', 'Invalid Agent ID format - should start with "agent_"');
      return;
    }

    if (conversation.status === 'connected') {
      try {
        console.log('Ending conversation session...');
        logSystem('info', 'Ending conversation session - triggering EU AI Act post-call analysis');
        await conversation.endSession();
      } catch (error) {
        console.error('Error ending session:', error);
        logSystem('error', 'Error ending conversation session', { error: error.message });
        // Force disconnect if endSession fails
        setConnectionStatus('disconnected');
        setCurrentMode('idle');
        setIsUserSpeaking(false);
        setConversationEnded(true);
        
        // Still show summary even if endSession fails
        if (conversationId && messages.length > 0) {
          setTimeout(() => {
            setShowPostConversationSummary(true);
            logUI('info', 'Post-conversation summary triggered after forced disconnect');
          }, 1000);
        }
      }
    } else {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      logSystem('info', 'Starting new EU AI Act assessment conversation');
      
      try {
        console.log('Starting conversation session...');
        await conversation.startSession({
          agentId: agentId,
        });
      } catch (error: any) {
        console.error('Failed to start session:', error);
        setConnectionStatus('error');
        setIsConnecting(false);
        
        logSystem('error', 'Failed to start conversation session', {
          error: error.message,
          code: error.code
        });
        
        // Provide more specific error messages
        let errorText = 'Failed to connect to ElevenLabs.';
        
        if (error.code === 1006) {
          errorText = 'Connection failed (WebSocket error 1006). This usually indicates invalid API credentials or network issues. Please verify your ElevenLabs API key and Agent ID are correct and active.';
        } else if (error.message) {
          if (error.message.includes('401')) {
            errorText = 'Authentication failed (401). Your API key is invalid or expired. Please check your ElevenLabs API key.';
          } else if (error.message.includes('404')) {
            errorText = 'Agent not found (404). Please verify your Agent ID exists in your ElevenLabs account.';
          } else if (error.message.includes('403')) {
            errorText = 'Access forbidden (403). Your API key may not have permission to use this agent.';
          } else if (error.message.includes('WebSocket')) {
            errorText = 'WebSocket connection failed. Please check your network connection and firewall settings.';
          } else {
            errorText = `Connection failed: ${error.message}`;
          }
        }
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: errorText,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleToggleTextInput = () => {
    setShowTextInput(!showTextInput);
    logUI('info', `Text input ${!showTextInput ? 'enabled' : 'disabled'}`);
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    logAnalysis('info', 'Text message sent for EU AI Act analysis', {
      conversation_id: conversationId,
      message_length: text.length,
      message_preview: text.slice(0, 100) + '...'
    });
    
    // Check if we're connected and can send messages
    if (conversation.status === 'connected' && typeof conversation.sendMessage === 'function') {
      try {
        setIsTyping(true);
        await conversation.sendMessage(text);
        logSystem('success', 'Text message sent to ElevenLabs agent');
      } catch (error: any) {
        console.error('Failed to send message:', error);
        setIsTyping(false);
        
        logSystem('error', 'Failed to send text message', { error: error.message });
        
        let errorText = 'Failed to send message.';
        if (error.message && error.message.includes('WebSocket')) {
          errorText = 'Connection lost while sending message. Please try reconnecting.';
        } else if (error.message) {
          errorText = `Failed to send message: ${error.message}`;
        }
        
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          text: errorText,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Provide a helpful response for text messages when not connected or sendMessage not available
      setTimeout(() => {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          text: `I received your message: "${text}". Please note that this EU AI Act compliance assistant is optimized for voice conversations. For the best experience, try using the voice chat feature by clicking the call button and speaking directly about your AI system.`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        logUI('info', 'Provided guidance for voice conversation usage');
      }, 1000);
    }
  };

  const handleCloseNotification = (notificationId: string) => {
    setRiskNotifications(prev => prev.filter(n => n.id !== notificationId));
    logUI('info', 'Risk notification closed', { notification_id: notificationId });
  };

  const handleSummaryGenerated = (summary: any) => {
    setCurrentRiskAssessment(summary);
    setRealTimeRiskLevel(summary.risk_level);
    setRealTimeRiskScore(summary.risk_score);
    logUI('success', 'Post-conversation summary generated', {
      risk_level: summary.risk_level,
      risk_score: summary.risk_score
    });
  };

  const handleCloseSummary = () => {
    setShowPostConversationSummary(false);
    logUI('info', 'Post-conversation summary closed');
  };

  // Determine current risk status - use webhook data
  const getCurrentRiskStatus = () => {
    // If we have real-time risk data from webhooks, use that
    if (realTimeRiskLevel !== 'undefined') {
      return { 
        level: realTimeRiskLevel, 
        score: realTimeRiskScore
      };
    }
    
    // Otherwise, show "Risk: Pending" until we get webhook data
    return { level: 'undefined' as const, score: undefined };
  };

  const currentRiskStatus = getCurrentRiskStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Act Scan</h1>
                <p className="text-sm text-gray-600">Compliance Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Risk Indicator - Shows webhook data */}
              <div className={`transition-all duration-300 ${riskStatusUpdated ? 'scale-105 ring-2 ring-blue-300' : ''}`}>
                <RiskIndicator 
                  riskLevel={currentRiskStatus.level}
                  riskScore={currentRiskStatus.score}
                />
              </div>
              
              {/* Admin Panel Button */}
              <button
                onClick={() => setShowAdminPage(true)}
                className="w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
              
              {/* Risk Dashboard Button */}
              <button
                onClick={() => setShowRiskDashboard(true)}
                className={`
                  w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center transition-colors relative
                  ${newItemsCount > 0 ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
                `}
                title="View EU AI Act Risk Dashboard"
              >
                <Shield className="w-4 h-4 text-gray-600" />
                {newItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {newItemsCount > 9 ? '9+' : newItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-1">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center text-gray-500">
                  <Scale className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg font-medium mb-2">Scan your AI Act risk (free)</p>
                  <p className="text-sm">Click the green button to start</p>
                  <p className="text-xs mt-2 text-gray-400">Describe your AI system to get a compliance assessment</p>
                  {conversationId && (
                    <p className="text-xs mt-1 text-blue-500">Conversation ID: {conversationId}</p>
                  )}
                  {(!apiKey || apiKey === 'your_elevenlabs_api_key_here' || !agentId || agentId === 'your_agent_id_here') && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-600 font-medium mb-2">Configuration Required</p>
                      <p className="text-xs text-red-500">
                        Please update your .env file with valid ElevenLabs API key and Agent ID
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        {showTextInput && (
          <div className="flex-shrink-0 px-6 pb-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput 
                onSendMessage={handleSendMessage}
                disabled={false}
                placeholder="Describe your AI system for EU AI Act compliance assessment..."
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-white/20">
          <ConversationControls
            isConnected={conversation.status === 'connected'}
            isConnecting={isConnecting}
            showTextInput={showTextInput}
            connectionStatus={connectionStatus}
            onToggleConnection={handleToggleConnection}
            onToggleTextInput={handleToggleTextInput}
          />
        </div>
      </div>

      {/* Risk Notifications */}
      {riskNotifications.map((notification) => (
        <RiskNotification
          key={notification.id}
          riskLevel={notification.riskLevel}
          riskScore={notification.riskScore}
          conversationId={notification.conversationId}
          onClose={() => handleCloseNotification(notification.id)}
        />
      ))}

      {/* Post-Conversation Summary */}
      <PostConversationSummary
        messages={messages}
        conversationId={conversationId}
        isConnected={conversation.status === 'connected'}
        onSummaryGenerated={handleSummaryGenerated}
        showSummary={showPostConversationSummary}
        onClose={handleCloseSummary}
        currentRiskAssessment={currentRiskAssessment}
      />

      {/* Admin Panel */}
      <AdminPage
        isOpen={showAdminPage}
        onClose={() => setShowAdminPage(false)}
      />

      {/* Risk Dashboard Modal */}
      <RiskDashboard 
        isOpen={showRiskDashboard}
        onClose={() => setShowRiskDashboard(false)}
        isUpdating={isUpdating}
        lastUpdated={lastUpdated}
        newItemsCount={newItemsCount}
      />
    </div>
  );
}

export default App;