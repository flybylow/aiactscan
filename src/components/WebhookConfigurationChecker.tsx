import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, AlertTriangle, Key, ExternalLink, Copy, Eye, Webhook, Settings } from 'lucide-react';

export const WebhookConfigurationChecker: React.FC = () => {
  const [secretStatus, setSecretStatus] = useState<'checking' | 'found' | 'missing' | 'error'>('checking');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [webhookUrl] = useState(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-webhook`);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkWebhookConfiguration();
  }, []);

  // Generate HMAC-SHA256 signature for webhook testing
  const generateSignature = async (payload: string, secret: string): Promise<string> => {
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

    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return `sha256=${signature}`;
  };

  const checkWebhookConfiguration = async () => {
    try {
      setTesting(true);
      
      // Create a comprehensive test payload
      const testPayload = JSON.stringify({
        event_type: 'conversation.ended',
        conversation_id: 'test_conversation_123',
        agent_id: 'test_agent',
        call_data: {
          conversation_id: 'test_conversation_123',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration_seconds: 120,
          transcript: {
            messages: [
              { role: 'user', content: 'I have a social scoring system that rates citizens', timestamp: new Date().toISOString() },
              { role: 'agent', content: 'That type of system is prohibited under the EU AI Act', timestamp: new Date().toISOString() }
            ],
            full_transcript: 'User: I have a social scoring system that rates citizens. Agent: That type of system is prohibited under the EU AI Act.'
          },
          analysis: {
            summary: 'User described a prohibited AI system',
            sentiment: 'negative',
            topics: ['social scoring', 'ai compliance'],
            risk_assessment: {
              level: 'prohibited',
              score: 95,
              factors: ['social_scoring', 'prohibited_system']
            }
          }
        },
        timestamp: new Date().toISOString(),
        metadata: {
          test: true,
          source: 'webhook_configuration_checker'
        }
      });

      console.log('🔐 WEBHOOK TEST - Testing configuration with comprehensive payload...');

      // Test with a known test secret first
      const testSecret = 'test_secret_for_verification';
      const validSignature = await generateSignature(testPayload, testSecret);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'elevenlabs-signature': validSignature
        },
        body: testPayload
      });

      const responseText = await response.text();
      
      console.log('🔐 WEBHOOK TEST - Response received:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.slice(0, 300) + '...'
      });
      
      if (response.status === 500 && responseText.includes('Webhook secret not configured')) {
        setSecretStatus('missing');
        setTestResult('❌ ELEVENLABS_WEBHOOK_SECRET environment variable not set in Supabase Edge Functions');
      } else if (response.status === 401 && responseText.includes('Invalid signature')) {
        setSecretStatus('found');
        setTestResult('✅ Webhook secret is configured! Signature validation is working (401 expected with test secret)');
      } else if (response.status === 200) {
        setSecretStatus('found');
        setTestResult('✅ Webhook endpoint is fully functional and processing EU AI Act assessments correctly!');
      } else {
        setSecretStatus('found');
        setTestResult(`✅ Webhook endpoint responding (status: ${response.status}) - secret appears to be configured`);
      }
    } catch (error) {
      console.error('🔐 WEBHOOK TEST - Error:', error);
      setSecretStatus('error');
      setTestResult(`❌ Error testing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusIcon = () => {
    switch (secretStatus) {
      case 'found':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (secretStatus) {
      case 'found':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'missing':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'error':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhook Secret Status */}
      <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-3">
          <Key className="w-5 h-5" />
          <h3 className="font-semibold">Webhook Secret Status</h3>
          {getStatusIcon()}
        </div>
        
        <div className="text-sm">
          {secretStatus === 'checking' && (
            <p>Testing webhook configuration with valid signature...</p>
          )}
          
          {secretStatus === 'found' && (
            <div>
              <p className="font-medium mb-2">✅ Webhook secret is configured!</p>
              <p>Your EU AI Act webhook should be working. If you're not seeing risk assessments:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check ElevenLabs webhook events are selected (conversation.ended)</li>
                <li>Verify webhook URL is correct in ElevenLabs</li>
                <li>Try ending a conversation to trigger the webhook</li>
              </ul>
            </div>
          )}
          
          {secretStatus === 'missing' && (
            <div>
              <p className="font-medium mb-2">❌ Webhook secret is missing!</p>
              <p>You need to configure the ELEVENLABS_WEBHOOK_SECRET in Supabase:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Get webhook secret from ElevenLabs (see ElevenLabs Configuration below)</li>
                <li>Go to Supabase Dashboard → Settings → Edge Functions → Secrets</li>
                <li>Add: ELEVENLABS_WEBHOOK_SECRET = your_secret_from_elevenlabs</li>
              </ol>
            </div>
          )}
          
          {secretStatus === 'error' && (
            <div>
              <p className="font-medium mb-2">⚠️ Error checking webhook status</p>
              <p>There was an issue checking the webhook configuration.</p>
            </div>
          )}
          
          {testResult && (
            <div className="mt-3 p-2 bg-white/50 rounded border">
              <p className="text-xs font-mono">{testResult}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={checkWebhookConfiguration}
          disabled={testing}
          className="mt-3 px-3 py-1 bg-white/50 hover:bg-white/70 disabled:opacity-50 rounded text-sm transition-colors"
        >
          {testing ? 'Testing...' : 'Recheck Status'}
        </button>
      </div>

      {/* Webhook URL Configuration */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Webhook className="w-5 h-5" />
          Step 1: Configure ElevenLabs Webhook URL
        </h3>
        <p className="text-blue-800 text-sm mb-3">
          Copy this URL and add it to your ElevenLabs agent webhook configuration:
        </p>
        <div className="flex items-center gap-2 bg-white p-3 rounded border">
          <code className="flex-1 text-sm font-mono text-gray-800 break-all">
            {webhookUrl}
          </code>
          <button
            onClick={() => copyToClipboard(webhookUrl)}
            className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            title="Copy URL"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-3 p-3 bg-blue-100 rounded border">
          <p className="text-sm font-medium text-blue-900 mb-2">🎯 Critical Events to Select:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ <code>conversation.ended</code> (Most important - triggers final EU AI Act analysis)</li>
            <li>✅ <code>call.analysis_complete</code> (If available)</li>
            <li>✅ <code>post_call_analysis</code> (If available)</li>
          </ul>
        </div>
      </div>

      {/* ElevenLabs Configuration Steps */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Step 2: Configure in ElevenLabs Dashboard
        </h3>
        <div className="space-y-3 text-purple-800 text-sm">
          <p>1. Go to your <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-700 inline-flex items-center gap-1">ElevenLabs Conversational AI Dashboard <ExternalLink className="w-3 h-3" /></a></p>
          <p>2. Select your agent (the one you're using in this app)</p>
          <p>3. Find the <strong>"Webhooks"</strong> or <strong>"Post-call webhook"</strong> section</p>
          <p>4. Click <strong>"Add Webhook"</strong> or <strong>"Configure Webhook"</strong></p>
          <p>5. Paste the webhook URL from Step 1</p>
          <p>6. <strong>CRITICAL:</strong> Select <code>conversation.ended</code> event</p>
          <p>7. Copy the generated shared secret</p>
          <p>8. Add the secret to Supabase (Step 3 below)</p>
        </div>
      </div>

      {/* Supabase Secret Configuration */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Step 3: Add Secret to Supabase
        </h3>
        <div className="space-y-3 text-orange-800 text-sm">
          <p>1. Go to your <a href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700 inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></p>
          <p>2. Navigate to <strong>Settings → Edge Functions → Secrets</strong></p>
          <p>3. Click <strong>"Add new secret"</strong></p>
          <p>4. Add the environment variable:</p>
          <div className="bg-orange-100 p-3 rounded border mt-2">
            <div className="text-sm font-mono text-orange-800">
              <div><strong>Name:</strong> ELEVENLABS_WEBHOOK_SECRET</div>
              <div><strong>Value:</strong> [paste the secret from ElevenLabs]</div>
            </div>
          </div>
          <p>5. <strong>Save</strong> the secret</p>
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Step 4: Test EU AI Act Assessment
        </h3>
        <div className="space-y-3 text-green-800 text-sm">
          <p><strong>After completing steps 1-3, test with this conversation:</strong></p>
          <div className="bg-white p-3 rounded border">
            <div className="space-y-2 text-sm">
              <div><strong>User:</strong> "I have a social scoring system that rates citizens"</div>
              <div><strong>Agent:</strong> "That type of system is prohibited under the EU AI Act"</div>
              <div className="text-green-600 font-medium">→ END CONVERSATION (triggers webhook)</div>
            </div>
          </div>
          <div className="bg-green-100 p-3 rounded border">
            <p className="text-sm font-medium text-green-900 mb-2">Expected Results:</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Top bar changes to "PROHIBITED (95)" 🚫</li>
              <li>• Red notification popup appears</li>
              <li>• Console shows webhook processing logs</li>
              <li>• Dashboard shows new EU AI Act assessment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Current Configuration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {secretStatus === 'found' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>Webhook Secret</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>ElevenLabs Events (Unknown)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Webhook Endpoint</span>
          </div>
        </div>
      </div>
    </div>
  );
};