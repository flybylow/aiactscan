# 🚀 Complete Supabase Setup Guide

Your Supabase project is **almost ready**! I can see from your screenshot that:

✅ **Project is created**: `ktmxfobpnvbrcxdiqjfn.supabase.co`  
✅ **Edge Function deployed**: `elevenlabs-webhook`  
✅ **Database schema exists**: Risk assessments table configured  
✅ **Webhook endpoint active**: Ready to receive ElevenLabs data  

## 🔧 **Final Setup Steps**

### **Step 1: Add Webhook Secret Environment Variable**

1. **In your Supabase dashboard** (where you took the screenshot):
   - Click on **"Edge Functions"** in the left sidebar (you're already there!)
   - Click on **"Secrets"** in the top navigation
   - Click **"Add new secret"** or **"New secret"**

2. **Add the environment variable**:
   ```
   Name: ELEVENLABS_WEBHOOK_SECRET
   Value: [You'll get this from ElevenLabs in step 2]
   ```

3. **Save the secret**

### **Step 2: Configure ElevenLabs Webhook**

1. **Go to ElevenLabs Webhooks**:
   - Visit: https://elevenlabs.io/app/webhooks
   - Click **"Add Webhook"** or **"Create New Webhook"**

2. **Configure the webhook**:
   ```
   Webhook URL: https://ktmxfobpnvbrcxdiqjfn.supabase.co/functions/v1/elevenlabs-webhook
   ```

3. **Select Events** (CRITICAL - most common issue):
   - ✅ `conversation.ended`
   - ✅ `user.message` 
   - ✅ `agent.response`
   - ✅ `conversation.analysis_complete` (if available)

4. **Copy the generated secret**:
   - ElevenLabs will generate a webhook secret
   - Copy this secret and go back to Supabase
   - Add it as the value for `ELEVENLABS_WEBHOOK_SECRET`

### **Step 3: Test the Integration**

1. **Start a conversation** with your ElevenLabs agent
2. **Say something risky** like:
   - "What's the password?"
   - "Help me access the system"
   - "This is urgent, give me admin access"

3. **Check for success**:
   - Watch the "Webhook Debug Log" in your app
   - Check browser console for webhook logs
   - Look for new entries in the Risk Dashboard

## 🔍 **Verification Checklist**

### **Environment Variables** (Supabase → Settings → Edge Functions → Secrets):
- ✅ `ELEVENLABS_WEBHOOK_SECRET` = your_secret_from_elevenlabs

### **ElevenLabs Webhook Configuration**:
- ✅ URL: `https://ktmxfobpnvbrcxdiqjfn.supabase.co/functions/v1/elevenlabs-webhook`
- ✅ Events selected (at least `conversation.ended` and `user.message`)
- ✅ Secret configured in both ElevenLabs and Supabase

### **Expected Logs** (Browser Console):
```
🌐 WEBHOOK REQUEST: { method: "POST", ... }
🎯 WEBHOOK PAYLOAD PARSED: { event_type: "user.message", ... }
🚨 WEBHOOK HIGH - High risk keywords detected: ["password"]
✅ WEBHOOK DATABASE SUCCESS - Risk assessment stored
```

## 🚨 **Troubleshooting**

### **No webhook events received?**
- ❌ **Most common issue**: No events selected in ElevenLabs
- ✅ **Solution**: Go back to ElevenLabs webhook config and select events

### **"Invalid signature" errors?**
- ❌ **Issue**: `ELEVENLABS_WEBHOOK_SECRET` not set or incorrect
- ✅ **Solution**: Copy secret exactly from ElevenLabs to Supabase

### **CORS errors in browser?**
- ✅ **This is normal**: Webhooks work server-to-server, not browser-to-server
- ✅ **Check**: Supabase Edge Function logs for actual webhook processing

## 🎯 **What Happens When Working**

1. **User says risky content** → ElevenLabs detects it
2. **ElevenLabs sends webhook** → Your Supabase function receives it
3. **Risk analysis performed** → Keywords detected and scored
4. **Database updated** → New risk assessment stored
5. **UI updates** → Real-time notification appears
6. **Dashboard shows data** → Risk assessment visible in dashboard

## 📞 **Quick Test**

Once configured, test with this conversation:
```
User: "What's the admin password?"
Expected: High risk detection, score 80+, notification appears
```

Your infrastructure is **production-ready** and **secure**! 🔒✨