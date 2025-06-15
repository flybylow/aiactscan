import { createClient } from 'npm:@supabase/supabase-js@2';
import { 
  RISK_PATTERNS, 
  SOCIAL_ENGINEERING_PATTERNS,
  URGENCY_INDICATORS,
  INFORMATION_EXTRACTION_PATTERNS,
  RISK_SCORING_CONFIG,
  getEUComplianceSummary,
  getEURiskCategory
} from './risk-keywords.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, elevenlabs-signature, x-elevenlabs-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

interface ElevenLabsPostCallWebhookPayload {
  event_type: string;
  conversation_id: string;
  agent_id: string;
  user_id?: string;
  call_data: {
    conversation_id: string;
    start_time: string;
    end_time: string;
    duration_seconds: number;
    transcript: {
      messages: Array<{
        role: 'user' | 'agent';
        content: string;
        timestamp: string;
      }>;
      full_transcript: string;
    };
    analysis?: {
      summary: string;
      sentiment: string;
      topics: string[];
      risk_assessment?: {
        level: 'critical' | 'high' | 'medium' | 'low';
        score: number;
        factors: string[];
        confidence: number;
      };
      custom_analysis?: Record<string, any>;
    };
    metadata: Record<string, any>;
  };
  timestamp: string;
}

// Function to verify webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // ElevenLabs uses HMAC-SHA256 for webhook signatures
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    // Convert to hex string
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures (remove 'sha256=' prefix if present)
    const receivedSignature = signature.replace(/^sha256=/, '');
    
    console.log('🔐 EU AI ACT - Signature verification:', {
      received: receivedSignature.slice(0, 16) + '...',
      expected: expectedSignature.slice(0, 16) + '...',
      match: receivedSignature === expectedSignature
    });

    return receivedSignature === expectedSignature;
  } catch (error) {
    console.error('❌ EU AI ACT - Signature verification error:', error);
    return false;
  }
}

