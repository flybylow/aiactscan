# 🎯 Risk Keywords Customization Guide

## 📝 **How to Customize Risk Keywords**

Your risk detection system uses **configurable keywords** that you can easily customize for your specific needs!

## 🔧 **Where to Make Changes**

### **File Location:**
```
supabase/functions/elevenlabs-webhook/risk-keywords.ts
```

### **What You Can Customize:**

#### **1. 🚨 Critical Risk Keywords (25 points each)**
```typescript
const CRITICAL_KEYWORDS = [
  'password', 'admin password', 'hack', 'exploit',
  'credit card', 'social security', 'steal', 'fraud',
  // Add your custom critical keywords here
  'your_custom_keyword', 'another_critical_term'
];
```

#### **2. ⚠️ High Risk Keywords (15 points each)**
```typescript
const HIGH_KEYWORDS = [
  'confidential', 'unauthorized', 'bypass', 'database',
  'api key', 'private key', 'sensitive data',
  // Add your custom high-risk keywords here
  'your_industry_term', 'specific_system_name'
];
```

#### **3. 🔍 Medium Risk Keywords (8 points each)**
```typescript
const MEDIUM_KEYWORDS = [
  'urgent', 'emergency', 'help me get', 'access denied',
  'make an exception', 'just this once',
  // Add your custom medium-risk keywords here
  'your_medium_risk_term'
];
```

#### **4. ℹ️ Low Risk Keywords (3 points each)**
```typescript
const LOW_KEYWORDS = [
  'question', 'help', 'information', 'explain',
  // Add your custom low-risk keywords here
  'normal_inquiry_term'
];
```

## 🏭 **Industry-Specific Examples**

### **Financial Services**
```typescript
// Add these to CRITICAL_KEYWORDS
'account number', 'routing number', 'swift code', 'pin number',
'wire transfer', 'crypto wallet', 'private key', 'seed phrase'

// Add these to HIGH_KEYWORDS  
'transaction history', 'investment portfolio', 'trading account',
'ach routing', 'iban', 'bsb'
```

### **Healthcare**
```typescript
// Add these to CRITICAL_KEYWORDS
'patient records', 'medical history', 'ssn', 'medicare number'

// Add these to HIGH_KEYWORDS
'phi', 'hipaa', 'diagnosis', 'prescription', 'insurance information'
```

### **Technology/SaaS**
```typescript
// Add these to CRITICAL_KEYWORDS
'source code', 'production database', 'deployment key', 'root access'

// Add these to HIGH_KEYWORDS
'repository', 'staging environment', 'api endpoint', 'webhook secret',
'oauth token', 'service account'
```

### **Government/Defense**
```typescript
// Add these to CRITICAL_KEYWORDS
'classified', 'top secret', 'security clearance', 'compartmented'

// Add these to HIGH_KEYWORDS
'need to know', 'fouo', 'cui', 'pii', 'clearance level'
```

## ⚙️ **Scoring Configuration**

### **Adjust Risk Thresholds:**
```typescript
export const RISK_SCORING_CONFIG = {
  BASE_SCORE: 10,                    // Starting score for any conversation
  SOCIAL_ENGINEERING_BONUS: 10,     // Bonus for social engineering patterns
  URGENCY_BONUS: 5,                 // Bonus per urgency word
  EXCESSIVE_QUESTIONS_BONUS: 10,    // Bonus for too many questions
  
  THRESHOLDS: {
    CRITICAL: 80,    // Score needed for critical risk
    HIGH: 60,        // Score needed for high risk  
    MEDIUM: 30,      // Score needed for medium risk
    LOW: 0           // Everything else is low risk
  }
};
```

### **Adjust Keyword Weights:**
```typescript
// Change how much each risk level contributes to the score
RISK_PATTERNS.critical.weight = 30;  // Increase critical keyword impact
RISK_PATTERNS.high.weight = 20;      // Increase high keyword impact
RISK_PATTERNS.medium.weight = 10;    // Increase medium keyword impact
```

## 🎯 **Quick Customization Examples**

### **Example 1: Add Company-Specific Terms**
```typescript
// Add to CRITICAL_KEYWORDS
'company_admin_portal', 'internal_system_name', 'proprietary_database'

// Add to HIGH_KEYWORDS  
'employee_directory', 'customer_database', 'financial_reports'
```

### **Example 2: Add Product-Specific Terms**
```typescript
// Add to CRITICAL_KEYWORDS
'product_api_key', 'master_password', 'admin_dashboard'

// Add to HIGH_KEYWORDS
'user_data', 'analytics_dashboard', 'billing_information'
```

### **Example 3: Adjust for Different Languages**
```typescript
// Add non-English keywords
'contraseña', 'mot de passe', 'passwort',  // password in Spanish, French, German
'urgente', 'urgent', 'dringend'            // urgent in different languages
```

## 🚀 **How to Deploy Changes**

### **Method 1: Automatic Deployment**
1. Edit `supabase/functions/elevenlabs-webhook/risk-keywords.ts`
2. Save the file
3. The Edge Function will automatically redeploy with your changes

### **Method 2: Manual Deployment** 
```bash
# If you have Supabase CLI installed
supabase functions deploy elevenlabs-webhook
```

## 🧪 **Testing Your Changes**

### **1. Test with Specific Keywords**
Start a conversation and say:
```
"What's the [your_custom_keyword]?"
```

### **2. Check the Logs**
Look for these console messages:
```
🎯 KEYWORD MATCH - CRITICAL: { matched: ["your_custom_keyword"], count: 1, weight: 25, score_added: 25 }
📈 POST-CALL ANALYSIS COMPLETE: { level: "critical", score: 85, ... }
```

### **3. Verify in Dashboard**
- Check Risk Dashboard for new assessment
- Verify risk level matches your expectations
- Review risk factors for keyword matches

## 📊 **Monitoring Your Configuration**

The system logs your current configuration:
```
📊 RISK CONFIG - Using keyword configuration: {
  risk_levels: ["critical", "high", "medium", "low"],
  keyword_counts: { critical: 25, high: 18, medium: 15, low: 8 },
  total_keywords: 66
}
```

## 🎛️ **Advanced Customization**

### **Add Custom Patterns**
```typescript
// Add to SOCIAL_ENGINEERING_PATTERNS
'my boss said', 'the ceo wants', 'compliance requires'

// Add to URGENCY_INDICATORS  
'deadline', 'time sensitive', 'priority'
```

### **Industry-Specific Scoring**
```typescript
// Higher penalties for financial terms
if (level === 'critical' && keyword.includes('account')) {
  totalScore += 50; // Extra penalty for account-related terms
}
```

## 🎯 **Best Practices**

### **✅ Do:**
- Start with industry-specific keywords
- Test thoroughly with real conversations
- Monitor false positives and adjust
- Document your customizations
- Use specific terms rather than generic ones

### **❌ Don't:**
- Add too many generic words (causes false positives)
- Set thresholds too low (everything becomes high risk)
- Forget to test after changes
- Remove all default keywords (start with additions)

## 🔄 **Regular Maintenance**

### **Monthly Review:**
1. Check Risk Dashboard for patterns
2. Review false positives/negatives
3. Add new keywords based on threats
4. Adjust scoring thresholds if needed

### **Quarterly Updates:**
1. Review industry threat intelligence
2. Update keywords based on new attack patterns
3. Benchmark against security incidents
4. Refine scoring algorithms

Your risk detection system is now **fully customizable** and **production-ready**! 🚀✨