// 🇪🇺 EU AI Act Risk Assessment Keywords Configuration
// Uses text values for database compatibility: critical, high, medium, low
// Maps to EU AI Act categories in UI: PROHIBITED, HIGH-RISK, LIMITED RISK, MINIMAL RISK

export interface RiskKeywordConfig {
  keywords: string[];
  weight: number;
  description?: string;
}

export interface RiskPatterns {
  critical: RiskKeywordConfig;  // Maps to PROHIBITED
  high: RiskKeywordConfig;      // Maps to HIGH-RISK
  medium: RiskKeywordConfig;    // Maps to LIMITED RISK
  low: RiskKeywordConfig;       // Maps to MINIMAL RISK
}

// 🚫 PROHIBITED AI SYSTEMS (critical text value)
const PROHIBITED_KEYWORDS = [
  // Social Scoring & Surveillance
  'social scoring', 'social credit', 'citizen scoring', 'behavior scoring',
  'mass surveillance', 'indiscriminate surveillance', 'general surveillance',
  
  // Biometric Identification in Public
  'real-time biometric', 'public biometric identification', 'facial recognition public',
  'biometric surveillance', 'remote biometric identification',
  
  // Subliminal & Manipulative Techniques
  'subliminal techniques', 'manipulative ai', 'exploit vulnerabilities',
  'psychological manipulation', 'behavioral manipulation', 'subconscious influence',
  
  // Targeting Vulnerable Groups
  'exploit children', 'manipulate elderly', 'target disabilities',
  'vulnerable groups targeting', 'cognitive impairment exploitation',
  
  // Emotion Recognition (Workplace/Education)
  'emotion recognition workplace', 'emotion detection school', 'emotional surveillance',
  'workplace emotion monitoring', 'student emotion tracking',
  
  // Predictive Policing (Individual Targeting)
  'individual crime prediction', 'personal crime risk', 'individual criminal assessment',
  'predict individual crime', 'target specific person crime'
];

// ⚠️ HIGH-RISK AI SYSTEMS (high text value)
const HIGH_RISK_KEYWORDS = [
  // Critical Infrastructure
  'critical infrastructure', 'power grid', 'water supply', 'transportation safety',
  'traffic management', 'energy systems', 'telecommunications infrastructure',
  
  // Education & Vocational Training
  'educational assessment', 'student evaluation', 'academic scoring',
  'vocational training assessment', 'educational ai', 'learning analytics',
  'student performance prediction', 'educational outcome prediction',
  
  // Employment & HR
  'recruitment ai', 'hiring algorithm', 'cv screening', 'candidate assessment',
  'employee evaluation', 'performance monitoring', 'workplace assessment',
  'job application screening', 'employment decision', 'promotion algorithm',
  
  // Essential Services
  'credit scoring', 'loan approval', 'financial assessment', 'insurance pricing',
  'healthcare diagnosis', 'medical decision', 'treatment recommendation',
  'emergency services', 'social benefits', 'welfare assessment',
  
  // Law Enforcement
  'crime prediction', 'risk assessment individuals', 'criminal justice',
  'law enforcement ai', 'police algorithm', 'judicial decision support',
  'bail assessment', 'sentencing support', 'parole decision',
  
  // Border Control & Migration
  'border control', 'immigration assessment', 'asylum decision',
  'visa processing', 'identity verification', 'document authentication',
  'migration risk assessment', 'refugee status determination',
  
  // Democratic Processes
  'election monitoring', 'voting systems', 'political analysis',
  'democratic process', 'electoral assessment', 'political risk',
  
  // Biometric Systems
  'biometric identification', 'biometric verification', 'biometric categorization',
  'facial recognition', 'fingerprint analysis', 'voice recognition',
  'gait recognition', 'behavioral biometrics'
];