// Enhanced EU AI Act risk analysis
function analyzeEUAIActRisk(callData: any): {
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  risk_score: number;
  risk_factors: Record<string, any>;
  eu_assessment: {
    category: string;
    label: string;
    description: string;
    compliance_requirements: string[];
  };
} {
  console.log('🇪🇺 EU AI ACT ANALYSIS - Starting comprehensive risk assessment...');
  console.log('📊 EU COMPLIANCE CONFIG - Using EU AI Act configuration:', getEUComplianceSummary());
  
  const transcript = callData.transcript?.full_transcript?.toLowerCase() || '';
  const messages = callData.transcript?.messages || [];
  const userMessages = messages.filter(m => m.role === 'user');
  
  let totalScore = RISK_SCORING_CONFIG.BASE_SCORE;
  let detectedLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  const factors: Record<string, any> = {
    analysis_type: 'eu_ai_act_compliance',
    conversation_duration: callData.duration_seconds,
    message_count: messages.length,
    user_message_count: userMessages.length,
    analyzed_at: new Date().toISOString(),
    eu_ai_act_version: '2024',
    assessment_framework: 'EU AI Act Risk Categorization'
  };

  // Analyze EU AI Act risk keywords
  for (const [level, config] of Object.entries(RISK_PATTERNS)) {
    const matchedKeywords = config.keywords.filter(keyword => transcript.includes(keyword));
    
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
          console.log('🚫 EU AI ACT PROHIBITED - Prohibited AI system detected:', matchedKeywords);
          break;
        case 'high':
          if (detectedLevel !== 'critical') detectedLevel = 'high';
          console.log('⚠️ EU AI ACT HIGH-RISK - High-risk AI system detected:', matchedKeywords);
          break;
        case 'medium':
          if (!['critical', 'high'].includes(detectedLevel)) detectedLevel = 'medium';
          console.log('📋 EU AI ACT LIMITED - Limited risk AI system detected:', matchedKeywords);
          break;
      }
    }
  }

  // Final score calculation (capped at 100)
  const finalScore = Math.min(totalScore, 100);
  
  // Get EU AI Act risk category
  const euRiskCategory = getEURiskCategory(finalScore);
  
  // Use the higher of keyword-based or score-based level
  const levels = ['low', 'medium', 'high', 'critical'];
  const keywordLevelIndex = levels.indexOf(detectedLevel);
  const scoreLevelIndex = levels.indexOf(euRiskCategory.category);
  const finalLevelIndex = Math.max(keywordLevelIndex, scoreLevelIndex);
  
  const finalLevel = levels[finalLevelIndex] as 'critical' | 'high' | 'medium' | 'low';
  
  // Determine compliance requirements
  const complianceRequirements = [];
  switch (finalLevel) {
    case 'critical':
      complianceRequirements.push(
        'System deployment is PROHIBITED under EU AI Act',
        'Immediate cessation of development required',
        'No market access permitted in EU'
      );
      break;
    case 'high':
      complianceRequirements.push(
        'Conformity assessment by notified body required',
        'CE marking mandatory before market placement',
        'Risk management system implementation',
        'High-quality training data requirements',
        'Technical documentation maintenance',
        'Human oversight implementation',
        'Post-market monitoring system'
      );
      break;
    case 'medium':
      complianceRequirements.push(
        'Transparency obligations required',
        'Clear disclosure of AI system use',
        'User information requirements',
        'Basic technical documentation'
      );
      break;
    case 'low':
      complianceRequirements.push(
        'No specific EU AI Act obligations',
        'General product safety requirements apply',
        'Voluntary compliance with AI ethics guidelines'
      );
      break;
  }

  const result = {
    risk_level: finalLevel,
    risk_score: finalScore,
    risk_factors: factors,
    eu_assessment: {
      category: euRiskCategory.category,
      label: euRiskCategory.label,
      description: euRiskCategory.description,
      compliance_requirements: complianceRequirements
    }
  };

  console.log('🇪🇺 EU AI ACT ANALYSIS COMPLETE:', {
    level: result.risk_level,
    score: result.risk_score,
    category: result.eu_assessment.category,
    label: result.eu_assessment.label,
    factors: Object.keys(result.risk_factors),
    transcript_length: transcript.length,
    message_count: messages.length,
    keyword_matches: {
      critical: factors.critical_keywords?.length || 0,
      high: factors.high_keywords?.length || 0,
      medium: factors.medium_keywords?.length || 0,
      low: factors.low_keywords?.length || 0
    },
    compliance_requirements_count: complianceRequirements.length
  });

  return result;
}

