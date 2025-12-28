# 🍦 Flavor Scout

**AI-Powered Flavor Trend Discovery Engine for HealthKart**

Flavor Scout is a web dashboard that analyzes **news articles and industry content** using AI to discover viral flavor opportunities for HealthKart's brands: **MuscleBlaze**, **HK Vitals**, and **TrueBasics**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css) ![Groq](https://img.shields.io/badge/Groq-AI-FF6B35) ![NewsAPI](https://img.shields.io/badge/NewsAPI-Data-4A90A4)

---

## ✨ Features

### 🔥 Trend Wall
- Interactive word cloud showing trending flavor keywords
- Frequency bar chart with sentiment indicators (positive/negative/neutral)
- Real-time visualization of what the industry is discussing

### 🧠 Decision Engine
- AI-curated recommendations split into Selected vs Rejected ideas
- Each idea includes: Flavor name, Brand fit, Confidence score, and "Why it works" explanation
- Brand-specific filtering for MuscleBlaze, HK Vitals, or TrueBasics

### 👑 Golden Candidate
- Highlights the #1 strongest recommendation
- Includes market opportunity analysis and supporting insights
- Clear, actionable insight for product teams

---

## 🔑 API Keys Setup (REQUIRED)

This project requires **two API keys** to function:

### 1. NewsAPI Key (Free)

#### Step-by-Step Guide:

1. **Go to NewsAPI Registration**
   - Visit: https://newsapi.org/register
   
2. **Create a Free Account**
   - Enter your email and create a password
   - Or sign up with Google
   
3. **Get Your API Key**
   - After registration, you'll see your API key on the dashboard
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   
4. **Free Tier Limits**
   - 100 requests per day (plenty for development and demos)
   - Access to news articles from the past month
   - Perfect for this project!

### 2. Groq API Key (Free)

1. **Visit Groq Console**
   - Go to: https://console.groq.com/keys
   
2. **Sign Up / Log In**
   - Create a free account if you don't have one
   - Google/GitHub sign-in available

3. **Create API Key**
   - Click "Create API Key"
   - Give it a name like "FlavorScout"
   - Copy the key immediately (you won't see it again!)

4. **Free Tier Limits**
   - 14,400 requests/day
   - 30 requests/minute
   - More than enough for this project!

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- NewsAPI account (free)
- Groq account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flavor-scout.git
   cd flavor-scout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env.local file in the project root
   touch .env.local
   ```

4. **Add your API keys to `.env.local`**
   ```env
   # NewsAPI (Required) - Get free key at https://newsapi.org/register
   NEWS_API_KEY=your_newsapi_key_here

   # Groq API (Required) - Get free key at https://console.groq.com/keys
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the dashboard**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
flavor-scout/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout with fonts
│   ├── globals.css           # Global styles + Tailwind
│   └── api/
│       ├── news/route.ts     # News data fetching
│       └── analyze/route.ts  # Groq AI analysis
├── components/
│   ├── TrendWall.tsx         # Word cloud + frequency chart
│   ├── DecisionEngine.tsx    # Selected vs Rejected ideas
│   ├── GoldenCandidate.tsx   # Top recommendation card
│   ├── BrandSelector.tsx     # Brand filter buttons
│   └── LoadingState.tsx      # Loading animation
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── news.ts               # NewsAPI client
│   └── groq.ts               # Groq AI client + prompts
└── .env.local                # API keys (gitignored)
```

---

## 🧪 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 + React | Modern React framework with App Router |
| Styling | Tailwind CSS | Utility-first CSS with custom glassmorphism |
| Animations | Framer Motion | Smooth, physics-based animations |
| Charts | Recharts | Data visualization |
| AI/LLM | Groq (Llama 3.1 70B) | Fast inference for flavor analysis |
| Data Source | NewsAPI | News articles about supplements & fitness |
| Hosting | Vercel | Free deployment with edge functions |

---

## 🌐 Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   In Vercel project settings → Environment Variables, add:
   
   | Variable | Value |
   |----------|-------|
   | `NEWS_API_KEY` | Your NewsAPI key |
   | `GROQ_API_KEY` | Your Groq API key |

4. **Deploy**
   Click "Deploy" - your app will be live in ~1 minute!

---

## 🎯 Brand Profiles

The AI matches flavors to brands based on their positioning:

| Brand | Target Audience | Flavor Style | Color |
|-------|-----------------|--------------|-------|
| **MuscleBlaze** | Hardcore gym enthusiasts | Bold, intense | 🟠 Orange |
| **HK Vitals** | Wellness-focused consumers | Light, refreshing | 🩵 Teal |
| **TrueBasics** | Premium health seekers | Sophisticated, unique | 🟣 Purple |

---

## 📊 How the AI Works

1. **Data Ingestion**: Fetches news articles about supplements, protein, fitness, and Indian health trends
2. **Content Analysis**: AI analyzes headlines and article content for flavor mentions
3. **Trend Extraction**: Identifies trending flavor keywords with sentiment analysis
4. **Recommendation Generation**: Creates actionable suggestions with "Why it works" explanations
5. **Brand Matching**: Assigns flavors to the most appropriate HealthKart brand

### Search Queries Used:
- "protein powder flavors India"
- "MuscleBlaze new flavor"
- "HealthKart supplements"
- "whey protein taste review"
- "supplement trends India"
- "fitness nutrition India"

---

## 🔧 Troubleshooting

### "NewsAPI key is required"
- Make sure you've added `NEWS_API_KEY` to `.env.local`
- Verify the key is correct (no extra spaces)
- The key should be about 32 characters long

### "Groq API key is required"
- Make sure you've added `GROQ_API_KEY` to `.env.local`
- The key should start with `gsk_`
- Try generating a new key if the old one doesn't work

### "No articles found"
- NewsAPI rate limiting - wait a few minutes and try again
- Free tier allows 100 requests/day
- Check if your API key is valid

### "Analysis failed"
- This usually means the Groq API had an issue
- Try refreshing the page
- Check the browser console for detailed errors

---

## 📝 License

MIT License - feel free to use and modify!

---

Built with ❤️ for HealthKart by Shrayna Srivastava
