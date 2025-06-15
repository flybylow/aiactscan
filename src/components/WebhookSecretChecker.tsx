import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Key, ExternalLink, Settings, Webhook, Copy, Clock } from 'lucide-react';

export const WebhookSecretChecker: React.FC = () => {
  const [secretStatus, setSecretStatus] = useState<'checking' | 'found' | 'missing' | 'error'>('checking');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-webhook`;

  useEffect(() => {
    checkWebhookSecret();
  }, []);

  const checkWebhookSecret = async () => {
    try {
      setSecretStatus('checking');
      
      // Create a simple test payload
      const testPayload = JSON.stringify({
        event_type: 'test.secret_check',
        conversation_id: 'test_123',
        timestamp: new Date().toISOString()
      });

      console.log('🔐 WEBHOOK SECRET CHECK - Testing configuration...');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'elevenlabs-signature': 'test_signature_to_check_secret_config'
        },
        body: testPayload
      });

      const responseText = await response.text();
      
      console.log('🔐 WEBHOOK SECRET CHECK - Response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.slice(0, 200) + '...'
      });
      
      if (response.status === 500 && responseText.includes('Webhook secret not configured')) {
        setSecretStatus('missing');
        setTestResult('❌ ELEVENLABS_WEBHOOK_SECRET not configured in Supabase Edge Functions');
      } else if (response.status === 401 && responseText.includes('Invalid signature')) {
        setSecretStatus('found');
        setTestResult('✅ Webhook secret is configured! (401 Unauthorized is expected with test signature)');
      } else if (response.status === 401 && responseText.includes('Missing signature')) {
        setSecretStatus('found');
        setTestResult('✅ Webhook secret is configured! (Missing signature header is expected)');
      } else if (response.status === 200) {
        setSecretStatus('found');
        setTestResult('✅ Webhook endpoint is fully functional!');
      } else {
        setSecretStatus('error');
        setTestResult(`⚠️ Unexpected response: ${response.status} - ${responseText.slice(0, 100)}`);
      }
    } catch (error) {
      console.error('🔐 WEBHOOK SECRET CHECK - Error:', error);
      setSecretStatus('error');
      setTestResult(`❌ Error checking webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <div className="space-y-4">
      {/* Status Check */}
      <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-5 h-5" />
          <h3 className="font-semibold">EU AI Act Webhook Status</h3>
          {getStatusIcon()}
        </div>
        
        <div className="text-sm">
          {secretStatus === 'checking' && (
            <p>Checking webhook secret configuration...</p>
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
              <p>You need to configure the ELEVENLABS_WEBHOOK_SECRET in Supabase.</p>
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
          onClick={checkWebhookSecret}
          className="mt-3 px-3 py-1 bg-white/50 hover:bg-white/70 rounded text-sm transition-colors"
        >
          Recheck Status
        </button>
      </div>

      {/* Quick Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">🔗 Quick Setup Links</h3>
        <div className="flex gap-3 flex-wrap">
          <a
            href="https://elevenlabs.io/app/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            ElevenLabs Dashboard
          </a>
          <a
            href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/settings/functions`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Supabase Secrets
          </a>
        </div>
      </div>

      {/* Configuration Steps */}
      <div className="space-y-4">
        {/* Step 1: ElevenLabs Configuration */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Configure ElevenLabs Webhook
          </h3>
          <div className="space-y-3 text-purple-800 text-sm">
            <p>1. Go to your <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-700 inline-flex items-center gap-1 font-medium">ElevenLabs Dashboard <ExternalLink className="w-3 h-3" /></a></p>
            <p>2. <strong>Select your agent</strong> (the one you're using in this app)</p>
            <p>3. Find the <strong>"Webhooks"</strong> or <strong>"Post-call webhook"</strong> section</p>
            <p>4. Click <strong>"Add Webhook"</strong> or <strong>"Configure Webhook"</strong></p>
            <p>5. Add webhook URL:</p>
            <div className="flex items-center gap-2 bg-purple-100 p-2 rounded">
              <code className="flex-1 text-xs font-mono break-all">
                {webhookUrl}
              </code>
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="flex-shrink-0 p-1 text-purple-600 hover:bg-purple-200 rounded transition-colors"
                title="Copy URL"
              >
                {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="bg-purple-100 p-3 rounded border">
              <p className="font-medium text-purple-900 mb-2">🎯 CRITICAL - Select this event:</p>
              <p className="font-mono text-sm">✅ conversation.ended</p>
              <p className="text-xs mt-1">This triggers the final EU AI Act analysis when conversations end</p>
            </div>
            <p>6. <strong>Copy the generated secret</strong> (looks like: whsec_abc123...)</p>
          </div>
        </div>

        {/* Step 2: Supabase Configuration */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Add Secret to Supabase
          </h3>
          <div className="space-y-3 text-orange-800 text-sm">
            <p>1. Go to your <a href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/settings/functions`} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700 inline-flex items-center gap-1 font-medium">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></p>
            <p>2. Click on <strong>"Secrets"</strong> tab</p>
            <p>3. Click <strong>"Add new secret"</strong></p>
            <p>4. Add the environment variable:</p>
            <div className="bg-orange-100 p-3 rounded border">
              <div className="text-sm font-mono text-orange-800">
                <div><strong>Name:</strong> ELEVENLABS_WEBHOOK_SECRET</div>
                <div><strong>Value:</strong> [paste the secret from ElevenLabs]</div>
              </div>
            </div>
            <p>5. <strong>Save</strong> the secret</p>
            <p>6. <strong>Wait 30 seconds</strong> for deployment</p>
          </div>
        </div>

        {/* Step 3: Test */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            Test EU AI Act Assessment
          </h3>
          <div className="space-y-3 text-green-800 text-sm">
            <p><strong>After completing steps 1-2, test with:</strong></p>
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
      </div>
    </div>
  );
};