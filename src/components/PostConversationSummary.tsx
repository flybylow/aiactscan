import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Scale, FileText, AlertTriangle, CheckCircle, Ban, Shield, Clock, X, ExternalLink } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface PostConversationSummaryProps {
  messages: Message[];
  conversationId: string | null;
  isConnected: boolean;
  onSummaryGenerated: (summary: any) => void;
  showSummary: boolean;
  onClose: () => void;
  currentRiskAssessment: any;
}

interface EUAIActAssessment {
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  risk_score: number;
  conversation_summary: string;
  risk_factors: Record<string, any>;
  eu_assessment: {
    category: string;
    label: string;
    description: string;
    compliance_requirements: string[];
  };
}

export const PostConversationSummary: React.FC<PostConversationSummaryProps> = ({
  messages,
  conversationId,
  isConnected,
  onSummaryGenerated,
  showSummary,
  onClose,
  currentRiskAssessment
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<EUAIActAssessment | null>(null);
  const [waitingForWebhook, setWaitingForWebhook] = useState(false);
  const [webhookReceived, setWebhookReceived] = useState(false);

  // Use current risk assessment if available
  useEffect(() => {
    if (currentRiskAssessment && !assessment) {
      console.log('📊 POST-CONVERSATION - Using current risk assessment:', currentRiskAssessment);
      setAssessment(currentRiskAssessment);
      setWebhookReceived(true);
      setWaitingForWebhook(false);
    }
  }, [currentRiskAssessment, assessment]);

  // Trigger analysis when conversation ends and summary should be shown
  useEffect(() => {
    if (showSummary && !isConnected && messages.length > 0 && !webhookReceived && !assessment) {
      console.log('🏁 CONVERSATION ENDED - Starting EU AI Act post-conversation analysis...');
      
      // First, wait for potential webhook
      setWaitingForWebhook(true);
      
      // Wait 4 seconds for webhook, then perform local analysis
      const webhookTimeout = setTimeout(() => {
        if (!webhookReceived && !assessment) {
          console.log('⏰ No webhook received - performing local EU AI Act analysis...');
          performPostConversationAnalysis();
        }
      }, 4000);

      return () => clearTimeout(webhookTimeout);
    }
  }, [showSummary, isConnected, messages.length, webhookReceived, assessment]);

  // Listen for webhook analysis
  useEffect(() => {
    const handleWebhookAnalysis = (event: CustomEvent) => {
      console.log('🎯 WEBHOOK ANALYSIS RECEIVED - Using webhook data for summary');
      setWebhookReceived(true);
      setWaitingForWebhook(false);
      setAssessment(event.detail);
      onSummaryGenerated(event.detail);
    };

    window.addEventListener('riskDetected', handleWebhookAnalysis);
    window.addEventListener('newRiskAssessment', handleWebhookAnalysis);
    
    return () => {
      window.removeEventListener('riskDetected', handleWebhookAnalysis);
      window.removeEventListener('newRiskAssessment', handleWebhookAnalysis);
    };
  }, [onSummaryGenerated]);

  const performPostConversationAnalysis = async () => {
    if (messages.length === 0) return;

    setIsAnalyzing(true);
    setWaitingForWebhook(false);
    
    console.log('🇪🇺 EU AI ACT POST-CONVERSATION ANALYSIS - Starting comprehensive assessment...', {
      conversation_id: conversationId,
      message_count: messages.length,
      user_messages: messages.filter(m => m.sender === 'user').length,
      analysis_type: 'post_conversation_local'
    });

    try {
      // Extract conversation content
      const userMessages = messages.filter(m => m.sender === 'user');
      const userContent = userMessages.map(m => m.text.toLowerCase()).join(' ');
      const fullTranscript = messages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Agent'}: ${msg.text}`)
        .join('\n');

      // Perform EU AI Act risk analysis
      const riskAnalysis = analyzeEUAIActCompliance(userContent, messages);
      
      // Generate comprehensive summary
      const conversationSummary = generateEUComplianceSummary(messages, riskAnalysis);

      const finalAssessment: EUAIActAssessment = {
        ...riskAnalysis,
        conversation_summary: conversationSummary
      };

      console.log('🇪🇺 EU AI ACT POST-CONVERSATION ANALYSIS COMPLETE:', {
        risk_level: finalAssessment.risk_level,
        risk_score: finalAssessment.risk_score,
        eu_category: finalAssessment.eu_assessment.category,
        compliance_requirements: finalAssessment.eu_assessment.compliance_requirements.length,
        conversation_id: conversationId
      });

      // Store assessment in database
      await storePostConversationAssessment(finalAssessment);

      // Show summary and notify parent
      setAssessment(finalAssessment);
      onSummaryGenerated(finalAssessment);

    } catch (error) {
      console.error('❌ EU AI ACT POST-CONVERSATION ANALYSIS ERROR:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeEUAIActCompliance = (userContent: string, messages: Message[]) => {
    // Comprehensive EU AI Act keyword patterns
    const euRiskPatterns = {
      critical: {
        keywords: [
          'social scoring', 'social credit', 'citizen scoring', 'behavior scoring',
          'mass surveillance', 'indiscriminate surveillance', 'general surveillance',
          'real-time biometric', 'public biometric identification', 'facial recognition public',
          'subliminal techniques', 'manipulative ai', 'exploit vulnerabilities',
          'psychological manipulation', 'behavioral manipulation',
          'exploit children', 'manipulate elderly', 'target disabilities',
          'emotion recognition workplace', 'emotion detection school',
          'individual crime prediction', 'personal crime risk'
        ],
        weight: 100
      },
      high: {
        keywords: [
          'critical infrastructure', 'power grid', 'water supply', 'transportation safety',
          'educational assessment', 'student evaluation', 'academic scoring',
          'recruitment ai', 'hiring algorithm', 'cv screening', 'candidate assessment',
          'credit scoring', 'loan approval', 'financial assessment',
          'healthcare diagnosis', 'medical decision', 'treatment recommendation',
          'crime prediction', 'law enforcement ai', 'police algorithm',
          'border control', 'immigration assessment', 'asylum decision',
          'biometric identification', 'biometric verification', 'facial recognition'
        ],
        weight: 25
      },
      medium: {
        keywords: [
          'chatbot', 'virtual assistant', 'conversational ai',
          'deepfake', 'synthetic media', 'ai generated content',
          'content recommendation', 'product recommendation',
          'emotion recognition', 'emotion detection', 'sentiment analysis',
          'decision support', 'advisory system', 'recommendation engine'
        ],
        weight: 10
      },
      low: {
        keywords: [
          'spam filter', 'search algorithm', 'translation', 'language processing',
          'data analysis', 'pattern recognition', 'optimization',
          'game ai', 'entertainment ai', 'gaming algorithm',
          'text processing', 'document analysis', 'scheduling ai',
          'research ai', 'scientific analysis', 'data mining'
        ],
        weight: 2
      }
    };

    let totalScore = 5; // Base score
    let detectedLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
    const factors: Record<string, any> = {
      analysis_type: 'post_conversation_eu_ai_act',
      conversation_duration: messages.length > 0 ? 
        Math.round((messages[messages.length - 1].timestamp.getTime() - messages[0].timestamp.getTime()) / 1000) : 0,
      message_count: messages.length,
      user_message_count: messages.filter(m => m.sender === 'user').length,
      analyzed_at: new Date().toISOString(),
      eu_ai_act_version: '2024'
    };

    // Analyze each risk level
    for (const [level, config] of Object.entries(euRiskPatterns)) {
      const matchedKeywords = config.keywords.filter(keyword => userContent.includes(keyword));
      
      if (matchedKeywords.length > 0) {
        const levelScore = matchedKeywords.length * config.weight;
        totalScore += levelScore;
        factors[`${level}_keywords`] = matchedKeywords;
        factors[`${level}_score`] = levelScore;
        
        console.log(`🎯 EU AI ACT MATCH - ${level.toUpperCase()}:`, {
          matched: matchedKeywords,
          count: matchedKeywords.length,
          weight: config.weight,
          score_added: levelScore
        });
        
        switch (level) {
          case 'critical':
            detectedLevel = 'critical';
            break;
          case 'high':
            if (detectedLevel !== 'critical') detectedLevel = 'high';
            break;
          case 'medium':
            if (!['critical', 'high'].includes(detectedLevel)) detectedLevel = 'medium';
            break;
        }
      }
    }

    // Final score calculation
    const finalScore = Math.min(totalScore, 100);
    
    // Determine final risk level
    let finalLevel: 'critical' | 'high' | 'medium' | 'low' = detectedLevel;
    if (finalScore >= 90) finalLevel = 'critical';
    else if (finalScore >= 60) finalLevel = 'high';
    else if (finalScore >= 25) finalLevel = 'medium';
    else finalLevel = 'low';

    // Generate EU assessment
    const euAssessment = getEUAssessment(finalLevel, finalScore);

    return {
      risk_level: finalLevel,
      risk_score: finalScore,
      risk_factors: factors,
      eu_assessment: euAssessment
    };
  };

  const getEUAssessment = (level: string, score: number) => {
    const assessments = {
      critical: {
        category: 'critical',
        label: 'PROHIBITED',
        description: 'This AI system is prohibited under the EU AI Act and cannot be deployed',
        compliance_requirements: [
          'System deployment is PROHIBITED under EU AI Act',
          'Immediate cessation of development required',
          'No market access permitted in EU'
        ]
      },
      high: {
        category: 'high',
        label: 'HIGH-RISK',
        description: 'High-risk AI system requiring conformity assessment and strict compliance',
        compliance_requirements: [
          'Conformity assessment by notified body required',
          'CE marking mandatory before market placement',
          'Risk management system implementation',
          'High-quality training data requirements',
          'Human oversight implementation',
          'Post-market monitoring system'
        ]
      },
      medium: {
        category: 'medium',
        label: 'LIMITED RISK',
        description: 'Limited risk AI system requiring transparency obligations',
        compliance_requirements: [
          'Transparency obligations required',
          'Clear disclosure of AI system use',
          'User information requirements',
          'Basic technical documentation'
        ]
      },
      low: {
        category: 'low',
        label: 'MINIMAL RISK',
        description: 'Minimal risk AI system with no specific regulatory obligations',
        compliance_requirements: [
          'No specific EU AI Act obligations',
          'General product safety requirements apply',
          'Voluntary compliance with AI ethics guidelines'
        ]
      }
    };

    return assessments[level] || assessments.low;
  };

  const generateEUComplianceSummary = (messages: Message[], riskAnalysis: any): string => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const aiMessages = messages.filter(m => m.sender === 'ai');
    
    const categoryDescription = riskAnalysis.eu_assessment.description;
    
    let summary = `EU AI Act Assessment: ${categoryDescription}. `;
    
    if (userMessages.length > 0) {
      const mainTopics = userMessages
        .map(m => m.text)
        .join(' ')
        .toLowerCase();
      
      if (riskAnalysis.risk_level === 'critical') {
        summary += `The conversation revealed discussion of AI systems that are explicitly prohibited under EU AI Act Article 5. `;
      } else if (riskAnalysis.risk_level === 'high') {
        summary += `The conversation described AI systems that fall under high-risk categories requiring strict regulatory compliance. `;
      } else if (riskAnalysis.risk_level === 'medium') {
        summary += `The conversation involved AI systems with limited risk requiring transparency obligations. `;
      } else {
        summary += `The conversation described AI systems with minimal regulatory requirements. `;
      }
    }
    
    summary += `Risk score: ${riskAnalysis.risk_score}/100. `;
    summary += `Compliance assessment completed based on ${messages.length} messages exchanged during the conversation.`;
    
    return summary;
  };

  const storePostConversationAssessment = async (assessment: EUAIActAssessment) => {
    if (!conversationId) return;

    try {
      console.log('💾 STORING POST-CONVERSATION ASSESSMENT...');
      
      const riskData = {
        conversation_id: conversationId,
        agent_id: 'elevenlabs_agent',
        user_id: null,
        risk_level: assessment.risk_level,
        risk_score: assessment.risk_score,
        risk_factors: {
          ...assessment.risk_factors,
          post_conversation_analysis: true,
          eu_assessment: assessment.eu_assessment,
          analysis_method: 'local_post_conversation'
        },
        conversation_summary: assessment.conversation_summary,
        detected_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('risk_assessments')
        .upsert(riskData, {
          onConflict: 'conversation_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ DATABASE ERROR:', error);
      } else {
        console.log('✅ POST-CONVERSATION ASSESSMENT STORED:', data[0]?.id);
      }
    } catch (error) {
      console.error('❌ STORAGE ERROR:', error);
    }
  };

  const getRiskIcon = () => {
    if (!assessment) return <Scale className="w-6 h-6 text-gray-500" />;
    
    switch (assessment.risk_level) {
      case 'critical':
        return <Ban className="w-6 h-6 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'medium':
        return <Shield className="w-6 h-6 text-yellow-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getRiskColor = () => {
    if (!assessment) return 'bg-gray-50 border-gray-200';
    
    switch (assessment.risk_level) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  if (!showSummary) return null;

  if (waitingForWebhook) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing EU AI Act Assessment</h3>
            <p className="text-sm text-gray-600">
              Analyzing conversation for EU AI Act compliance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <Scale className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing EU AI Act Compliance</h3>
            <p className="text-sm text-gray-600">
              Performing comprehensive risk assessment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for EU AI Act Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">
              No risk assessment data received yet. This could mean:
            </p>
            <ul className="text-sm text-gray-600 text-left space-y-1 mb-4">
              <li>• Webhook is still processing the conversation</li>
              <li>• ElevenLabs webhook is not configured</li>
              <li>• No EU AI Act keywords were detected</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => performPostConversationAnalysis()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Analyze Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 ${getRiskColor()}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getRiskIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">EU AI Act Assessment Complete</h2>
              <p className="text-sm text-gray-600">Conversation Risk Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Assessment Results */}
        <div className="p-6 space-y-6">
          {/* Risk Level */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
              assessment.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
              assessment.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
              assessment.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {getRiskIcon()}
              {assessment.eu_assessment.label}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {assessment.risk_score}/100
            </div>
            <p className="text-sm text-gray-600 mt-1">EU AI Act Risk Score</p>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Assessment Summary</h3>
            <p className="text-sm text-gray-700">{assessment.eu_assessment.description}</p>
          </div>

          {/* Compliance Requirements */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Compliance Requirements</h3>
            <ul className="space-y-2">
              {assessment.eu_assessment.compliance_requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conversation Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Conversation Analysis</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">{assessment.conversation_summary}</p>
            </div>
          </div>

          {/* Risk Factors */}
          {Object.keys(assessment.risk_factors).filter(key => key.includes('_keywords')).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Detected Risk Factors</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(assessment.risk_factors)
                  .filter(([key]) => key.includes('_keywords'))
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded p-3">
                      <div className="text-xs font-medium text-gray-600 uppercase mb-1">
                        {key.replace('_keywords', '').replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-800">
                        {Array.isArray(value) ? value.length : 0} matches
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Conversation Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{assessment.risk_factors.message_count || 0}</div>
              <div className="text-xs text-gray-600">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{assessment.risk_factors.user_message_count || 0}</div>
              <div className="text-xs text-gray-600">User Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {Math.round((assessment.risk_factors.conversation_duration || 0) / 60)}m
              </div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Analysis completed at {new Date().toLocaleString()}
            </div>
            <div className="flex gap-3">
              <a
                href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32024R1689"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                EU AI Act
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};