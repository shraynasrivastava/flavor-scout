# 🍦 Flavor Scout

**AI-Powered Flavor Trend Discovery Engine for HealthKart**

Flavor Scout is an intelligent web dashboard that analyzes **real-time news articles and industry content** using advanced AI to discover viral flavor opportunities for HealthKart's brands: **MuscleBlaze**, **HK Vitals**, and **TrueBasics**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css) ![Groq](https://img.shields.io/badge/Groq-AI-FF6B35) ![NewsAPI](https://img.shields.io/badge/NewsAPI-Data-4A90A4) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)

---

## 🎯 The Mission

HealthKart's brands thrive on innovation. To stay ahead, we need to know what consumers crave **before our competitors do**. Flavor Scout scans social chatter to discover the next viral flavor — providing actionable insights that non-technical folks can immediately understand.

---

## ✨ Key Features

### 🔥 Flavor Trend Wall
- **Interactive flavor tags** showing trending keywords with sentiment colors
- **Ranking badges** (1st, 2nd, 3rd) for top trending flavors
- **Click any tag** to see detailed context and mention count
- **Frequency bar chart** with hover effects
- **Top Trending Highlight** card featuring the #1 flavor

### 🧠 AI Decision Engine
- **Selected vs Rejected Ideas** — clear categorization with reasoning
- **Expandable analysis cards** showing Market Demand, Competitor Gap, and Risk Factors
- **Existing Product Comparison** — how new flavors compare to current catalog
- **Promotion Opportunities** — which existing flavors need better marketing
- **Confidence scores** with color-coded indicators

### 👑 Golden Candidate
- **The #1 Strongest Recommendation** highlighted prominently
- **Market Opportunity Analysis** with competitive advantage
- **Pain Points Addressed** — number of customer complaints solved
- **Supporting quotes** from real user discussions
- **vs Current Products** comparison

### 🔴 Consumer Pain Points Panel
- **Clickable cards** — click to reveal opportunity suggestions
- **Frequency visualization** with progress bars
- **Issue categorization** (sweetness, texture, artificial taste, etc.)
- **Auto-generated opportunities** based on complaint type

### 🎯 Brand Filtering
- **Filter by brand** — MuscleBlaze, HK Vitals, TrueBasics, or All
- **Dynamic recommendations** — Golden Candidate updates based on selection
- **Brand-specific insights** with color-coded styling

---

## 🔑 API Keys Setup (REQUIRED)

This project requires **two free API keys** to function:

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
   - 100 requests per day (plenty for demos)
   - Access to news articles from the past month

### 2. Groq API Key (Free)

1. **Visit Groq Console**
   - Go to: https://console.groq.com/keys
   
2. **Sign Up / Log In**
   - Create a free account (Google/GitHub sign-in available)

