import React, { useState, useEffect } from 'react';
import { X, Settings, TestTube, Database, Webhook, FileText, ExternalLink, Copy, CheckCircle, AlertTriangle, RefreshCw, Key, Shield, Scale, Zap, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LogsPanel } from './LogsPanel';
import { useAnalysisLogs } from '../hooks/useAnalysisLogs';

interface AdminPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'testing' | 'database' | 'livechat'>('status');
  const [secretStatus, setSecretStatus] = useState<'checking' | 'found' | 'missing' | 'error'>('checking');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dbTestResults, setDbTestResults] = useState<any[]>([]);
  const [runningDbTests, setRunningDbTests] = useState(false);
  const [showLogsPanel, setShowLogsPanel] = useState(false);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-webhook`;

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

  useEffect(() => {
    if (isOpen) {
      checkWebhookSecret();
    }
  }, [isOpen]);

  const checkWebhookSecret = async () => {
    try {
      setSecretStatus('checking');
      
      const testPayload = JSON.stringify({
        event_type: 'test.secret_check',
        conversation_id: 'test_123',
        timestamp: new Date().toISOString()
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'elevenlabs-signature': 'test_signature_to_check_secret_config'
        },
        body: testPayload
      });

      const responseText = await response.text();
      
      if (response.status === 500 && responseText.includes('Webhook secret not configured')) {
        setSecretStatus('missing');
        setTestResult('❌ ELEVENLABS_WEBHOOK_SECRET not configured');
      } else if (response.status === 401) {
        setSecretStatus('found');
        setTestResult('✅ Webhook secret is configured correctly');
      } else if (response.status === 200) {
        setSecretStatus('found');
        setTestResult('✅ Webhook endpoint is fully functional');
      } else {
        setSecretStatus('error');
        setTestResult(`⚠️ Unexpected response: ${response.status}`);
      }
    } catch (error) {
      setSecretStatus('error');
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testWebhookEndpoint = async () => {
    setTesting(true);
    try {
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
              { role: 'user', content: 'I have a social scoring system that rates citizens', timestamp: new Date().toISOString() },
              { role: 'agent', content: 'That type of system is prohibited under the EU AI Act', timestamp: new Date().toISOString() }
            ],
            full_transcript: 'User: I have a social scoring system that rates citizens. Agent: That type of system is prohibited under the EU AI Act.'
          }
        },
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'elevenlabs-signature': 'test_signature_for_endpoint_verification'
        },
        body: JSON.stringify(testPayload)
      });
      
      if (response.status === 401) {
        setTestResult('✅ Webhook endpoint working (401 expected without valid signature)');
      } else if (response.status === 500) {
        const text = await response.text();
        if (text.includes('Webhook secret not configured')) {
          setTestResult('⚠️ Endpoint reachable but needs ELEVENLABS_WEBHOOK_SECRET');
        } else {
          setTestResult('⚠️ Endpoint error - check logs');
        }
      } else if (response.ok) {
        setTestResult('✅ Webhook endpoint fully functional');
      } else {
        setTestResult(`⚠️ Status ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Failed to reach endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const simulateWebhookData = async () => {
    const simulatedAssessment = {
      id: `sim_${Date.now()}`,
      conversation_id: `admin_test_${Date.now()}`,
      agent_id: 'admin_test_agent',
      user_id: null,
      risk_level: 'critical' as const,
      risk_score: 95,
      risk_factors: {
        critical_keywords: ['social scoring', 'mass surveillance'],
        eu_ai_act_analysis: true,
        simulation: true,
        test_source: 'admin_page_simulation',
        eu_assessment: {
          category: 'critical',
          label: 'PROHIBITED',
          description: 'This AI system is prohibited under the EU AI Act',
          compliance_requirements: [
            'System deployment is PROHIBITED under EU AI Act',
            'Immediate cessation of development required',
            'No market access permitted in EU'
          ]
        }
      },
      conversation_summary: 'Admin test: PROHIBITED AI system simulation for testing EU AI Act compliance interface',
      detected_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    window.dispatchEvent(new CustomEvent('riskDetected', { detail: simulatedAssessment }));
    window.dispatchEvent(new CustomEvent('newRiskAssessment', { detail: simulatedAssessment }));
    
    setTestResult('🎭 Simulated PROHIBITED risk assessment dispatched - check for notifications!');
  };

  const runDatabaseTests = async () => {
    setRunningDbTests(true);
    setDbTestResults([]);
    
    const tests = [
      { name: 'Database Connection', status: 'running' },
      { name: 'Table Structure', status: 'pending' },
      { name: 'Insert Test', status: 'pending' },
      { name: 'Read Test', status: 'pending' },
      { name: 'RLS Policies', status: 'pending' }
    ];
    
    setDbTestResults([...tests]);

    try {
      // Test 1: Connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('risk_assessments')
        .select('count')
        .limit(1);

      if (connectionError) {
        setDbTestResults(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { ...test, status: 'failed', message: connectionError.message }
            : test
        ));
        setRunningDbTests(false);
        return;
      }

      setDbTestResults(prev => prev.map(test => 
        test.name === 'Database Connection' 
          ? { ...test, status: 'passed', message: 'Connected successfully' }
          : test.name === 'Table Structure'
          ? { ...test, status: 'running' }
          : test
      ));

      // Test 2: Table Structure
      const { data: tableData, error: tableError } = await supabase
        .from('risk_assessments')
        .select('*')
        .limit(1);

      setDbTestResults(prev => prev.map(test => 
        test.name === 'Table Structure' 
          ? { ...test, status: tableError ? 'failed' : 'passed', message: tableError?.message || 'Table verified' }
          : test.name === 'Insert Test'
          ? { ...test, status: 'running' }
          : test
      ));

      // Test 3: Insert
      const testRecord = {
        conversation_id: `admin_test_${Date.now()}`,
        agent_id: 'admin_test_agent',
        user_id: null,
        risk_level: 'medium',
        risk_score: 65,
        risk_factors: { test: true, admin_test: true },
        conversation_summary: 'Admin test record'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('risk_assessments')
        .insert(testRecord)
        .select()
        .single();

      setDbTestResults(prev => prev.map(test => 
        test.name === 'Insert Test' 
          ? { ...test, status: insertError ? 'failed' : 'passed', message: insertError?.message || `Record created: ${insertData?.id?.slice(0, 8)}...` }
          : test.name === 'Read Test'
          ? { ...test, status: 'running' }
          : test
      ));

      // Test 4: Read
      if (insertData) {
        const { data: readData, error: readError } = await supabase
          .from('risk_assessments')
          .select('*')
          .eq('id', insertData.id)
          .single();

        setDbTestResults(prev => prev.map(test => 
          test.name === 'Read Test' 
            ? { ...test, status: readError ? 'failed' : 'passed', message: readError?.message || `Record found: ${readData?.risk_level} risk` }
            : test.name === 'RLS Policies'
            ? { ...test, status: 'running' }
            : test
        ));
      }

      // Test 5: RLS
      const { data: rlsData, error: rlsError } = await supabase
        .from('risk_assessments')
        .select('count')
        .limit(5);

      setDbTestResults(prev => prev.map(test => 
        test.name === 'RLS Policies' 
          ? { ...test, status: rlsError ? 'failed' : 'passed', message: rlsError?.message || 'RLS policies working' }
          : test
      ));

    } catch (error) {
      console.error('Database test error:', error);
    } finally {
      setRunningDbTests(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'found':
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'missing':
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found':
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'missing':
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'error':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'running':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">EU AI Act Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'status', label: 'System Status', icon: Shield },
              { id: 'setup', label: 'Setup Guide', icon: Webhook },
              { id: 'testing', label: 'Testing Tools', icon: TestTube },
              { id: 'database', label: 'Database Tests', icon: Database },
              { id: 'livechat', label: 'Live Chat', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'status' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Status Overview</h3>
              
              {/* Webhook Secret Status */}
              <div className={`p-4 rounded-lg border ${getStatusColor(secretStatus)}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Key className="w-5 h-5" />
                  <h4 className="font-semibold">Webhook Secret Configuration</h4>
                  {getStatusIcon(secretStatus)}
                </div>
                <p className="text-sm mb-3">
                  {secretStatus === 'found' && 'Webhook secret is properly configured in Supabase'}
                  {secretStatus === 'missing' && 'ELEVENLABS_WEBHOOK_SECRET environment variable is missing'}
                  {secretStatus === 'error' && 'Error checking webhook configuration'}
                  {secretStatus === 'checking' && 'Checking webhook secret configuration...'}
                </p>
                {testResult && (
                  <div className="text-xs font-mono bg-white/50 p-2 rounded">
                    {testResult}
                  </div>
                )}
                <button
                  onClick={checkWebhookSecret}
                  className="mt-3 px-3 py-1 bg-white/50 hover:bg-white/70 rounded text-sm transition-colors"
                >
                  Recheck Status
                </button>
              </div>

              {/* Environment Variables */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Environment Variables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {import.meta.env.VITE_SUPABASE_URL ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span>VITE_SUPABASE_URL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span>VITE_SUPABASE_ANON_KEY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {import.meta.env.VITE_ELEVENLABS_API_KEY ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span>VITE_ELEVENLABS_API_KEY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {import.meta.env.VITE_ELEVENLABS_AGENT_ID ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span>VITE_ELEVENLABS_AGENT_ID</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Quick Actions</h4>
                <div className="flex gap-3 flex-wrap">
                  <a
                    href="https://elevenlabs.io/app/conversational-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ElevenLabs Dashboard
                  </a>
                  <a
                    href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/settings/functions`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Supabase Secrets
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Complete Setup Guide</h3>
              
              {/* Step 1: ElevenLabs Configuration */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Configure ElevenLabs Webhook
                </h4>
                <div className="space-y-3 text-purple-800 text-sm">
                  <p>1. Go to your <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline font-medium">ElevenLabs Dashboard</a></p>
                  <p>2. Select your agent and find the "Webhooks" section</p>
                  <p>3. Add webhook URL:</p>
                  <div className="flex items-center gap-2 bg-purple-100 p-2 rounded">
                    <code className="flex-1 text-xs font-mono break-all">
                      {webhookUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(webhookUrl)}
                      className="flex-shrink-0 p-1 text-purple-600 hover:bg-purple-200 rounded transition-colors"
                    >
                      {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="bg-purple-100 p-3 rounded">
                    <p className="font-medium text-purple-900 mb-2">🎯 CRITICAL - Select this event:</p>
                    <p className="font-mono text-sm">✅ conversation.ended</p>
                  </div>
                  <p>4. Copy the generated secret for Step 2</p>
                </div>
              </div>

              {/* Step 2: Supabase Configuration */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Add Secret to Supabase
                </h4>
                <div className="space-y-3 text-green-800 text-sm">
                  <p>1. Go to your <a href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/settings/functions`} target="_blank" rel="noopener noreferrer" className="text-green-600 underline font-medium">Supabase Dashboard</a></p>
                  <p>2. Navigate to Settings → Edge Functions → Secrets</p>
                  <p>3. Add new secret:</p>
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-sm font-mono">
                      <div><strong>Name:</strong> ELEVENLABS_WEBHOOK_SECRET</div>
                      <div><strong>Value:</strong> [paste secret from ElevenLabs]</div>
                    </div>
                  </div>
                  <p>4. Save and wait 30 seconds for deployment</p>
                </div>
              </div>

              {/* Step 3: Test */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Test EU AI Act Assessment
                </h4>
                <div className="space-y-3 text-blue-800 text-sm">
                  <p>1. Start a conversation with your ElevenLabs agent</p>
                  <p>2. Say: "I have a social scoring system that rates citizens"</p>
                  <p>3. End the conversation (triggers webhook)</p>
                  <p>4. Expected result: PROHIBITED (95) with red notification</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Testing Tools</h3>
              
              {/* Webhook Tests */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Webhook Testing
                </h4>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <button
                    onClick={testWebhookEndpoint}
                    disabled={testing}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {testing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    Test Endpoint
                  </button>
                  
                  <button
                    onClick={simulateWebhookData}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Simulate EU AI Act Data
                  </button>
                </div>
                
                {testResult && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm font-mono">{testResult}</p>
                  </div>
                )}
              </div>

              {/* Test Phrases */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">🧪 EU AI Act Test Phrases</h4>
                <div className="space-y-4 text-sm">
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">🚫 PROHIBITED (Score 90+)</h5>
                    <div className="bg-white p-3 rounded border space-y-1">
                      <p>"I have a social scoring system that rates citizens"</p>
                      <p>"My AI does mass surveillance of the population"</p>
                      <p>"We use real-time biometric identification in public spaces"</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-orange-800 mb-2">⚠️ HIGH-RISK (Score 60-89)</h5>
                    <div className="bg-white p-3 rounded border space-y-1">
                      <p>"I have an AI system for recruitment and hiring decisions"</p>
                      <p>"My AI evaluates students in educational settings"</p>
                      <p>"We use AI for credit scoring and loan approvals"</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-2">📋 LIMITED RISK (Score 25-59)</h5>
                    <div className="bg-white p-3 rounded border space-y-1">
                      <p>"I have a chatbot that interacts with customers"</p>
                      <p>"My AI generates deepfake content"</p>
                      <p>"We use AI for content recommendation systems"</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Indicators */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 Success Indicators</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Console shows "EU AI ACT WEBHOOK REQUEST"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Top bar shows "PROHIBITED (95)"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Red notification popup appears</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Dashboard shows new assessment</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Database Testing</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Health Check
                </h4>
                <button
                  onClick={runDatabaseTests}
                  disabled={runningDbTests}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2 mb-4"
                >
                  {runningDbTests ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  Run Database Tests
                </button>
                
                {dbTestResults.length > 0 && (
                  <div className="space-y-2">
                    {dbTestResults.map((test, index) => (
                      <div key={index} className={`p-3 rounded border ${getStatusColor(test.status)}`}>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{test.name}</div>
                            {test.message && (
                              <div className="text-xs mt-1 opacity-75">{test.message}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Database Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Database Configuration</h4>
                <div className="text-sm space-y-2">
                  <div><strong>Project:</strong> {import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}</div>
                  <div><strong>Table:</strong> risk_assessments</div>
                  <div><strong>RLS:</strong> Enabled</div>
                  <div><strong>Real-time:</strong> Subscribed</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'livechat' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Live Chat Analysis</h3>
                <button
                  onClick={() => setShowLogsPanel(true)}
                  className={`
                    px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2
                    ${logs.length > 0 ? 'ring-2 ring-blue-300' : ''}
                  `}
                >
                  <FileText className="w-4 h-4" />
                  View EU AI Act Analysis Logs
                  {logs.length > 0 && (
                    <span className="bg-blue-700 text-white text-xs rounded-full px-2 py-1">
                      {logs.length > 99 ? '99+' : logs.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Live Chat Overview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  EU AI Act Analysis Monitoring
                </h4>
                <div className="space-y-3 text-blue-800 text-sm">
                  <p>Real-time monitoring of EU AI Act compliance analysis during conversations.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-blue-900">Total Log Entries</div>
                      <div className="text-2xl font-bold text-blue-600">{logs.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="font-medium text-blue-900">Analysis Categories</div>
                      <div className="text-sm mt-1">
                        <div>Webhook: {logs.filter(l => l.category === 'webhook').length}</div>
                        <div>Analysis: {logs.filter(l => l.category === 'analysis').length}</div>
                        <div>Database: {logs.filter(l => l.category === 'database').length}</div>
                        <div>UI: {logs.filter(l => l.category === 'ui').length}</div>
                        <div>System: {logs.filter(l => l.category === 'system').length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Analysis Activity</h4>
                {logs.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="bg-white p-3 rounded border text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`
                            px-2 py-0.5 rounded text-xs font-medium
                            ${log.category === 'webhook' ? 'bg-purple-100 text-purple-700' :
                              log.category === 'analysis' ? 'bg-blue-100 text-blue-700' :
                              log.category === 'database' ? 'bg-green-100 text-green-700' :
                              log.category === 'ui' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'}
                          `}>
                            {log.category}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-700">{log.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No analysis activity yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Start a conversation to see EU AI Act analysis logs
                    </p>
                  </div>
                )}
              </div>

              {/* Clear Logs */}
              {logs.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    Clear All Logs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logs Panel Modal */}
        <LogsPanel
          isOpen={showLogsPanel}
          onClose={() => setShowLogsPanel(false)}
          logs={logs}
          onClearLogs={clearLogs}
        />
      </div>
    </div>
  );
};