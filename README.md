# 🇪🇺 Scan your AI Act risk (free)

**Real-time EU AI Act compliance assessment for your AI systems**

A production-ready web application that analyzes conversations with AI systems to determine their risk level under the EU AI Act. Get instant compliance assessments, risk categorization, and regulatory guidance.

![AI Act Scan Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=AI+Act+Scan+Demo)

## 🎯 What It Does

**Scan your AI Act risk** is an intelligent compliance tool that:

### 🔍 **Real-Time Risk Assessment**
- **Analyzes conversations** with your AI systems in real-time
- **Detects EU AI Act keywords** and risk patterns during interactions
- **Provides instant feedback** on compliance status
- **Categorizes AI systems** according to EU AI Act risk levels

### 🇪🇺 **EU AI Act Compliance**
- **PROHIBITED Systems** (🚫): Banned AI systems like social scoring, mass surveillance
- **HIGH-RISK Systems** (⚠️): Recruitment AI, educational assessment, medical diagnosis
- **LIMITED RISK Systems** (📋): Chatbots, deepfakes, recommendation systems  
- **MINIMAL RISK Systems** (✅): Spam filters, translation, data analysis

### 📊 **Comprehensive Analysis**
- **Risk scoring** from 0-100 based on conversation content
- **Compliance requirements** specific to each risk category
- **Detailed explanations** of why systems are categorized as they are
- **Audit trail** with complete conversation analysis

### 🚨 **Smart Alerting**
- **Instant notifications** for prohibited and high-risk AI systems
- **Visual indicators** showing current risk status
- **Dashboard view** with detailed assessment history
- **Real-time monitoring** of ongoing conversations

## 🚀 Key Features

### ✨ **Voice & Text Interaction**
- **ElevenLabs integration** for natural voice conversations
- **Text input support** for written descriptions
- **Real-time transcription** and analysis
- **Multi-modal risk detection**

### 🛡️ **Enterprise-Grade Security**
- **Webhook signature verification** for secure data transmission
- **Row-level security** in database
- **CORS protection** and secure API endpoints
- **Production-ready architecture**

### 📈 **Advanced Analytics**
- **Keyword pattern matching** for EU AI Act categories
- **Social engineering detection** 
- **Urgency tactic identification**
- **Comprehensive risk factor analysis**

### 🎛️ **Customizable Configuration**
- **Industry-specific keywords** (Financial, Healthcare, Government, Tech)
- **Adjustable risk thresholds** and scoring weights
- **Custom compliance requirements**
- **Flexible risk categorization**

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ElevenLabs    │    │   React App      │    │   Supabase      │
│   Voice AI      │◄──►│   Frontend       │◄──►│   Backend       │
│                 │    │                  │    │                 │
│ • Voice Chat    │    │ • Risk Display   │    │ • Database      │
│ • Transcription │    │ • Notifications  │    │ • Edge Functions│
│ • Webhooks      │    │ • Dashboard      │    │ • Real-time     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🔄 **How It Works**

1. **Start Conversation**: User describes their AI system via voice or text
2. **Real-Time Analysis**: Keywords are detected and analyzed during conversation
3. **Risk Assessment**: EU AI Act compliance rules are applied
4. **Webhook Processing**: Complete conversation analysis via ElevenLabs webhooks
5. **Results Display**: Risk category, score, and compliance requirements shown
6. **Dashboard Storage**: Assessment saved for audit and review

## 📦 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free tier available)
- **ElevenLabs account** with Conversational AI access
- **Git** for cloning the repository

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ai-act-scan.git
cd ai-act-scan
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ElevenLabs Configuration  
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
```

### 3. Supabase Setup

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`

#### B. Deploy Database Schema
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_id

# Deploy database migrations
supabase db push
```

#### C. Deploy Edge Functions
```bash
# Deploy the EU AI Act webhook function
supabase functions deploy elevenlabs-webhook
```

### 4. ElevenLabs Setup

#### A. Get API Credentials
1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app)
2. Create a Conversational AI agent
3. Copy your API key and Agent ID to `.env`

#### B. Configure Webhook
1. In your ElevenLabs agent settings, find "Webhooks"
2. Add webhook URL: `https://your_supabase_project.supabase.co/functions/v1/elevenlabs-webhook`
3. Select event: `conversation.ended`
4. Copy the generated webhook secret

#### C. Add Webhook Secret to Supabase
1. Go to Supabase Dashboard → Settings → Edge Functions → Secrets
2. Add secret:
   - **Name**: `ELEVENLABS_WEBHOOK_SECRET`
   - **Value**: Your webhook secret from ElevenLabs
