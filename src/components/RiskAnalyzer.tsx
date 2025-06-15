import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface RiskAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  riskFactors: string[];
  confidence: number;
}

interface RiskAnalyzerProps {
  userTranscript: string; // Only analyze user input
  onRiskDetected: (result: RiskAnalysisResult) => void;
}

export const RiskAnalyzer: React.FC<RiskAnalyzerProps> = ({ userTranscript, onRiskDetected }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Only analyze if we have user input and it's substantial enough
    if (!userTranscript || userTranscript.length < 10) return;

    const analyzeRisk = () => {
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      setTimeout(() => {
        const result = performRiskAnalysis(userTranscript);
        onRiskDetected(result);
        setIsAnalyzing(false);
      }, 500);
    };

    // Debounce analysis
    const timer = setTimeout(analyzeRisk, 1000);
    return () => clearTimeout(timer);
  }, [userTranscript, onRiskDetected]);

  return null; // This is a background analyzer component
};

function performRiskAnalysis(userText: string): RiskAnalysisResult {
  const text = userText.toLowerCase();
  
  const riskPatterns = {
    critical: {
      keywords: [
        'hack', 'password', 'credit card', 'social security', 'bank account',
        'exploit', 'vulnerability', 'bypass security', 'admin access', 'root access',
        'steal', 'fraud', 'scam', 'phishing', 'malware', 'virus', 'backdoor',
        'give me your password', 'what is the password', 'tell me the password'
      ],
      weight: 25
    },
    high: {
      keywords: [
        'personal information', 'private', 'confidential', 'secret', 'unauthorized',
        'bypass', 'sensitive data', 'login credentials', 'api key', 'token',
        'database', 'system access', 'injection', 'override', 'disable security',
        'can you access', 'help me access', 'give me access to'
      ],
      weight: 15
    },
    medium: {
      keywords: [
        'help me get', 'can you tell me', 'what is the', 'how do i get',
        'urgent', 'emergency', 'problem', 'issue', 'error', 'suspicious',
        'unusual', 'strange behavior', 'not working', 'access denied',
        'i need to know', 'tell me about', 'show me how'
      ],
      weight: 8
    },
    low: {
      keywords: [
        'question', 'help', 'information', 'explain', 'how does', 'what is',
        'can you help', 'please tell me', 'i want to learn'
      ],
      weight: 3
    }
  };

  let totalScore = 0;
  let detectedFactors: string[] = [];
  let highestLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Analyze each risk level
  for (const [level, config] of Object.entries(riskPatterns)) {
    const matchedKeywords = config.keywords.filter(keyword => text.includes(keyword));
    
    if (matchedKeywords.length > 0) {
      const levelScore = matchedKeywords.length * config.weight;
      totalScore += levelScore;
      detectedFactors.push(...matchedKeywords);
      
      if (level === 'critical') highestLevel = 'critical';
      else if (level === 'high' && highestLevel !== 'critical') highestLevel = 'high';
      else if (level === 'medium' && !['critical', 'high'].includes(highestLevel)) highestLevel = 'medium';
    }
  }

  // Additional risk factors for user behavior patterns
  const wordCount = text.split(' ').length;
  if (wordCount > 100) {
    totalScore += 5; // Long user messages might be more risky
    detectedFactors.push('long_message');
  }
  
  // Check for question patterns that might be probing
  const questionWords = ['how', 'what', 'where', 'when', 'why', 'can you', 'tell me'];
  const questionCount = questionWords.filter(word => text.includes(word)).length;
  if (questionCount > 3) {
    totalScore += questionCount * 2;
    detectedFactors.push('multiple_questions');
  }

  // Check for urgency indicators
  const urgencyWords = ['urgent', 'emergency', 'asap', 'immediately', 'right now', 'quickly'];
  const urgencyCount = urgencyWords.filter(word => text.includes(word)).length;
  if (urgencyCount > 0) {
    totalScore += urgencyCount * 5;
    detectedFactors.push('urgency_indicators');
  }

  // Check for social engineering patterns
  if (text.includes('just this once') || text.includes('make an exception') || text.includes('special case')) {
    totalScore += 10;
    detectedFactors.push('social_engineering');
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(totalScore, 100);
  
  // Determine final risk level based on score
  let finalLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (normalizedScore >= 80) finalLevel = 'critical';
  else if (normalizedScore >= 60) finalLevel = 'high';
  else if (normalizedScore >= 30) finalLevel = 'medium';
  else finalLevel = 'low';

  // Use the higher of keyword-based or score-based level
  const levels = ['low', 'medium', 'high', 'critical'];
  const keywordLevelIndex = levels.indexOf(highestLevel);
  const scoreLevelIndex = levels.indexOf(finalLevel);
  const finalLevelIndex = Math.max(keywordLevelIndex, scoreLevelIndex);
  
  return {
    riskLevel: levels[finalLevelIndex] as 'low' | 'medium' | 'high' | 'critical',
    riskScore: normalizedScore,
    riskFactors: [...new Set(detectedFactors)], // Remove duplicates
    confidence: Math.min(95, 60 + (detectedFactors.length * 5))
  };
}