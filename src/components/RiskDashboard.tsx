import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RiskIndicator } from './RiskIndicator';
import { DashboardUpdateIndicator } from './DashboardUpdateIndicator';
import { Shield, TrendingUp, AlertCircle, Clock, Filter, RefreshCw, Scale, FileText, MessageSquare, AlertTriangle as ReasonIcon, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);

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
              // Check if this assessment already exists
              const exists = prev.some(assessment => assessment.id === newAssessment.id);
              if (exists) return prev;
              
              // Add to the beginning of the list
              return [newAssessment, ...prev];
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

      // Fetch all assessments, not just the latest one
      let query = supabase
        .from('risk_assessments')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(50); // Show up to 50 assessments

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
    const stats = {
      total: riskAssessments.length,
      critical: riskAssessments.filter(r => r.risk_level === 'critical').length,
      high: riskAssessments.filter(r => r.risk_level === 'high').length,
      medium: riskAssessments.filter(r => r.risk_level === 'medium').length,
      low: riskAssessments.filter(r => r.risk_level === 'low').length,
    };

    const averageScore = riskAssessments.length > 0 
      ? Math.round(riskAssessments.reduce((sum, r) => sum + r.risk_score, 0) / riskAssessments.length)
      : 0;

    return { ...stats, averageScore };
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

  const toggleExpanded = (assessmentId: string) => {
    setExpandedAssessment(expandedAssessment === assessmentId ? null : assessmentId);
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

        {/* EU AI Act Stats Overview - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
              <div className="text-sm text-gray-600">Prohibited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-sm text-gray-600">High-Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-sm text-gray-600">Limited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.low}</div>
              <div className="text-sm text-gray-600">Minimal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.averageScore}</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Filter Controls - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">EU AI Act Category:</span>
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level as any)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${filter === level 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {level === 'all' ? 'All' : 
                   level === 'critical' ? 'Prohibited' :
                   level === 'high' ? 'High-Risk' :
                   level === 'medium' ? 'Limited' :
                   'Minimal'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Assessments List - Scrollable */}
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
            ) : riskAssessments.length === 0 ? (
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assessment History ({riskAssessments.length} total)
                </h3>
                
                {riskAssessments.map((assessment, index) => {
                  const euInfo = getEUComplianceInfo(assessment);
                  const isExpanded = expandedAssessment === assessment.id;
                  const isLatest = index === 0;
                  
                  return (
                    <div
                      key={assessment.id}
                      className={`
                        bg-white border border-gray-200 rounded-lg transition-all duration-200
                        ${isLatest && newItemsCount > 0 ? 'ring-2 ring-green-500 ring-opacity-50 animate-pulse' : ''}
                        ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}
                      `}
                    >
                      {/* Assessment Header - Always Visible */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <RiskIndicator 
                              riskLevel={assessment.risk_level} 
                              riskScore={assessment.risk_score}
                            />
                            {isLatest && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500 font-mono">
                              {formatDate(assessment.detected_at)}
                            </div>
                            <button
                              onClick={() => toggleExpanded(assessment.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* EU AI Act Assessment Info */}
                        {euInfo && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Scale className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">EU AI Act Assessment</span>
                            </div>
                            <div className="text-sm text-blue-800">
                              <div className="font-medium">{euInfo.label}</div>
                              <div className="text-xs mt-1">{euInfo.description}</div>
                            </div>
                          </div>
                        )}

                        {/* Conversation Summary Preview */}
                        {assessment.conversation_summary && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {assessment.conversation_summary}
                            </p>
                          </div>
                        )}

                        {/* Basic Stats */}
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Duration:</span> {Math.round((assessment.risk_factors?.conversation_duration || 0) / 60)}m
                          </div>
                          <div>
                            <span className="font-medium">Messages:</span> {assessment.risk_factors?.message_count || 0}
                          </div>
                          <div>
                            <span className="font-medium">ID:</span> {assessment.conversation_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 space-y-4">
                          {/* Risk Reasons */}
                          {(() => {
                            const reasons = getRiskReasons(assessment);
                            return reasons.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <ReasonIcon className="w-4 h-4 text-orange-600" />
                                  Risk Assessment Reasons
                                </h4>
                                <div className="space-y-3">
                                  {reasons.map((reason, reasonIndex) => (
                                    <div key={reasonIndex} className="border border-gray-200 rounded p-3">
                                      <div className="flex items-center gap-2 mb-2">
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
                                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                          >
                                            "{item}"
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* EU AI Act Compliance Requirements */}
                          {(() => {
                            const euInfo = getEUComplianceInfo(assessment);
                            return euInfo && euInfo.requirements.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-purple-600" />
                                  EU AI Act Compliance Requirements
                                </h4>
                                <div className="bg-purple-50 rounded-lg p-3">
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
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Technical Details</h4>
                            <div className="bg-gray-50 rounded p-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Conversation ID:</span>
                                  <div className="text-gray-600 font-mono text-xs">{assessment.conversation_id}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Agent ID:</span>
                                  <div className="text-gray-600 font-mono text-xs">{assessment.agent_id}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Analysis Type:</span>
                                  <div className="text-gray-600 text-xs">{assessment.risk_factors?.analysis_type || 'EU AI Act Compliance'}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Detected At:</span>
                                  <div className="text-gray-600 text-xs">{formatDate(assessment.detected_at)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};