Deno.serve(async (req: Request) => {
  console.log('🇪🇺 EU AI ACT WEBHOOK REQUEST:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ EU AI ACT CORS preflight request handled');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    console.log('❌ EU AI ACT Method not allowed:', req.method);
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 405, 
        headers: corsHeaders
      }
    );
  }

  try {
    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('❌ EU AI ACT ELEVENLABS_WEBHOOK_SECRET environment variable not set');
      return new Response(
        JSON.stringify({ 
          error: 'Webhook secret not configured',
          message: 'ELEVENLABS_WEBHOOK_SECRET environment variable is required',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: corsHeaders
        }
      );
    }

    // Get the signature from headers
    const signature = req.headers.get('elevenlabs-signature') || 
                     req.headers.get('ElevenLabs-Signature') ||
                     req.headers.get('x-elevenlabs-signature') ||
                     req.headers.get('X-ElevenLabs-Signature');
    
    if (!signature) {
      console.error('❌ EU AI ACT Missing ElevenLabs signature header');
      console.log('Available headers:', Object.fromEntries(req.headers.entries()));
      return new Response(
        JSON.stringify({ 
          error: 'Missing signature header',
          message: 'ElevenLabs signature header is required for webhook verification',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 401, 
          headers: corsHeaders
        }
      );
    }

    // Get the raw payload for signature verification
    const rawPayload = await req.text();
    console.log('📦 EU AI ACT Raw payload received:', rawPayload.slice(0, 200) + '...');
    
    // Verify the webhook signature
    const isValidSignature = await verifyWebhookSignature(rawPayload, signature, webhookSecret);
    if (!isValidSignature) {
      console.error('❌ EU AI ACT Invalid webhook signature');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid signature',
          message: 'Webhook signature verification failed',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 401, 
          headers: corsHeaders
        }
      );
    }

    console.log('✅ EU AI ACT Webhook signature verified successfully');

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the webhook payload
    const payload: ElevenLabsPostCallWebhookPayload = JSON.parse(rawPayload);
    
    console.log('🎯 EU AI ACT WEBHOOK PAYLOAD PARSED:', {
      event_type: payload.event_type,
      conversation_id: payload.conversation_id,
      agent_id: payload.agent_id,
      duration: payload.call_data?.duration_seconds,
      message_count: payload.call_data?.transcript?.messages?.length,
      has_analysis: !!payload.call_data?.analysis,
      timestamp: payload.timestamp
    });

    // Process post-call analysis webhook for EU AI Act assessment
    if (payload.event_type === 'conversation.ended' || 
        payload.event_type === 'call.analysis_complete' ||
        payload.event_type === 'post_call_analysis' ||
        payload.call_data) {
      
      console.log('🇪🇺 EU AI ACT PROCESSING - Event contains call data for EU AI Act risk assessment');
      
      // Perform comprehensive EU AI Act risk analysis
      const euRiskAnalysis = analyzeEUAIActRisk(payload.call_data);
      
      // Prepare EU AI Act risk assessment data
      const riskData = {
        conversation_id: payload.conversation_id,
        agent_id: payload.agent_id,
        user_id: payload.user_id || null,
        risk_level: euRiskAnalysis.risk_level,
        risk_score: euRiskAnalysis.risk_score,
        risk_factors: {
          ...euRiskAnalysis.risk_factors,
          eu_ai_act_analysis: true,
          eu_assessment: euRiskAnalysis.eu_assessment,
          conversation_duration: payload.call_data?.duration_seconds,
          full_transcript_analyzed: true,
          elevenlabs_analysis: payload.call_data?.analysis || null,
          eu_compliance_summary: getEUComplianceSummary()
        },
        conversation_summary: `EU AI Act Assessment: ${euRiskAnalysis.eu_assessment.label} - ${euRiskAnalysis.eu_assessment.description}. ${payload.call_data?.analysis?.summary || 'Comprehensive risk analysis completed based on conversation content.'}`,
        detected_at: payload.timestamp
      };

      console.log('💾 EU AI ACT DATABASE - Saving comprehensive EU AI Act risk assessment...');
      
      // Use upsert to handle potential duplicates
      const { data, error } = await supabase
        .from('risk_assessments')
        .upsert(riskData, {
          onConflict: 'conversation_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ EU AI ACT DATABASE ERROR:', error);
        // Still return 200 to prevent webhook retries for database issues
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Database error',
            message: 'Failed to store EU AI Act risk assessment',
            details: error.message,
            webhook_processed: true,
            timestamp: new Date().toISOString()
          }),
          { 
            status: 200, // Return 200 to prevent ElevenLabs from retrying
            headers: corsHeaders
          }
        );
      }

      console.log('✅ EU AI ACT DATABASE SUCCESS - Risk assessment stored:', {
        id: data[0]?.id,
        risk_level: riskData.risk_level,
        risk_score: riskData.risk_score,
        eu_category: euRiskAnalysis.eu_assessment.category,
        eu_label: euRiskAnalysis.eu_assessment.label,
        conversation_id: riskData.conversation_id,
        duration: payload.call_data?.duration_seconds,
        analysis_type: 'eu_ai_act_compliance',
        keyword_matches: {
          critical: riskData.risk_factors.critical_keywords?.length || 0,
          high: riskData.risk_factors.high_keywords?.length || 0,
          medium: riskData.risk_factors.medium_keywords?.length || 0,
          low: riskData.risk_factors.low_keywords?.length || 0
        },
        compliance_requirements: euRiskAnalysis.eu_assessment.compliance_requirements.length
      });

      // Trigger alerts for prohibited and high-risk AI systems
      if (riskData.risk_level === 'critical' || riskData.risk_level === 'high') {
        console.log(`🚨🇪🇺 EU AI ACT HIGH RISK ALERT 🇪🇺🚨`);
        console.log(`EU AI Act Category: ${euRiskAnalysis.eu_assessment.label}`);
        console.log(`Risk Level: ${riskData.risk_level.toUpperCase()}`);
        console.log(`Risk Score: ${riskData.risk_score}/100`);
        console.log(`Conversation ID: ${riskData.conversation_id}`);
        console.log(`Agent ID: ${riskData.agent_id}`);
        console.log(`Duration: ${payload.call_data?.duration_seconds}s`);
        console.log(`Message Count: ${payload.call_data?.transcript?.messages?.length}`);
        console.log(`EU AI Act Assessment: ${euRiskAnalysis.eu_assessment.description}`);
        console.log(`Compliance Requirements:`, euRiskAnalysis.eu_assessment.compliance_requirements);
        console.log(`Keyword Matches:`, {
          critical: riskData.risk_factors.critical_keywords?.length || 0,
          high: riskData.risk_factors.high_keywords?.length || 0,
          medium: riskData.risk_factors.medium_keywords?.length || 0,
          low: riskData.risk_factors.low_keywords?.length || 0
        });
        console.log(`Risk Factors:`, Object.keys(riskData.risk_factors));
        console.log(`Summary: ${riskData.conversation_summary.slice(0, 200)}...`);
        console.log(`🚨🇪🇺 END EU AI ACT ALERT 🇪🇺🚨`);
      }

      // CRITICAL: Return 200 status code for successful processing
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'EU AI Act risk assessment processed successfully',
          data: {
            risk_level: riskData.risk_level,
            risk_score: riskData.risk_score,
            eu_assessment: euRiskAnalysis.eu_assessment,
            conversation_id: riskData.conversation_id,
            event_type: payload.event_type,
            analysis_type: 'eu_ai_act_compliance',
            duration_seconds: payload.call_data?.duration_seconds,
            message_count: payload.call_data?.transcript?.messages?.length,
            keyword_matches: {
              critical: riskData.risk_factors.critical_keywords?.length || 0,
              high: riskData.risk_factors.high_keywords?.length || 0,
              medium: riskData.risk_factors.medium_keywords?.length || 0,
              low: riskData.risk_factors.low_keywords?.length || 0
            },
            compliance_requirements: euRiskAnalysis.eu_assessment.compliance_requirements,
            processed_at: new Date().toISOString(),
            signature_verified: true,
            eu_ai_act_version: '2024'
          }
        }),
        { 
          status: 200, // CRITICAL: Must return 200 for ElevenLabs to consider it successful
          headers: corsHeaders
        }
      );
    }

    // For other event types, acknowledge receipt with 200 status
    console.log('ℹ️ EU AI ACT INFO - Event acknowledged but not processed:', payload.event_type);
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook received and acknowledged',
        data: {
          event_type: payload.event_type,
          conversation_id: payload.conversation_id,
          processed: false,
          reason: 'Event type not configured for EU AI Act risk analysis',
          signature_verified: true,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200, // CRITICAL: Always return 200 for successful webhook receipt
        headers: corsHeaders
      }
    );

  } catch (error) {
    console.error('💥 EU AI ACT WEBHOOK ERROR - Processing failed:', error);
    
    // CRITICAL: Return 200 even for errors to prevent ElevenLabs from retrying
    // Log the error but don't fail the webhook
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal processing error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        webhook_received: true,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, // Return 200 to prevent retries for processing errors
        headers: corsHeaders
      }
    );
  }
});