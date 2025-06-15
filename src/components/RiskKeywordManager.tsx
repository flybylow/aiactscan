import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface KeywordSet {
  level: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
  weight: number;
  color: string;
  description: string;
}

export const RiskKeywordManager: React.FC = () => {
  const [keywordSets, setKeywordSets] = useState<KeywordSet[]>([
    {
      level: 'critical',
      keywords: ['password', 'hack', 'exploit', 'credit card', 'social security', 'steal', 'fraud'],
      weight: 25,
      color: 'red',
      description: 'Immediate security threats requiring urgent attention'
    },
    {
      level: 'high',
      keywords: ['confidential', 'unauthorized', 'bypass', 'database', 'api key', 'sensitive data'],
      weight: 15,
      color: 'orange',
      description: 'Potential security risks or unauthorized access attempts'
    },
    {
      level: 'medium',
      keywords: ['urgent', 'emergency', 'help me get', 'access denied', 'make an exception'],
      weight: 8,
      color: 'yellow',
      description: 'Suspicious behavior or potential social engineering'
    },
    {
      level: 'low',
      keywords: ['question', 'help', 'information', 'explain', 'can you help'],
      weight: 3,
      color: 'green',
      description: 'Normal inquiries worth monitoring in context'
    }
  ]);

  const [newKeywords, setNewKeywords] = useState<Record<string, string>>({
    critical: '',
    high: '',
    medium: '',
    low: ''
  });

  const [scoringConfig, setScoringConfig] = useState({
    baseScore: 10,
    socialEngineeringBonus: 10,
    urgencyBonus: 5,
    thresholds: {
      critical: 80,
      high: 60,
      medium: 30,
      low: 0
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const addKeyword = (level: string, keyword: string) => {
    if (!keyword.trim()) return;

    setKeywordSets(prev => prev.map(set => 
      set.level === level 
        ? { ...set, keywords: [...set.keywords, keyword.trim().toLowerCase()] }
        : set
    ));

    setNewKeywords(prev => ({ ...prev, [level]: '' }));
  };

  const removeKeyword = (level: string, keywordToRemove: string) => {
    setKeywordSets(prev => prev.map(set => 
      set.level === level 
        ? { ...set, keywords: set.keywords.filter(k => k !== keywordToRemove) }
        : set
    ));
  };

  const updateWeight = (level: string, newWeight: number) => {
    setKeywordSets(prev => prev.map(set => 
      set.level === level 
        ? { ...set, weight: newWeight }
        : set
    ));
  };

  const saveConfiguration = async () => {
    setSaveStatus('saving');
    
    try {
      // In a real implementation, this would save to your backend/database
      // For now, we'll simulate the save and show the configuration
      
      const config = {
        keywordSets: keywordSets.reduce((acc, set) => {
          acc[set.level] = {
            keywords: set.keywords,
            weight: set.weight
          };
          return acc;
        }, {} as Record<string, any>),
        scoringConfig
      };

      console.log('🎯 KEYWORD CONFIG - Configuration to save:', config);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      // Show instructions for manual deployment
      alert(`Configuration saved! 

To deploy these changes:
1. Copy the logged configuration from browser console
2. Update supabase/functions/elevenlabs-webhook/risk-keywords.ts
3. The Edge Function will automatically redeploy

Check the console for the complete configuration object.`);
      
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      green: 'bg-green-50 border-green-200 text-green-800'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const getTotalKeywords = () => {
    return keywordSets.reduce((total, set) => total + set.keywords.length, 0);
  };

  const getEstimatedScore = (level: string) => {
    const set = keywordSets.find(s => s.level === level);
    return set ? set.keywords.length * set.weight : 0;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900">Risk Keywords Configuration</h2>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Total Keywords: <span className="font-medium">{getTotalKeywords()}</span>
          </div>
          <button
            onClick={saveConfiguration}
            disabled={saveStatus === 'saving'}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
              ${saveStatus === 'saving' 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : saveStatus === 'saved'
                ? 'bg-green-500 text-white'
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              }
            `}
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Config
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scoring Configuration */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-4">Scoring Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Score</label>
            <input
              type="number"
              value={scoringConfig.baseScore}
              onChange={(e) => setScoringConfig(prev => ({ ...prev, baseScore: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Critical Threshold</label>
            <input
              type="number"
              value={scoringConfig.thresholds.critical}
              onChange={(e) => setScoringConfig(prev => ({ 
                ...prev, 
                thresholds: { ...prev.thresholds, critical: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">High Threshold</label>
            <input
              type="number"
              value={scoringConfig.thresholds.high}
              onChange={(e) => setScoringConfig(prev => ({ 
                ...prev, 
                thresholds: { ...prev.thresholds, high: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medium Threshold</label>
            <input
              type="number"
              value={scoringConfig.thresholds.medium}
              onChange={(e) => setScoringConfig(prev => ({ 
                ...prev, 
                thresholds: { ...prev.thresholds, medium: parseInt(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Keyword Sets */}
      <div className="space-y-6">
        {keywordSets.map((set) => (
          <div key={set.level} className={`p-4 rounded-lg border ${getColorClasses(set.color)}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg capitalize">{set.level} Risk Keywords</h3>
                <p className="text-sm opacity-75">{set.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">Weight:</span>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) => updateWeight(set.level, parseInt(e.target.value) || 0)}
                    className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="text-sm">
                  <span className="font-medium">Max Score:</span> {getEstimatedScore(set.level)}
                </div>
              </div>
            </div>

            {/* Add New Keyword */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={newKeywords[set.level]}
                onChange={(e) => setNewKeywords(prev => ({ ...prev, [set.level]: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addKeyword(set.level, newKeywords[set.level]);
                  }
                }}
                placeholder="Add new keyword..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => addKeyword(set.level, newKeywords[set.level])}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Keywords List */}
            <div className="flex flex-wrap gap-2">
              {set.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-300 text-sm"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => removeKeyword(set.level, keyword)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {set.keywords.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No keywords configured for this risk level
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Industry Templates */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Industry-Specific Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              // Add financial keywords
              setKeywordSets(prev => prev.map(set => 
                set.level === 'critical' 
                  ? { ...set, keywords: [...set.keywords, 'account number', 'routing number', 'swift code'] }
                  : set
              ));
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Financial Services
          </button>
          <button
            onClick={() => {
              // Add healthcare keywords
              setKeywordSets(prev => prev.map(set => 
                set.level === 'critical' 
                  ? { ...set, keywords: [...set.keywords, 'patient records', 'medical history', 'phi'] }
                  : set
              ));
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Healthcare
          </button>
          <button
            onClick={() => {
              // Add tech keywords
              setKeywordSets(prev => prev.map(set => 
                set.level === 'critical' 
                  ? { ...set, keywords: [...set.keywords, 'source code', 'production database', 'api secret'] }
                  : set
              ));
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Technology
          </button>
          <button
            onClick={() => {
              // Add government keywords
              setKeywordSets(prev => prev.map(set => 
                set.level === 'critical' 
                  ? { ...set, keywords: [...set.keywords, 'classified', 'top secret', 'security clearance'] }
                  : set
              ));
            }}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Government
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">📝 Deployment Instructions</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>1. Click "Save Config" to generate the configuration</p>
          <p>2. Copy the configuration from the browser console</p>
          <p>3. Update <code>supabase/functions/elevenlabs-webhook/risk-keywords.ts</code></p>
          <p>4. The Edge Function will automatically redeploy with your changes</p>
          <p>5. Test with a conversation containing your new keywords</p>
        </div>
      </div>
    </div>
  );
};