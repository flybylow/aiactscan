# 🇪🇺 EU AI Act Testing Guide

## 🎯 Test Phrases to Trigger EU AI Act Risk Assessment

Once your webhook is configured, test with these specific phrases to trigger different EU AI Act risk categories:

### 🚫 **PROHIBITED AI Systems** (Should trigger immediate ban alerts)
```
"I have a social scoring system that rates citizens"
"My AI does mass surveillance of the population"
"We use real-time biometric identification in public spaces"
"Our system uses subliminal techniques to manipulate behavior"
"I want to build emotion recognition for workplace monitoring"
"My AI predicts individual crime risk for specific people"
```

### ⚠️ **HIGH-RISK AI Systems** (Should trigger strict compliance requirements)
```
"I have an AI system for recruitment and hiring decisions"
"My AI evaluates students in educational settings"
"We use AI for credit scoring and loan approvals"
"Our system provides medical diagnosis recommendations"
"I built an AI for law enforcement risk assessment"
"My AI manages critical infrastructure like power grids"
"We use biometric identification for border control"
```

### 📋 **LIMITED RISK AI Systems** (Should trigger transparency obligations)
```
"I have a chatbot that interacts with customers"
"My AI generates deepfake content"
"We use AI for content recommendation systems"
"Our system does emotion recognition for general purposes"
"I built an AI assistant for decision support"
```

### ✅ **MINIMAL RISK AI Systems** (Should show no specific obligations)
```
"I have a spam filter for emails"
"My AI does language translation"
"We use AI for data analysis and pattern recognition"
"Our system optimizes scheduling and workflows"
"I built an AI for gaming and entertainment"
```

## 📊 **Expected Results**

When working correctly, you should see:

### **In Browser Console:**
```
🇪🇺 EU AI ACT WEBHOOK REQUEST: { method: "POST", url: "...", headers: {...} }
🎯 EU AI ACT WEBHOOK PAYLOAD PARSED: { event_type: "conversation.ended", conversation_id: "...", duration: 180 }
🇪🇺 EU AI ACT ANALYSIS - Starting comprehensive risk assessment...
🎯 EU AI ACT MATCH - PROHIBITED: { matched: ["social scoring", "mass surveillance"], count: 2, weight: 100 }
🇪🇺 EU AI ACT ANALYSIS COMPLETE: { level: "prohibited", score: 95, category: "prohibited", label: "PROHIBITED" }
💾 EU AI ACT DATABASE - Saving comprehensive EU AI Act risk assessment...
✅ EU AI ACT DATABASE SUCCESS - Risk assessment stored
🚨🇪🇺 EU AI ACT HIGH RISK ALERT 🇪🇺🚨
```

### **In Your App UI:**
1. **Top bar risk indicator** changes to show EU AI Act category (e.g., "PROHIBITED (95)")
2. **Colored notification popup** appears with EU AI Act assessment
3. **Risk Dashboard** shows new assessment with compliance requirements
4. **Webhook Debug Log** shows EU AI Act analysis activity

### **In Risk Dashboard:**
- New assessment with EU AI Act category label
- Compliance requirements listed
- Risk factors showing keyword matches
- EU AI Act assessment details

## 🔍 **Troubleshooting**

### **No EU AI Act assessment received?**
1. **Check conversation ends properly** - webhook triggers on `conversation.ended`
2. **Verify webhook secret is configured** in Supabase
3. **Test with "Simulate Webhook Data" button** to confirm UI works
4. **Check Supabase Edge Function logs** for incoming requests

### **Wrong risk category assigned?**
1. **Check keyword matches** in console logs
2. **Verify your phrases contain EU AI Act keywords**
3. **Try more explicit descriptions** of your AI system
4. **Check risk factors** in the dashboard for keyword detection

### **Webhook signature errors?**
1. **Copy webhook secret exactly** from ElevenLabs
2. **Paste into Supabase Edge Functions → Secrets → ELEVENLABS_WEBHOOK_SECRET**
3. **Save and wait** for deployment

## 🎯 **Success Indicators**

You'll know it's working when:
- ✅ Console shows "EU AI ACT WEBHOOK REQUEST" logs
- ✅ Risk indicator shows EU AI Act categories (PROHIBITED, HIGH-RISK, etc.)
- ✅ Notifications appear with EU AI Act descriptions
- ✅ Dashboard shows compliance requirements
- ✅ Database contains EU AI Act assessment data

## 📞 **Quick Verification Tests**

### **Test 1: Prohibited System**
**Say:** "I have a social scoring system for citizens"
**Expected:** PROHIBITED category, score 90+, red notification

### **Test 2: High-Risk System**
**Say:** "My AI makes hiring decisions for recruitment"
**Expected:** HIGH-RISK category, score 60+, orange notification

### **Test 3: Limited Risk System**
**Say:** "I built a chatbot for customer service"
**Expected:** LIMITED RISK category, score 25+, yellow notification

### **Test 4: Minimal Risk System**
**Say:** "My AI is just a spam filter"
**Expected:** MINIMAL RISK category, low score, green notification

## 🇪🇺 **EU AI Act Categories Explained**

### **🚫 PROHIBITED (Score 90+)**
- **Status:** Banned in EU
- **Action:** Immediate cessation required
- **Examples:** Social scoring, mass surveillance, subliminal manipulation

### **⚠️ HIGH-RISK (Score 60-89)**
- **Status:** Strict compliance required
- **Action:** Conformity assessment, CE marking, human oversight
- **Examples:** Hiring AI, educational assessment, medical diagnosis

### **📋 LIMITED RISK (Score 25-59)**
- **Status:** Transparency obligations
- **Action:** Clear disclosure, user information
- **Examples:** Chatbots, deepfakes, recommendation systems

### **✅ MINIMAL RISK (Score 0-24)**
- **Status:** No specific obligations
- **Action:** Voluntary compliance with ethics guidelines
- **Examples:** Spam filters, translation, data analysis

## 🔧 **Webhook Configuration**

### **ElevenLabs Webhook Setup:**
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Navigate to your agent settings
3. Find "Webhooks" or "Post-call webhook" section
4. Add webhook URL: `https://ktmxfobpnvbrcxdiqjfn.supabase.co/functions/v1/elevenlabs-webhook`
5. Select event: `conversation.ended`
6. Copy the generated secret to Supabase

Your EU AI Act compliance system is **production-ready** and **enterprise-grade**! 🇪🇺🚀