// 📋 LIMITED RISK AI SYSTEMS (medium text value)
const LIMITED_RISK_KEYWORDS = [
  // AI Interaction Systems
  'chatbot', 'virtual assistant', 'conversational ai', 'ai interaction',
  'automated customer service', 'ai support system', 'dialogue system',
  
  // Content Generation
  'deepfake', 'synthetic media', 'ai generated content', 'artificial content',
  'synthetic video', 'synthetic audio', 'generated images', 'ai content creation',
  
  // Recommendation Systems
  'content recommendation', 'product recommendation', 'algorithmic curation',
  'personalized content', 'targeted advertising', 'behavioral targeting',
  
  // Emotion Recognition (General)
  'emotion recognition', 'emotion detection', 'sentiment analysis',
  'mood detection', 'emotional ai', 'affective computing',
  
  // Decision Support
  'decision support', 'advisory system', 'recommendation engine',
  'automated suggestions', 'ai assistance', 'intelligent assistance'
];

// ✅ MINIMAL RISK AI SYSTEMS (low text value)
const MINIMAL_RISK_KEYWORDS = [
  // General AI Applications
  'spam filter', 'search algorithm', 'translation', 'language processing',
  'data analysis', 'pattern recognition', 'optimization', 'automation',
  
  // Entertainment & Gaming
  'game ai', 'entertainment ai', 'gaming algorithm', 'recreational ai',
  'ai game character', 'procedural generation',
  
  // Productivity Tools
  'text processing', 'document analysis', 'scheduling ai', 'calendar optimization',
  'workflow automation', 'task management', 'productivity enhancement',
  
  // Research & Development
  'research ai', 'scientific analysis', 'data mining', 'statistical analysis',
  'experimental ai', 'prototype system', 'research tool'
];

// 📊 Export the complete EU AI Act risk patterns (using text values)
export const RISK_PATTERNS: RiskPatterns = {
  critical: {  // Maps to PROHIBITED in UI
    keywords: PROHIBITED_KEYWORDS,
    weight: 100, // Automatic maximum score
    description: 'AI systems prohibited under EU AI Act - immediate ban'
  },
  high: {      // Maps to HIGH-RISK in UI
    keywords: HIGH_RISK_KEYWORDS,
    weight: 25,
    description: 'High-risk AI systems requiring strict compliance and conformity assessment'
  },
  medium: {    // Maps to LIMITED RISK in UI
    keywords: LIMITED_RISK_KEYWORDS,
    weight: 10,
    description: 'Limited risk AI systems requiring transparency obligations'
  },
  low: {       // Maps to MINIMAL RISK in UI
    keywords: MINIMAL_RISK_KEYWORDS,
    weight: 2,
    description: 'Minimal risk AI systems with no specific regulatory obligations'
  }
};

// 🎛️ EU AI ACT RISK SCORING CONFIGURATION
export const RISK_SCORING_CONFIG = {
  // Base score for any AI system assessment
  BASE_SCORE: 5,
  
  // Bonus points for compliance factors
  FUNDAMENTAL_RIGHTS_VIOLATION: 50,
  VULNERABLE_GROUPS_TARGETING: 40,
  MASS_SURVEILLANCE_INDICATORS: 45,
  BIOMETRIC_PUBLIC_USE: 35,
  CRITICAL_INFRASTRUCTURE_IMPACT: 30,
  
  // EU AI Act risk level thresholds (mapped to text values)
  THRESHOLDS: {
    CRITICAL: 90,    // critical text → PROHIBITED UI
    HIGH: 60,        // high text → HIGH-RISK UI
    MEDIUM: 25,      // medium text → LIMITED RISK UI
    LOW: 0           // low text → MINIMAL RISK UI
  }
};

// 🔍 EU AI ACT ASSESSMENT PATTERNS
export const EU_ASSESSMENT_INDICATORS = [
  // System Purpose Assessment
  'what does your ai do', 'ai system purpose', 'intended use', 'system functionality',
  'ai application', 'use case', 'deployment context', 'operational environment',
  
  // Risk Category Indicators
  'high risk ai', 'critical infrastructure', 'essential services', 'public safety',
  'fundamental rights impact', 'vulnerable groups', 'democratic processes',
  
  // Compliance Questions
  'eu compliance', 'ai act compliance', 'regulatory requirements', 'legal obligations',
  'conformity assessment', 'ce marking', 'notified body assessment'
];

