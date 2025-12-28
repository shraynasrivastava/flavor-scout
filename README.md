# 🍦 Flavor Scout

**AI-Powered Social Flavor Trend Discovery Engine for HealthKart**

Flavor Scout is a web dashboard that analyzes social media discussions (Reddit) using AI to discover viral flavor opportunities for HealthKart's brands: **MuscleBlaze**, **HK Vitals**, and **TrueBasics**.

![Flavor Scout Dashboard](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css) ![Groq](https://img.shields.io/badge/Groq-AI-FF6B35)

---

## ✨ Features

### 🔥 Trend Wall
- Interactive word cloud showing trending flavor keywords
- Frequency bar chart with sentiment indicators (positive/negative/neutral)
- Real-time visualization of what consumers are discussing

### 🧠 Decision Engine
- AI-curated recommendations split into Selected vs Rejected ideas
- Each idea includes: Flavor name, Brand fit, Confidence score, and "Why it works" explanation
- Brand-specific filtering for MuscleBlaze, HK Vitals, or TrueBasics

### 👑 Golden Candidate
- Highlights the #1 strongest recommendation
- Includes market opportunity analysis and supporting user quotes
- Clear, actionable insight for product teams

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Groq API key (free at [console.groq.com](https://console.groq.com/keys))
- Reddit API credentials (optional - uses mock data without them)

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key
   
   # Optional: Reddit API (uses mock data if not provided)
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the dashboard**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys

### Groq API (Required for AI Analysis)
1. Go to [console.groq.com](https://console.groq.com/keys)
2. Sign up for a free account
3. Create a new API key
4. Copy and paste into `.env.local`

### Reddit API (Optional)
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Select "script" as the application type
4. Fill in name and redirect URI (can be http://localhost:3000)
5. Copy the client ID (under the app name) and secret

> **Note:** The app works without Reddit credentials by using realistic mock data for demo purposes.

---

## 🏗️ Project Structure

```
flavor-scout/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout with fonts
│   ├── globals.css           # Global styles + Tailwind
│   └── api/
│       ├── reddit/route.ts   # Reddit data fetching
│       └── analyze/route.ts  # Groq AI analysis
├── components/
│   ├── TrendWall.tsx         # Word cloud + frequency chart
│   ├── DecisionEngine.tsx    # Selected vs Rejected ideas
│   ├── GoldenCandidate.tsx   # Top recommendation card
│   ├── BrandSelector.tsx     # Brand filter buttons
│   └── LoadingState.tsx      # Loading animation
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── reddit.ts             # Reddit API + mock data
│   └── groq.ts               # Groq client + prompts
└── .env.local                # API keys (gitignored)
```

---

## 🧪 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 + React | Modern React framework with App Router |
| Styling | Tailwind CSS | Utility-first CSS |
| Animations | Framer Motion | Smooth, physics-based animations |
| Charts | Recharts | Data visualization |
| AI/LLM | Groq (Llama 3.1 70B) | Fast inference for flavor analysis |
| Data Source | Reddit API (Snoowrap) | Social media data ingestion |
| Hosting | Vercel | Free deployment with edge functions |

---

## 🌐 Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   In Vercel project settings → Environment Variables:
   - `GROQ_API_KEY` = your_groq_api_key
   - `REDDIT_CLIENT_ID` = your_reddit_client_id (optional)
   - `REDDIT_CLIENT_SECRET` = your_reddit_client_secret (optional)
   - `REDDIT_USERNAME` = your_reddit_username (optional)
   - `REDDIT_PASSWORD` = your_reddit_password (optional)

4. **Deploy**
   Click "Deploy" - your app will be live in ~1 minute!

---

## 🎯 Brand Profiles

The AI matches flavors to brands based on their positioning:

| Brand | Target Audience | Flavor Style |
|-------|-----------------|--------------|
| **MuscleBlaze** | Hardcore gym enthusiasts | Bold, intense (Dark Chocolate, Black Coffee) |
| **HK Vitals** | Wellness-focused consumers | Light, refreshing (Mango, Watermelon) |
| **TrueBasics** | Premium health seekers | Sophisticated, unique (Kesar Pista, Green Tea) |

---

## 📊 How the AI Works

1. **Data Ingestion**: Fetches posts and comments from supplement-related subreddits
2. **Noise Filtering**: Removes spam, off-topic content, and irrelevant discussions
3. **Flavor Extraction**: Identifies flavor mentions with sentiment analysis
4. **Recommendation Generation**: Creates actionable suggestions with "Why it works" explanations
5. **Brand Matching**: Assigns flavors to the most appropriate HealthKart brand

The AI uses structured prompts to ensure recommendations are:
- Based on real user pain points
- Explained in plain business language (not technical jargon)
- Actionable for non-technical product managers

---

## 📝 License

MIT License - feel free to use and modify!

---

## 🙋 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

Built with ❤️ for HealthKart by Aniket Gupta