3. **Create API Key**
   - Click "Create API Key"
   - Give it a name like "FlavorScout"
   - Copy the key immediately (you won't see it again!)

4. **Free Tier Limits**
   - 14,400 requests/day
   - 30 requests/minute

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- NewsAPI account (free)
- Groq account (free)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/flavor-scout.git
cd flavor-scout

# 2. Install dependencies
npm install

# 3. Create environment file
touch .env.local

# 4. Add your API keys to .env.local
echo "NEWS_API_KEY=your_newsapi_key_here" >> .env.local
echo "GROQ_API_KEY=gsk_your_groq_api_key_here" >> .env.local

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard!

---

## 🏗️ Project Structure

```
flavor-scout/
├── app/
│   ├── page.tsx              # Main dashboard with all sections
│   ├── layout.tsx            # Root layout with fonts (Plus Jakarta Sans)
│   ├── globals.css           # Global styles + Tailwind + glassmorphism
│   └── api/
│       ├── news/route.ts     # News data fetching with caching
│       └── analyze/route.ts  # Groq AI analysis endpoint
├── components/
│   ├── TrendWall.tsx         # Flavor tags + frequency chart
│   ├── DecisionEngine.tsx    # Selected vs Rejected with expandable analysis
│   ├── GoldenCandidate.tsx   # Top recommendation hero card
│   ├── BrandSelector.tsx     # Brand filter with icons & taglines
│   └── LoadingState.tsx      # Animated loading state
├── lib/
│   ├── types.ts              # TypeScript interfaces for all data
│   ├── news.ts               # NewsAPI client with 10-min caching
│   └── groq.ts               # Groq AI client + comprehensive prompt
└── .env.local                # API keys (gitignored)
```

---

## 🧪 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + React 19 | Modern React with App Router |
| **Styling** | Tailwind CSS | Utility-first + custom glassmorphism |
| **Animations** | Framer Motion | Physics-based micro-interactions |
| **Charts** | Recharts | Data visualization |
| **Icons** | Lucide React | Professional SVG icons |
| **AI/LLM** | Groq (Llama 3.3 70B) | Fast inference for flavor analysis |
| **Data Source** | NewsAPI | Real-time news about supplements |
| **Fonts** | Plus Jakarta Sans + Inter | Premium typography |
| **Hosting** | Vercel | Free deployment with edge functions |

---

## 📊 How the AI Works

### 1. Data Ingestion
The system queries NewsAPI with 15+ targeted search terms:
- "protein powder flavors India"
- "MuscleBlaze new flavor review"
- "whey protein taste India"
- "HealthKart supplements trending"
- "supplement industry India 2024"
- "fitness nutrition flavors"
- "BCAA electrolyte flavors"
- Plus competitor terms (ON, MyProtein, Dymatize)

### 2. AI Analysis Pipeline
```
News Articles → Content Extraction → Groq LLM Analysis → Structured JSON
```

The AI prompt includes:
- **Current HealthKart Product Catalog** — What we already sell
- **Competitor Flavors** — What ON, MyProtein, Dymatize offer
- **Missing Gaps** — What flavors are missing from each product
- **Promotion Opportunities** — Undermarketed existing flavors

### 3. Output Structure
- **Trending Keywords**: Specific flavor names (not generic terms)
- **Negative Mentions**: Complaints about current products
- **6+ Recommendations**: At least 2 per brand
- **Golden Candidate**: The single best opportunity
- **Analysis Insights**: Executive summary

### 4. Intelligent Caching
- NewsAPI responses cached for **10 minutes**
- "Refresh" button uses cache
- "Force New" button bypasses cache
- Reduces API calls and improves UX

---

## 🎯 Brand Profiles

| Brand | Target Audience | Flavor Style | Products |
|-------|-----------------|--------------|----------|
| **MuscleBlaze** 🟠 | Hardcore gym enthusiasts | Bold, intense, Indian fusion | Biozyme Whey, BCAA, Pre-Workout |
| **HK Vitals** 🩵 | Wellness-focused consumers | Light, refreshing, natural | Electrolytes, Multivitamins, Biotin |
| **TrueBasics** 🟣 | Premium health seekers | Sophisticated, unique | Plant Protein, Marine Collagen |

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
   | Variable | Value |
   |----------|-------|
   | `NEWS_API_KEY` | Your NewsAPI key |
   | `GROQ_API_KEY` | Your Groq API key |

4. **Deploy** — Your app will be live in ~1 minute!

---

## 🔧 Troubleshooting

| Error | Solution |
|-------|----------|
| "NewsAPI key is required" | Add `NEWS_API_KEY` to `.env.local` |
| "Groq API key is required" | Add `GROQ_API_KEY` to `.env.local` (starts with `gsk_`) |
| "No articles found" | NewsAPI rate limit — wait or check key validity |
| "Request too large" | Automatic — system truncates input to fit token limits |
| "Analysis failed" | Refresh page or check browser console |

---

## 📚 Additional Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — System design and data flow
- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** — Detailed technical specs
- **[LOOM_SPEECH.md](./LOOM_SPEECH.md)** — Video walkthrough script

---

## 📝 License

MIT License — feel free to use and modify!

---

**Built with ❤️ for HealthKart by Shrayna Srivastava**
