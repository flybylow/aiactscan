import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export const DatabaseTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (testName: string, status: TestResult['status'], message: string) => {
    setTests(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message }
        : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Initialize tests
    const initialTests: TestResult[] = [
      { test: 'Database Connection', status: 'pending', message: 'Testing connection...' },
      { test: 'Table Structure', status: 'pending', message: 'Checking table exists...' },
      { test: 'Insert Test Data', status: 'pending', message: 'Inserting test record...' },
      { test: 'Read Test Data', status: 'pending', message: 'Reading test records...' },
      { test: 'Update Test Data', status: 'pending', message: 'Updating test record...' },
      { test: 'RLS Policies', status: 'pending', message: 'Testing security policies...' }
    ];
    
    setTests(initialTests);

    try {
      // Test 1: Database Connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('risk_assessments')
        .select('count')
        .limit(1);

      if (connectionError) {
        updateTest('Database Connection', 'error', `Connection failed: ${connectionError.message}`);
        setIsRunning(false);
        return;
      }

      updateTest('Database Connection', 'success', 'Connected successfully');

      // Test 2: Table Structure
      const { data: tableData, error: tableError } = await supabase
        .from('risk_assessments')
        .select('*')
        .limit(1);

      if (tableError) {
        updateTest('Table Structure', 'error', `Table error: ${tableError.message}`);
      } else {
        updateTest('Table Structure', 'success', 'Table structure verified');
      }

      // Test 3: Insert Test Data
      const testRecord = {
        conversation_id: `test_${Date.now()}`,
        agent_id: 'test_agent',
        user_id: null,
        risk_level: 'medium' as const,
        risk_score: 65,
        risk_factors: { 
          test_factor: 'automated_test',
          timestamp: new Date().toISOString()
        },
        conversation_summary: 'This is a test record created by the database test function'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('risk_assessments')
        .insert(testRecord)
        .select()
        .single();

      if (insertError) {
        updateTest('Insert Test Data', 'error', `Insert failed: ${insertError.message}`);
      } else {
        updateTest('Insert Test Data', 'success', `Record inserted with ID: ${insertData.id.slice(0, 8)}...`);
      }

      // Test 4: Read Test Data
      const { data: readData, error: readError } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('conversation_id', testRecord.conversation_id)
        .single();

      if (readError) {
        updateTest('Read Test Data', 'error', `Read failed: ${readError.message}`);
      } else {
        updateTest('Read Test Data', 'success', `Record found: ${readData.risk_level} risk, score ${readData.risk_score}`);
      }

      // Test 5: Update Test Data
      if (insertData) {
        const { data: updateData, error: updateError } = await supabase
          .from('risk_assessments')
          .update({ 
            risk_score: 75,
            risk_factors: { 
              ...testRecord.risk_factors,
              updated: true,
              update_timestamp: new Date().toISOString()
            }
          })
          .eq('id', insertData.id)
          .select()
          .single();

        if (updateError) {
          updateTest('Update Test Data', 'error', `Update failed: ${updateError.message}`);
        } else {
          updateTest('Update Test Data', 'success', `Record updated: score now ${updateData.risk_score}`);
        }
      }

      // Test 6: RLS Policies
      const { data: policyData, error: policyError } = await supabase
        .from('risk_assessments')
        .select('count')
        .limit(5);

      if (policyError) {
        updateTest('RLS Policies', 'error', `Policy test failed: ${policyError.message}`);
      } else {
        updateTest('RLS Policies', 'success', 'RLS policies working correctly');
      }

    } catch (error) {
      console.error('Test suite error:', error);
      setTests(prev => prev.map(test => 
        test.status === 'pending' 
          ? { ...test, status: 'error', message: 'Test suite failed' }
          : test
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const addSampleData = async () => {
    const sampleRecords = [
      {
        conversation_id: `sample_low_${Date.now()}`,
        agent_id: 'demo_agent',
        risk_level: 'low' as const,
        risk_score: 25,
        risk_factors: { 
          tone: 'friendly',
          topics: ['weather', 'general_chat'],
          sentiment: 'positive'
        },
        conversation_summary: 'Casual conversation about weather and daily activities'
      },
      {
        conversation_id: `sample_high_${Date.now() + 1}`,
        agent_id: 'demo_agent',
        risk_level: 'high' as const,
        risk_score: 85,
        risk_factors: { 
          tone: 'aggressive',
          topics: ['sensitive_information', 'personal_data'],
          sentiment: 'negative',
          flags: ['data_request', 'unusual_behavior']
        },
        conversation_summary: 'User attempted to extract sensitive information and showed unusual behavior patterns'
      },
      {
        conversation_id: `sample_critical_${Date.now() + 2}`,
        agent_id: 'demo_agent',
        risk_level: 'critical' as const,
        risk_score: 95,
        risk_factors: { 
          tone: 'manipulative',
          topics: ['system_access', 'security_bypass'],
          sentiment: 'hostile',
          flags: ['security_threat', 'system_manipulation', 'social_engineering']
        },
        conversation_summary: 'Critical security threat detected - user attempting social engineering attack to gain system access'
      }
    ];

    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert(sampleRecords)
        .select();

      if (error) {
        console.error('Failed to add sample data:', error);
        alert(`Failed to add sample data: ${error.message}`);
      } else {
        alert(`Successfully added ${data.length} sample records`);
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Error adding sample data');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">Database Test Suite</h2>
      </div>

      <div className="space-y-4 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Database Tests'
          )}
        </button>

        <button
          onClick={addSampleData}
          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sample Risk Data
        </button>
      </div>

      {tests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900 mb-3">Test Results:</h3>
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{test.test}</div>
                <div className={`text-xs mt-1 ${
                  test.status === 'error' ? 'text-red-600' : 
                  test.status === 'success' ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {test.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Environment Check:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
          <div>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
        </div>
      </div>
    </div>
  );
};