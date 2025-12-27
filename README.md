# 🏥 HealthWise - AI-Powered Health Analysis Platform

> An intelligent health companion powered by **Google Gemini AI** and monitored with **Weights & Biases**

HealthWise is a Next.js-based health analysis platform that leverages cutting-edge AI technology to provide personalized disease predictions, medication suggestions, and diet plans based on user symptoms and health profiles.

---

## 🌟 Key Features

### 🤖 **Dual-Source Disease Prediction**
- **Database-First Approach**: Searches a comprehensive medical dataset (CSV) for symptom matches
- **AI Fallback**: When no database matches are found, **Google Gemini 2.0 Flash** generates predictions using advanced medical knowledge
- **Source Transparency**: Users can see whether predictions came from the database or AI

### 💊 **Personalized Health Recommendations**
- **Disease Prediction**: Identifies possible conditions based on symptoms
- **Medication Suggestions**: Provides appropriate medication recommendations with medical disclaimers
- **Diet Charts**: Generates 7-day personalized diet plans tailored to:
  - Predicted condition
  - Age, gender, weight, height
  - Activity level
  - Dietary restrictions and allergies
- **Workout Plans**: Includes exercise recommendations based on health profile

### 📊 **Weights & Biases Integration**
- **Real-time Monitoring**: Tracks all health analysis requests
- **Performance Metrics**: Logs analysis duration, success rates, and error tracking
- **User Analytics**: Monitors symptom patterns, age demographics, and prediction accuracy
- **Run Tracking**: Each analysis session is logged with detailed metadata

---

## 🏗️ Architecture

### **Tech Stack**

#### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Clerk

#### AI & Backend
- **AI Framework**: Firebase Genkit 1.14.1
- **AI Model**: Google Gemini 2.0 Flash Experimental
- **AI Provider**: `@genkit-ai/googleai`
- **Monitoring**: Weights & Biases SDK (`@wandb/sdk`)
- **Data Processing**: CSV parsing for medical datasets

---

## 🤖 Google Gemini AI Integration

### **How It Works**

HealthWise uses **Firebase Genkit** as an AI orchestration framework with **Google Gemini 2.0 Flash** as the underlying model.

#### **1. Disease Prediction Flow** (`predict-possible-diseases.ts`)

```typescript
// Hybrid approach: Database + AI
1. Search CSV dataset for symptom matches
2. If matches found → Return database results
3. If no matches → Use Gemini AI to predict diseases
4. Track source (database vs AI) for transparency
```

**Gemini AI Prompt Example:**
```
You are a medical AI assistant. Based on the following symptoms, 
predict 3-5 possible diseases or medical conditions.

Symptoms: fever, headache, cough

Provide ONLY the disease names, one per line, without numbering, 
bullets, or explanations. Be specific and medically accurate.
```

#### **2. Medication Suggestion Flow** (`suggest-appropriate-medications.ts`)

```typescript
// Uses Genkit tools for knowledge retrieval
1. Use getConditionInfoTool to search medical database
2. Match predicted disease with medication data
3. If no match → Gemini AI generates recommendations
4. Always includes medical disclaimer
```

**Features:**
- Tool-augmented generation (RAG pattern)
- Structured output with Zod schemas
- Fallback to AI when database lacks information

#### **3. Personalized Diet Chart Flow** (`generate-personalized-diet-charts.ts`)

```typescript
// Highly personalized AI generation
1. Retrieve condition-specific diet guidelines from database
2. Gemini AI personalizes based on:
   - Age, gender, weight, height
   - Activity level (sedentary to extra active)
   - Dietary restrictions (vegetarian, allergies, etc.)
3. Generate 7-day meal plan with breakfast, lunch, dinner, snacks
4. Include workout routine and precautions
```

**Gemini Capabilities Used:**
- Long-context understanding (user profile + medical data)
- Structured markdown output
- Multi-turn reasoning with tool calls

### **Genkit Tools**

#### `getConditionInfoTool`
- Searches local medical knowledge base
- Returns disease info, medications, diets, workouts, precautions
- Enables RAG (Retrieval-Augmented Generation) pattern

#### `predictDiseaseFromDatasetTool`
- Matches symptoms against CSV dataset
- Returns confidence scores
- Provides matched symptom details

---

## 📊 Weights & Biases Integration

### **Monitoring & Analytics** (`src/lib/wandb.ts`)

HealthWise logs every health analysis request to W&B for comprehensive monitoring:

#### **Tracked Metrics**

```typescript
// Success Metrics
{
  event: 'health_analysis_success',
  duration_ms: 7600,              // Analysis time
  age: 30,                        // User demographics
  gender: 'male',
  symptoms_count: 3,              // Number of symptoms
  predicted_disease: 'Common Cold',
  diseases_found: 5               // Number of predictions
}

// Error Tracking
{
  event: 'health_analysis_error',
  error: 'AI model timeout'
}

// Validation Errors
{
  event: 'validation_error',
  error: 'No symptoms provided'
}
```

