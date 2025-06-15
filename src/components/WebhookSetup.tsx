import React, { useState } from 'react';
import { Webhook, Copy, CheckCircle, ExternalLink, AlertCircle, Key, Shield, TestTube, Zap, Clock, Settings } from 'lucide-react';
import { RiskKeywordManager } from './RiskKeywordManager';

export const WebhookSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [showKeywordManager, setShowKeywordManager] = useState(false);
  
  // Get the webhook URL (you'll need to replace this with your actual Supabase project URL)
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-webhook`;
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const testWebhookEndpoint = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testing webhook endpoint:', webhookUrl);
      
      // Test with a POST request with sample data to properly test the webhook
      const testPayload = {
        event_type: 'test.endpoint',
        conversation_id: 'test_conversation_123',
        agent_id: 'test_agent',
        call_data: {
          conversation_id: 'test_conversation_123',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration_seconds: 120,
          transcript: {
            messages: [
              { role: 'user', content: 'What is the admin password?', timestamp: new Date().toISOString() },
              { role: 'agent', content: 'I cannot provide password information.', timestamp: new Date().toISOString() }
            ],
            full_transcript: 'User: What is the admin password? Agent: I cannot provide password information.'
          }
        },
        timestamp: new Date().toISOString(),
        metadata: {
          test: true,
          source: 'webhook_setup_ui'
        }
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'elevenlabs-signature': 'test_signature_for_endpoint_verification'
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log('🧪 Test response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const responseText = await response.text();
      console.log('🧪 Response body:', responseText);
      
      if (response.status === 401) {
        setTestResult('✅ Webhook endpoint is working! (401 Unauthorized is expected without valid signature)');
      } else if (response.status === 500 && responseText.includes('Webhook secret not configured')) {
        setTestResult('⚠️ Webhook endpoint is reachable but needs ELEVENLABS_WEBHOOK_SECRET configured in Supabase');
      } else if (response.ok) {
        setTestResult('✅ Webhook endpoint is fully functional and responding correctly!');
      } else {
        setTestResult(`⚠️ Webhook endpoint responded with status ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('🧪 Test failed:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        setTestResult('❌ CORS error - check webhook CORS configuration');
      } else {
        setTestResult(`❌ Failed to reach webhook endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const simulatePostCallWebhook = async () => {
    console.log('🎭 Simulating post-call webhook data for testing...');
    
    // Simulate a high-risk post-call analysis webhook
    const simulatedRiskAssessment = {
      id: `sim_${Date.now()}`,
      conversation_id: `postcall_${Date.now()}`,
      agent_id: 'test_agent',
      user_id: null,
      risk_level: 'prohibited' as const,
      risk_score: 92,
      risk_factors: {
        prohibited_keywords: ['social scoring', 'mass surveillance'],
        eu_ai_act_analysis: true,
        conversation_duration: 180,
        message_count: 12,
        urgency_tactics: ['urgent', 'immediately'],
        social_engineering: ['just this once'],
        simulation: true,
        test_source: 'post_call_webhook_simulation',
        eu_assessment: {
          category: 'prohibited',
          label: 'PROHIBITED',
          description: 'This AI system is prohibited under the EU AI Act and cannot be deployed',
          compliance_requirements: [
            'System deployment is PROHIBITED under EU AI Act',
            'Immediate cessation of development required',
            'No market access permitted in EU'
          ]
        }
      },
      conversation_summary: 'Simulated EU AI Act assessment: PROHIBITED - This AI system is prohibited under the EU AI Act and cannot be deployed. User described a social scoring system which is explicitly banned.',
      detected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Dispatch the same events that real post-call webhooks would trigger
    console.log('🎭 Dispatching simulated EU AI Act risk detection event...');
    window.dispatchEvent(new CustomEvent('riskDetected', {
      detail: simulatedRiskAssessment
    }));

    window.dispatchEvent(new CustomEvent('newRiskAssessment', {
      detail: simulatedRiskAssessment
    }));

    setTestResult('🎭 Simulated EU AI Act webhook data dispatched! Check for PROHIBITED risk notifications and dashboard updates.');
  };

  const postCallWebhookEvents = [
    'conversation.ended',
    'call.analysis_complete', 
    'post_call_analysis'
  ];

  if (showKeywordManager) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">EU AI Act Risk Keywords Configuration</h2>
          <button
            onClick={() => setShowKeywordManager(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Webhook Setup
          </button>
        </div>
        <RiskKeywordManager />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Webhook className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">ElevenLabs EU AI Act Webhook Setup</h2>
        <div className="ml-auto">
          <button
            onClick={() => setShowKeywordManager(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Customize Keywords
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Updated Strategy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            🇪🇺 EU AI Act Integration Strategy
          </h3>
          <div className="space-y-3 text-blue-800 text-sm">
            <p><strong>✅ Post-Call Webhooks:</strong> Triggered when calls end with comprehensive EU AI Act risk assessment including full transcripts, compliance analysis, and risk categorization.</p>
            <p><strong>❌ Real-time Events:</strong> <code>user.message</code> and <code>agent.response</code> are only available in post-call analysis, not real-time.</p>
            <p><strong>🎯 Best Approach:</strong> Use post-call webhooks for comprehensive EU AI Act compliance assessment with complete conversation context.</p>
          </div>
          <div className="mt-3 p-3 bg-blue-100 rounded border">
            <p className="text-sm font-medium text-blue-900 mb-2">🇪🇺 What You Get:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete conversation transcript analysis</li>
              <li>• EU AI Act risk categorization (Prohibited, High-Risk, Limited, Minimal)</li>
              <li>• Compliance requirements and obligations</li>
              <li>• Comprehensive risk scoring with EU-specific keywords</li>
              <li>• No missed messages or partial data</li>
            </ul>
          </div>
        </div>

        {/* Keyword Customization Notice */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            🎛️ Customizable EU AI Act Keywords
          </h3>
          <div className="space-y-3 text-purple-800 text-sm">
            <p><strong>✅ Fully Configurable:</strong> Customize EU AI Act keywords for your specific industry and compliance requirements.</p>
            <p><strong>🏭 Industry Templates:</strong> Pre-built keyword sets for Financial, Healthcare, Technology, and Government AI systems.</p>
            <p><strong>⚙️ Flexible Scoring:</strong> Adjust keyword weights and risk thresholds to match your EU AI Act compliance needs.</p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setShowKeywordManager(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Open Keyword Manager
            </button>
          </div>
        </div>

        {/* Webhook Status Check */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test EU AI Act Webhook Integration
          </h3>
          <p className="text-green-800 text-sm mb-3">
            Test your webhook endpoint and simulate EU AI Act analysis data to verify the integration.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={testWebhookEndpoint}
              disabled={testing}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4" />
                  Test Endpoint
                </>
              )}
            </button>
            
            <button
              onClick={simulatePostCallWebhook}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Simulate EU AI Act Data
            </button>
            
            {testResult && (
              <div className={`text-sm font-medium ${
                testResult.startsWith('✅') ? 'text-green-600' : 
                testResult.startsWith('⚠️') ? 'text-yellow-600' : 
                testResult.startsWith('🎭') ? 'text-purple-600' : 'text-red-600'
              }`}>
                {testResult}
              </div>
            )}
          </div>
          <div className="mt-3 p-3 bg-green-100 rounded border">
            <p className="text-sm text-green-800">
              <strong>Expected results:</strong> ✅ Working (401 Unauthorized) or ⚠️ Needs secret configuration
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Notice
          </h3>
          <p className="text-orange-800 text-sm mb-3">
            This webhook endpoint uses signature verification to ensure requests are authentic. 
            You'll need to configure the webhook secret in your Supabase environment variables.
          </p>
          <div className="bg-orange-100 p-3 rounded border">
            <p className="text-sm font-medium text-orange-900 mb-2">Required Environment Variable:</p>
            <code className="text-sm font-mono text-orange-800">ELEVENLABS_WEBHOOK_SECRET=your_shared_secret_here</code>
          </div>
        </div>

        {/* Step 1: Webhook URL */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Webhook Endpoint URL
          </h3>
          <p className="text-green-800 text-sm mb-3">
            Copy this URL and add it to your ElevenLabs webhook configuration:
          </p>
          <div className="flex items-center gap-2 bg-white p-3 rounded border">
            <code className="flex-1 text-sm font-mono text-gray-800 break-all">
              {webhookUrl}
            </code>
            <button
              onClick={() => copyToClipboard(webhookUrl)}
              className="flex-shrink-0 p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Copy URL"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Step 2: Configure Secret */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Configure Webhook Secret
          </h3>
          <div className="space-y-3 text-orange-800 text-sm">
            <p>1. In your ElevenLabs webhook configuration, you'll receive a shared secret</p>
            <p>2. Copy this secret and add it to your Supabase project environment variables</p>
            <p>3. Go to your Supabase project dashboard → Settings → Edge Functions</p>
            <p>4. Add the environment variable: <code className="bg-orange-100 px-1 rounded">ELEVENLABS_WEBHOOK_SECRET</code></p>
            <p>5. Set the value to your ElevenLabs webhook secret</p>
          </div>
          <div className="mt-3 p-3 bg-orange-100 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-orange-700" />
              <span className="text-sm font-medium text-orange-900">Environment Variable Format:</span>
            </div>
            <code className="text-sm font-mono text-orange-800">ELEVENLABS_WEBHOOK_SECRET=your_actual_secret_from_elevenlabs</code>
          </div>
        </div>

        {/* Step 3: ElevenLabs Configuration */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            Configure in ElevenLabs Dashboard
          </h3>
          <div className="space-y-3 text-purple-800 text-sm">
            <p>1. Go to your <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-700">ElevenLabs Conversational AI Dashboard</a></p>
            <p>2. Navigate to your agent settings</p>
            <p>3. Find the "Webhooks" or "Post-call webhook" section</p>
            <p>4. Paste the webhook URL from step 1</p>
            <p>5. Copy the generated shared secret and configure it in Supabase (step 2)</p>
            <p>6. Select <strong>POST-CALL webhook events</strong> (see recommended events below)</p>
            <p>7. Save the webhook configuration</p>
          </div>
          <div className="mt-3 p-3 bg-purple-100 rounded border">
            <p className="text-sm font-medium text-purple-900 mb-2">⚠️ Critical:</p>
            <p className="text-sm text-purple-800">
              <strong>Select POST-CALL events only!</strong> Real-time events like <code>user.message</code> 
              are not available. Use <code>conversation.ended</code> for comprehensive EU AI Act analysis.
            </p>
          </div>
        </div>

        {/* Step 4: Recommended Events */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
            <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
            Recommended Post-Call Webhook Events
          </h3>
          <p className="text-indigo-800 text-sm mb-3">
            Select these POST-CALL events in your ElevenLabs webhook configuration:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {postCallWebhookEvents.map((event) => (
              <div key={event} className="flex items-center gap-2 bg-white p-3 rounded border">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div className="flex-1">
                  <code className="text-sm font-mono text-gray-800">{event}</code>
                  <div className="text-xs text-gray-600 mt-1">
                    {event === 'conversation.ended' && 'Triggered when conversation ends with full transcript for EU AI Act analysis'}
                    {event === 'call.analysis_complete' && 'Triggered when ElevenLabs completes analysis with EU AI Act assessment'}
                    {event === 'post_call_analysis' && 'Comprehensive post-call analysis data for EU AI Act compliance'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-indigo-100 rounded border">
            <p className="text-sm font-medium text-indigo-900 mb-2">💡 Pro Tip:</p>
            <p className="text-sm text-indigo-800">
              Start with <code>conversation.ended</code> as it's the most commonly available post-call event.
              This gives you the complete conversation for comprehensive EU AI Act risk analysis.
            </p>
          </div>
        </div>

        {/* Step 5: Testing */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h3 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
            <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
            Test Your EU AI Act Webhook
          </h3>
          <div className="space-y-3 text-teal-800 text-sm">
            <p>1. Start a conversation with your ElevenLabs agent</p>
            <p>2. Describe an AI system with EU AI Act keywords like "social scoring", "biometric identification", "recruitment AI"</p>
            <p>3. <strong>END the conversation</strong> (this triggers the post-call webhook)</p>
            <p>4. Watch for webhook processing logs in the browser console</p>
            <p>5. Check the Risk Dashboard for new EU AI Act compliance assessments</p>
          </div>
          <div className="mt-3 p-3 bg-teal-100 rounded border">
            <p className="text-sm font-medium text-teal-900 mb-2">🔍 What to Look For:</p>
            <div className="text-sm text-teal-800 space-y-1">
              <p>• <code>🇪🇺 EU AI ACT WEBHOOK REQUEST:</code> - ElevenLabs sending post-call data</p>
              <p>• <code>🎯 EU AI ACT WEBHOOK PAYLOAD PARSED:</code> - Complete conversation received</p>
              <p>• <code>🇪🇺 EU AI ACT ANALYSIS:</code> - Comprehensive EU AI Act risk analysis in progress</p>
              <p>• <code>🚫 EU AI ACT PROHIBITED:</code> - Prohibited AI system detected</p>
              <p>• <code>✅ EU AI ACT DATABASE SUCCESS:</code> - Risk assessment saved</p>
            </div>
          </div>
        </div>

        {/* Test Conversation Flow */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Test EU AI Act Conversation Flow
          </h3>
          <p className="text-red-800 text-sm mb-3">
            Try this conversation flow to trigger EU AI Act risk detection:
          </p>
          <div className="bg-white p-4 rounded border">
            <div className="space-y-2 text-sm">
              <div><strong>User:</strong> "Hi, I need help with EU AI Act compliance"</div>
              <div><strong>Agent:</strong> "I can help you assess your AI system's risk level"</div>
              <div><strong>User:</strong> "I have a social scoring system that rates citizens"</div>
              <div><strong>Agent:</strong> "That type of system is prohibited under the EU AI Act"</div>
              <div><strong>User:</strong> "What about biometric identification in public spaces?"</div>
              <div><strong>Agent:</strong> "Real-time biometric identification in public is also prohibited"</div>
              <div className="text-red-600 font-medium">→ END CONVERSATION (triggers EU AI Act webhook)</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-red-100 rounded border">
            <p className="text-sm font-medium text-red-900 mb-2">Expected Result:</p>
            <p className="text-sm text-red-800">
              PROHIBITED risk assessment (score 90+) with EU AI Act compliance requirements: immediate cessation required
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <a
            href="https://elevenlabs.io/docs/conversational-ai/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            ElevenLabs Webhook Docs
          </a>
          <a
            href="https://elevenlabs.io/app/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Configure Webhooks
          </a>
        </div>
      </div>
    </div>
  );
};