3. Save the secret

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🧪 Testing the Installation

### Quick Test Phrases

Try these phrases to verify the system is working:

#### 🚫 **PROHIBITED** (Should show red alert):
```
"I have a social scoring system that rates citizens"
```

#### ⚠️ **HIGH-RISK** (Should show orange alert):
```
"I have an AI system for recruitment and hiring decisions"
```

#### 📋 **LIMITED RISK** (Should show yellow alert):
```
"I have a chatbot that interacts with customers"
```

#### ✅ **MINIMAL RISK** (Should show green status):
```
"I have a spam filter for emails"
```

### Expected Results

When working correctly:
- ✅ Top bar shows risk category (e.g., "PROHIBITED (95)")
- ✅ Colored notification popup appears
- ✅ Console shows webhook processing logs
- ✅ Dashboard displays new assessment

## 🔧 Configuration

### Custom Keywords

Edit `supabase/functions/elevenlabs-webhook/risk-keywords.ts` to customize:

```typescript
// Add industry-specific keywords
const FINANCIAL_KEYWORDS = [
  'account number', 'routing number', 'swift code'
];

const HEALTHCARE_KEYWORDS = [
  'patient records', 'medical history', 'phi'
];
```

### Risk Thresholds

Adjust scoring in the same file:

```typescript
export const RISK_SCORING_CONFIG = {
  THRESHOLDS: {
    CRITICAL: 90,    // PROHIBITED systems
    HIGH: 60,        // HIGH-RISK systems  
    MEDIUM: 25,      // LIMITED RISK systems
    LOW: 0           // MINIMAL RISK systems
  }
};
```

## 📊 Usage Examples

### For Compliance Teams
- **Assess new AI projects** before deployment
- **Audit existing AI systems** for EU AI Act compliance
- **Generate compliance reports** with detailed risk analysis
- **Monitor ongoing AI operations** for regulatory changes

### For Developers
- **Test AI system descriptions** during development
- **Validate compliance** before production deployment
- **Understand regulatory requirements** for different AI categories
- **Integrate compliance checks** into CI/CD pipelines

### For Legal Teams
- **Review AI system classifications** under EU AI Act
- **Understand compliance obligations** for each risk category
- **Generate audit trails** for regulatory submissions
- **Stay updated** on AI regulatory requirements

## 🛠️ Admin Panel

Access the admin panel via the settings icon for:

- **System Status**: Environment variables and webhook configuration
- **Setup Guide**: Step-by-step configuration instructions  
- **Testing Tools**: Webhook testing and data simulation
- **Database Tests**: Health checks and connectivity verification
- **Live Chat**: Real-time analysis logs and monitoring

## 🔒 Security Features

- **Webhook signature verification** prevents unauthorized requests
- **Row-level security** protects sensitive data
- **CORS protection** secures API endpoints
- **Environment variable protection** keeps secrets safe
- **Real-time monitoring** detects suspicious activity

## 📈 Monitoring & Analytics

- **Real-time risk assessment** during conversations
- **Historical analysis** of all assessments
- **Trend monitoring** for risk patterns
- **Compliance reporting** with detailed breakdowns
- **Audit trails** for regulatory compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **Setup Guides**: Check the `docs/` folder for detailed setup instructions
- **Testing Guide**: `docs/EU_AI_ACT_TESTING_GUIDE.md`
- **Webhook Setup**: `docs/WEBHOOK_SECRET_SETUP.md`

### Troubleshooting

**No webhook data received?**
1. Check ElevenLabs webhook configuration
2. Verify webhook secret in Supabase
3. Test with admin panel tools

**Wrong risk categories?**
1. Use more explicit AI system descriptions
2. Check keyword matches in console logs
3. Customize keywords for your industry

**Connection issues?**
1. Verify environment variables
2. Check API key permissions
3. Test database connectivity

### Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the `docs/` folder for guides

## 🌟 Features Roadmap

- [ ] **Multi-language support** for international compliance
- [ ] **API endpoints** for programmatic access
- [ ] **Slack/Teams integration** for team notifications
- [ ] **PDF report generation** for compliance documentation
- [ ] **Advanced analytics dashboard** with charts and trends
- [ ] **Custom compliance frameworks** beyond EU AI Act

---

**Built with ❤️ for EU AI Act compliance**

*Helping organizations navigate AI regulation with confidence*