#### **W&B Dashboard Features**
- **Run Tracking**: Each analysis is a separate W&B run
- **Performance Monitoring**: Track API latency and success rates
- **User Insights**: Analyze symptom patterns and demographics
- **Error Analysis**: Identify and debug AI failures
- **A/B Testing Ready**: Compare database vs AI prediction accuracy

### **Implementation**

```typescript
// Automatic logging in actions.ts
await initWandb();                    // Initialize W&B
const startTime = Date.now();

// ... perform analysis ...

logMetrics({                          // Log success
  event: 'health_analysis_success',
  duration_ms: Date.now() - startTime,
  // ... other metrics
});

await finishRun();                    // Close W&B run
```

**View your runs at**: `https://wandb.ai/[your-username]/healthwise/runs`

---

## 📁 Project Structure

```
HeathWise/
├── src/
│   ├── ai/                          # Gemini AI Integration
│   │   ├── genkit.ts               # Genkit configuration (Gemini 2.0 Flash)
│   │   ├── flows/                  # AI workflows
│   │   │   ├── predict-possible-diseases.ts
│   │   │   ├── suggest-appropriate-medications.ts
│   │   │   └── generate-personalized-diet-charts.ts
│   │   └── tools/                  # Genkit tools (RAG)
│   │       ├── get-condition-info.ts
│   │       └── predict-disease-from-dataset.ts
│   ├── app/
│   │   ├── actions.ts              # Server actions (W&B logging)
│   │   ├── page.tsx                # Main UI
│   │   └── layout.tsx
│   ├── components/
│   │   ├── health-form.tsx         # Symptom input form
│   │   └── results-display.tsx     # Analysis results UI
│   ├── lib/
│   │   ├── wandb.ts                # Weights & Biases integration
│   │   └── schemas.ts              # Zod validation schemas
│   └── services/
│       └── health-data-service.ts  # CSV dataset reader
├── docs/
│   └── medicine-recommendation-system-dataset/
│       ├── dataset.csv             # Main disease-symptom dataset
│       ├── medications.csv
│       ├── diets.csv
│       ├── workout_df.csv
│       └── precautions_df.csv
└── package.json
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 20+
- npm or yarn
- Google AI API Key (for Gemini)
- Weights & Biases account (optional, for monitoring)
- Clerk account (for authentication)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HeathWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:
   ```env
   # Google AI (Gemini)
   GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   
   # Weights & Biases
   WANDB_API_KEY=your_wandb_api_key_here
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:9002](http://localhost:9002)

### **Additional Commands**

```bash
# Run Genkit development UI (for testing AI flows)
npm run genkit:dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENAI_API_KEY` | Google AI API key for Gemini | ✅ Yes |
| `WANDB_API_KEY` | Weights & Biases API key | ⚠️ Optional (logging disabled if missing) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | ✅ Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ Yes |

---

## 🎯 Usage Example

### **1. Enter Symptoms**
```
fever, headache, cough
```

### **2. Provide Health Profile**
- Age: 30
- Gender: Male
- Weight: 70 kg
- Height: 175 cm
- Activity Level: Moderately Active
- Dietary Restrictions: None

### **3. Get AI-Powered Analysis**

**Disease Predictions** (with source badge):
- 📊 Database Match: Common Cold, Bronchial Asthma, Malaria
- 🤖 AI Prediction: Influenza, COVID-19

**Medication Suggestions**:
- Paracetamol for fever
- Antihistamines for cold symptoms
- *Disclaimer: Consult a healthcare provider*

**7-Day Diet Chart**:
- Personalized meals based on your profile
- Caloric intake adjusted for activity level
- Respects dietary restrictions

---

## 🧪 Testing AI Flows

Use Genkit's development UI to test individual AI flows:

```bash
npm run genkit:dev
```

This opens a local UI where you can:
- Test `predictPossibleDiseases` flow
- Test `suggestAppropriateMedications` flow
- Test `generatePersonalizedDietChart` flow
- View AI traces and debug prompts
- Monitor token usage

---

## 📊 Monitoring with W&B

### **View Your Dashboard**

1. Go to [wandb.ai](https://wandb.ai)
2. Navigate to your `healthwise` project
3. View metrics:
   - Analysis success rate
   - Average response time
   - User demographics
   - Error logs

### **Custom Metrics**

Add custom metrics in `src/app/actions.ts`:

```typescript
logMetrics({
  custom_metric: 'your_value',
  // ... other metrics
});
```

---

## 🔒 Security & Privacy

- ✅ **No PHI Storage**: User data is not stored permanently
- ✅ **Secure Authentication**: Clerk handles user auth
- ✅ **API Key Protection**: Environment variables for sensitive keys
- ✅ **Medical Disclaimer**: All outputs include professional consultation warnings
- ⚠️ **Not a Medical Device**: For educational purposes only

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Google Gemini AI**: Powering intelligent health predictions
- **Weights & Biases**: Enabling comprehensive monitoring and analytics
- **Firebase Genkit**: Simplifying AI orchestration
- **Medical Dataset**: Medicine recommendation system dataset
- **shadcn/ui**: Beautiful UI components

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check W&B logs for debugging
- Review Genkit traces for AI flow issues

---

**⚠️ Medical Disclaimer**: HealthWise provides information for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.