// 🎯 SOCIAL ENGINEERING PATTERNS (EU AI Act Context)
export const SOCIAL_ENGINEERING_PATTERNS = [
  'bypass eu regulations', 'avoid compliance', 'circumvent ai act',
  'hide ai functionality', 'disguise ai system', 'regulatory loophole',
  'minimal compliance', 'compliance workaround'
];

// 🚨 URGENCY INDICATORS (Compliance Context)
export const URGENCY_INDICATORS = [
  'urgent deployment', 'immediate launch', 'skip assessment', 'fast track',
  'regulatory deadline', 'compliance emergency', 'urgent compliance'
];

// 🔍 EU AI ACT INFORMATION EXTRACTION
export const INFORMATION_EXTRACTION_PATTERNS = [
  'tell me about', 'what is', 'how does', 'explain', 'describe',
  'assessment for', 'compliance requirements', 'regulatory status'
];

// 🎯 EU AI ACT RISK LEVEL MAPPING (Database text → UI display)
export const EU_RISK_LEVEL_MAPPING = {
  critical: 'PROHIBITED',    // critical text → PROHIBITED UI
  high: 'HIGH-RISK',         // high text → HIGH-RISK UI  
  medium: 'LIMITED RISK',    // medium text → LIMITED RISK UI
  low: 'MINIMAL RISK'        // low text → MINIMAL RISK UI
};

// 🔧 CUSTOMIZATION FUNCTIONS

/**
 * Add custom EU AI Act keywords to a specific risk level
 */
export function addEUKeywords(level: keyof RiskPatterns, keywords: string[]): void {
  RISK_PATTERNS[level].keywords.push(...keywords);
}

/**
 * Get EU AI Act compliance assessment summary
 */
export function getEUComplianceSummary() {
  return {
    risk_categories: Object.keys(RISK_PATTERNS),
    keyword_counts: Object.fromEntries(
      Object.entries(RISK_PATTERNS).map(([level, config]) => [level, config.keywords.length])
    ),
    eu_scoring_config: RISK_SCORING_CONFIG,
    total_keywords: Object.values(RISK_PATTERNS).reduce((sum, config) => sum + config.keywords.length, 0),
    compliance_framework: 'EU AI Act 2024',
    assessment_type: 'risk_categorization',
    enum_mapping: EU_RISK_LEVEL_MAPPING
  };
}

/**
 * Determine EU AI Act risk category from score (returns database text value)
 */
export function getEURiskCategory(score: number): {
  category: keyof RiskPatterns;
  label: string;
  description: string;
} {
  if (score >= RISK_SCORING_CONFIG.THRESHOLDS.CRITICAL) {
    return {
      category: 'critical',  // Database text value
      label: 'PROHIBITED',   // UI display
      description: 'This AI system is prohibited under the EU AI Act and cannot be deployed'
    };
  } else if (score >= RISK_SCORING_CONFIG.THRESHOLDS.HIGH) {
    return {
      category: 'high',      // Database text value
      label: 'HIGH-RISK',    // UI display
      description: 'High-risk AI system requiring conformity assessment and strict compliance'
    };
  } else if (score >= RISK_SCORING_CONFIG.THRESHOLDS.MEDIUM) {
    return {
      category: 'medium',    // Database text value
      label: 'LIMITED RISK', // UI display
      description: 'Limited risk AI system requiring transparency obligations'
    };
  } else {
    return {
      category: 'low',       // Database text value
      label: 'MINIMAL RISK', // UI display
      description: 'Minimal risk AI system with no specific regulatory obligations'
    };
  }
}

// Export for backward compatibility
export const SOCIAL_ENGINEERING_PATTERNS_EXPORT = SOCIAL_ENGINEERING_PATTERNS;
export const URGENCY_INDICATORS_EXPORT = URGENCY_INDICATORS;
export const INFORMATION_EXTRACTION_PATTERNS_EXPORT = INFORMATION_EXTRACTION_PATTERNS;

// Main export function for configuration summary
export function getConfigSummary() {
  return getEUComplianceSummary();
}