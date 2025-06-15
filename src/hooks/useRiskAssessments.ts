import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

export const useRiskAssessments = () => {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newItemsCount, setNewItemsCount] = useState(0);

  const fetchRiskAssessments = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('risk_assessments')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      setRiskAssessments(data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching risk assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch risk assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  const getLatestRiskAssessment = () => {
    return riskAssessments.length > 0 ? riskAssessments[0] : null;
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

  // Set up real-time subscription for new risk assessments
  useEffect(() => {
    console.log('🔌 Setting up real-time webhook subscription for EU AI Act risk assessments...');
    
    const subscription = supabase
      .channel('eu_risk_assessments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'risk_assessments'
        },
        (payload) => {
          console.log('🇪🇺 EU AI ACT WEBHOOK TRIGGERED - Database change detected:', {
            eventType: payload.eventType,
            timestamp: new Date().toISOString(),
            payload: payload
          });
          
          setIsUpdating(true);
          
          if (payload.eventType === 'INSERT') {
            const newAssessment = payload.new as RiskAssessment;
            
            console.log('🚨 EU AI ACT WEBHOOK DATA - New risk assessment from ElevenLabs:', {
              id: newAssessment.id,
              risk_level: newAssessment.risk_level,
              risk_score: newAssessment.risk_score,
              conversation_id: newAssessment.conversation_id,
              agent_id: newAssessment.agent_id,
              risk_factors: newAssessment.risk_factors,
              detected_at: newAssessment.detected_at,
              summary: newAssessment.conversation_summary?.slice(0, 100) + '...',
              eu_assessment: newAssessment.risk_factors?.eu_assessment
            });

            setRiskAssessments(prev => {
              // Check if this assessment already exists to avoid duplicates
              const exists = prev.some(assessment => assessment.id === newAssessment.id);
              if (exists) {
                console.log('⚠️ EU AI ACT WEBHOOK - Assessment already exists, skipping duplicate');
                return prev;
              }
              
              console.log('✅ EU AI ACT WEBHOOK - Adding new assessment to state');
              setNewItemsCount(1);
              return [newAssessment, ...prev];
            });
            
            // Trigger notification for prohibited and high-risk AI systems
            if (['critical', 'high'].includes(newAssessment.risk_level)) {
              console.log(`🚨 EU AI ACT WEBHOOK ALERT - ${newAssessment.risk_level.toUpperCase()} RISK DETECTED!`, {
                score: newAssessment.risk_score,
                factors: Object.keys(newAssessment.risk_factors || {}),
                conversation: newAssessment.conversation_id,
                eu_category: newAssessment.risk_factors?.eu_assessment?.category,
                eu_label: newAssessment.risk_factors?.eu_assessment?.label
              });
              
              // Dispatch event for risk detection
              window.dispatchEvent(new CustomEvent('riskDetected', {
                detail: newAssessment
              }));
            } else {
              console.log('ℹ️ EU AI ACT WEBHOOK - Limited/minimal risk assessment, no alert needed');
            }

            // Dispatch event for new risk assessment (for App component to update status)
            console.log('📡 EU AI ACT WEBHOOK - Dispatching newRiskAssessment event for UI update');
            window.dispatchEvent(new CustomEvent('newRiskAssessment', {
              detail: newAssessment
            }));
            
          } else if (payload.eventType === 'UPDATE') {
            console.log('🔄 EU AI ACT WEBHOOK - Risk assessment updated:', payload.new.id);
            setRiskAssessments(prev => 
              prev.map(assessment => 
                assessment.id === payload.new.id 
                  ? payload.new as RiskAssessment 
                  : assessment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ EU AI ACT WEBHOOK - Risk assessment deleted:', payload.old.id);
            setRiskAssessments(prev => 
              prev.filter(assessment => assessment.id !== payload.old.id)
            );
          }

          setLastUpdated(new Date());
          setTimeout(() => {
            setIsUpdating(false);
            console.log('✨ EU AI ACT WEBHOOK - UI update complete');
          }, 1000);
        }
      )
      .subscribe((status) => {
        console.log('📡 EU AI Act webhook subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up EU AI Act webhook subscription...');
      subscription.unsubscribe();
    };
  }, []);

  // Reset new items count after a delay
  useEffect(() => {
    if (newItemsCount > 0) {
      const timer = setTimeout(() => {
        console.log('🔄 Resetting new items count');
        setNewItemsCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newItemsCount]);

  return {
    riskAssessments,
    loading,
    error,
    isUpdating,
    lastUpdated,
    newItemsCount,
    fetchRiskAssessments,
    getLatestRiskAssessment,
    getRiskStats
  };
};