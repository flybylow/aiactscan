import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RiskIndicator } from './RiskIndicator';
import { DashboardUpdateIndicator } from './DashboardUpdateIndicator';
import { Shield, TrendingUp, AlertCircle, Clock, Filter, RefreshCw, Scale, FileText, MessageSquare, AlertTriangle as ReasonIcon } from 'lucide-react';

interface RiskAssessment {
  id: string;
  conversation_id: string;
  agent_id: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  risk_score: number;
  risk_factors: Record<string, any>;
  conversation_summary: string;
  detected_at: string;
  created_at: string;
}

interface RiskDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isUpdating?: boolean;
  lastUpdated?: Date;
  newItemsCount?: number;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({ 
  isOpen, 
  onClose,
  isUpdating = false,
  lastUpdated,
  newItemsCount = 0
}) => {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRiskAssessments();
    }
  }, [isOpen, filter]);

  // Set up real-time subscription when dashboard is open
  useEffect(() => {
    if (!isOpen) return;

    const subscription = supabase
      .channel('dashboard_risk_assessments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'risk_assessments'
        },
        (payload) => {
          console.log('Dashboard: Risk assessment change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newAssessment = payload.new as RiskAssessment;
            setRiskAssessments(prev => {
              // Keep only the latest assessment (remove older ones)
              return [newAssessment];
            });
          } else if (payload.eventType === 'UPDATE') {
            setRiskAssessments(prev => 
              prev.map(assessment => 
                assessment.id === payload.new.id 
                  ? payload.new as RiskAssessment 
                  : assessment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRiskAssessments(prev => 
              prev.filter(assessment => assessment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen]);

  const fetchRiskAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only the most recent assessment
      let query = supabase
        .from('risk_assessments')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(1); // Only get the latest one

      if (filter !== 'all') {
        query = query.eq('risk_level', filter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setRiskAssessments(data || []);
    } catch (err) {
      console.error('Error fetching risk assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch risk assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRiskAssessments();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getRiskStats = () => {
    const latest = riskAssessments[0];
    if (!latest) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        averageScore: 0
      };
    }

    return {
      total: 1,
      critical: latest.risk_level === 'critical' ? 1 : 0,
      high: latest.risk_level === 'high' ? 1 : 0,
      medium: latest.risk_level === 'medium' ? 1 : 0,
      low: latest.risk_level === 'low' ? 1 : 0,
      averageScore: latest.risk_score
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEUComplianceInfo = (assessment: RiskAssessment) => {
    const euAssessment = assessment.risk_factors?.eu_assessment;
    if (!euAssessment) return null;

    return {
      category: euAssessment.category,
      label: euAssessment.label,
      description: euAssessment.description,
      requirements: euAssessment.compliance_requirements || []
    };
  };

  const getConversationMessages = (assessment: RiskAssessment) => {
    // Extract messages from risk factors if available
    const transcript = assessment.risk_factors?.elevenlabs_analysis?.transcript;
    if (transcript && transcript.messages) {
      return transcript.messages.filter(msg => msg.role === 'user').slice(0, 3); // Show first 3 user messages
    }
    return [];
  };

  const getRiskReasons = (assessment: RiskAssessment) => {
    const reasons = [];
    
    // Extract keyword matches
    if (assessment.risk_factors?.critical_keywords?.length > 0) {
      reasons.push({
        type: 'PROHIBITED Keywords',
        items: assessment.risk_factors.critical_keywords,
        severity: 'critical'
      });
    }
    
    if (assessment.risk_factors?.high_keywords?.length > 0) {
      reasons.push({
        type: 'High-Risk Keywords',
        items: assessment.risk_factors.high_keywords,
        severity: 'high'
      });
    }
    
    if (assessment.risk_factors?.medium_keywords?.length > 0) {
      reasons.push({
        type: 'Limited Risk Keywords',
        items: assessment.risk_factors.medium_keywords,
        severity: 'medium'
      });
    }

    // Add other risk factors
    if (assessment.risk_factors?.social_engineering?.length > 0) {
      reasons.push({
        type: 'Social Engineering',
        items: assessment.risk_factors.social_engineering,
        severity: 'high'
      });
    }

    if (assessment.risk_factors?.urgency_indicators?.length > 0) {
      reasons.push({
        type: 'Urgency Tactics',
        items: assessment.risk_factors.urgency_indicators,
        severity: 'medium'
      });
    }

    return reasons;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  const stats = getRiskStats();
  const latestAssessment = riskAssessments[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">EU AI Act Risk Assessment Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Update Indicator */}
        <div className="flex-shrink-0 px-6 py-2 bg-blue-50 border-b border-blue-200">
          <DashboardUpdateIndicator 
            isUpdating={isUpdating}
            lastUpdated={lastUpdated}
            newItemsCount={newItemsCount}
          />
        </div>

        {/* Latest Assessment Overview - Fixed */}
        {latestAssessment && (
          <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Latest Assessment</h3>
              <div className="text-sm text-gray-600">
                {formatDate(latestAssessment.detected_at)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Level */}
              <div className="text-center">
                <RiskIndicator 
                  riskLevel={latestAssessment.risk_level}
                  riskScore={latestAssessment.risk_score}
                />
                <div className="mt-2 text-2xl font-bold text-gray-900">{latestAssessment.risk_score}/100</div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>

              {/* EU AI Act Category */}
              <div className="text-center">
                {(() => {
                  const euInfo = getEUComplianceInfo(latestAssessment);
                  return euInfo ? (
                    <>
                      <div className="text-2xl font-bold text-blue-600">{euInfo.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{euInfo.description}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-400">N/A</div>
                      <div className="text-sm text-gray-600">EU AI Act Category</div>
                    </>
                  );
                })()}
              </div>

              {/* Conversation Duration */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((latestAssessment.risk_factors?.conversation_duration || 0) / 60)}m
                </div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-xs text-gray-500 mt-1">
                  {latestAssessment.risk_factors?.message_count || 0} messages
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Details - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Error loading risk assessments</p>
                  <p className="text-sm text-gray-600 mt-1">{error}</p>
                  <button
                    onClick={fetchRiskAssessments}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : !latestAssessment ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No EU AI Act assessments found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Risk assessments will appear here when conversations are analyzed
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Conversation Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Conversation Summary</h3>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {latestAssessment.conversation_summary}
                    </p>
                  </div>

                  {/* Key Messages */}
                  {(() => {
                    const messages = getConversationMessages(latestAssessment);
                    return messages.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Key User Messages:</h4>
                        <div className="space-y-2">
                          {messages.map((message, index) => (
                            <div key={index} className="bg-gray-50 rounded p-3 border-l-4 border-blue-500">
                              <p className="text-sm text-gray-700">"{message.content}"</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Risk Reasons */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <ReasonIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Risk Assessment Reasons</h3>
                  </div>
                  
                  {(() => {
                    const reasons = getRiskReasons(latestAssessment);
                    return reasons.length > 0 ? (
                      <div className="space-y-4">
                        {reasons.map((reason, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(reason.severity)}`}>
                                {reason.type}
                              </span>
                              <span className="text-sm text-gray-600">
                                {reason.items.length} detected
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {reason.items.map((item, itemIndex) => (
                                <span
                                  key={itemIndex}
                                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                >
                                  "{item}"
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          <ReasonIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No specific risk factors detected</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* EU AI Act Compliance Requirements */}
                {(() => {
                  const euInfo = getEUComplianceInfo(latestAssessment);
                  return euInfo && euInfo.requirements.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Scale className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">EU AI Act Compliance Requirements</h3>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {euInfo.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-purple-800">
                              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}

                {/* Technical Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Conversation ID</div>
                      <div className="text-gray-600 font-mono text-xs">
                        {latestAssessment.conversation_id.slice(0, 12)}...
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Agent ID</div>
                      <div className="text-gray-600 font-mono text-xs">
                        {latestAssessment.agent_id}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Analysis Type</div>
                      <div className="text-gray-600 text-xs">
                        {latestAssessment.risk_factors?.analysis_type || 'EU AI Act Compliance'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Detected At</div>
                      <div className="text-gray-600 text-xs">
                        {formatDate(latestAssessment.detected_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};