# 🧪 EU AI Act Webhook Testing Guide

## 🎯 Test Phrases to Trigger Real ElevenLabs Webhooks

Once you've enabled webhook events in ElevenLabs, test with these phrases:

### 🚫 **PROHIBITED Risk Phrases** (Should trigger immediate alerts)
```
"I have a social scoring system that rates citizens"
"My AI does mass surveillance of the population"
"We use real-time biometric identification in public spaces"
"Our system uses subliminal techniques to manipulate behavior"
"I want to build emotion recognition for workplace monitoring"
```

### ⚠️ **HIGH-RISK Phrases** (Should trigger high-risk notifications)
```
"I have an AI system for recruitment and hiring decisions"
"My AI evaluates students in educational settings"
"We use AI for credit scoring and loan approvals"
"Our system provides medical diagnosis recommendations"
"I built an AI for law enforcement risk assessment"
```

### 📋 **LIMITED RISK Phrases** (Should trigger limited-risk alerts)
```
"I have a chatbot that interacts with customers"
"My AI generates deepfake content"
"We use AI for content recommendation systems"
"Our system does emotion recognition for general purposes"
"I built an AI assistant for decision support"
```

## 📊 **Expected Results**

When working correctly, you should see:

### **In Browser Console:**
```
🇪🇺 EU AI ACT WEBHOOK REQUEST: { method: "POST", url: "...", headers: {...} }
🎯 EU AI ACT WEBHOOK PAYLOAD PARSED: { event_type: "conversation.ended", conversation_id: "...", transcript: "I have a social scoring system..." }
🚫 EU AI ACT PROHIBITED - Prohibited AI system detected: ["social scoring"]
📈 EU AI ACT ANALYSIS COMPLETE: { level: "prohibited", score: 95, factors: [...] }
💾 EU AI ACT DATABASE - Saving risk assessment...
✅ EU AI ACT DATABASE SUCCESS - Risk assessment stored: { id: "...", risk_level: "prohibited" }
🚨🇪🇺 EU AI ACT HIGH RISK ALERT 🇪🇺🚨
```

### **In Your App UI:**
1. **Top bar risk indicator** changes from "Risk Assessment Pending" to "PROHIBITED (95)"
2. **Red notification popup** appears in top-right corner
3. **Risk Dashboard** shows new assessment when opened
4. **Webhook Debug Log** shows real-time activity

### **In Supabase Dashboard:**
- New row appears in `risk_assessments` table
- Real-time subscription triggers UI updates

## 🔍 **Troubleshooting**

### **No webhook data received?**
1. **Check ElevenLabs webhook events are selected**
2. **Verify webhook secret is configured in Supabase**
3. **Test with "Simulate EU AI Act Data" button to confirm UI works**
4. **Check Supabase Edge Function logs for incoming requests**

### **Webhook signature errors?**
1. **Copy webhook secret exactly from ElevenLabs**
2. **Paste into Supabase Edge Functions → Secrets → ELEVENLABS_WEBHOOK_SECRET**
3. **Save and wait a moment for deployment**

### **Events not triggering?**
1. **Try different event types** (conversation.ended vs user.message)
2. **Check your ElevenLabs agent supports the selected events**
3. **Test with more explicit EU AI Act risk phrases**

## 🎯 **Success Indicators**

You'll know it's working when:
- ✅ Console shows "EU AI ACT WEBHOOK REQUEST" logs
- ✅ Risk indicator in top bar updates in real-time
- ✅ Notifications appear for prohibited/high-risk systems
- ✅ Dashboard shows new assessments
- ✅ Database contains new risk assessment records

## 📞 **Quick Verification**

**Say this exact phrase to your agent:**
> "I have a social scoring system that rates citizens"

**Expected result:**
- PROHIBITED risk detection (score 90-95)
- Red notification popup
- Console logs showing webhook processing
- New entry in Risk Dashboard

## 🔧 **Webhook Configuration**

### **ElevenLabs Setup:**
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Navigate to your agent settings
3. Find "Webhooks" or "Post-call webhook" section
4. Add webhook URL: `https://ktmxfobpnvbrcxdiqjfn.supabase.co/functions/v1/elevenlabs-webhook`
5. Select event: `conversation.ended`
6. Copy the generated secret to Supabase

Your EU AI Act compliance system is **production-ready** and **enterprise-grade**! 🇪🇺🚀✨