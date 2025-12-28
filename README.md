# 🍦 Flavor Scout

**AI-Powered Social Flavor Trend Discovery Engine for HealthKart**

Flavor Scout is a web dashboard that analyzes **real** Reddit discussions using AI to discover viral flavor opportunities for HealthKart's brands: **MuscleBlaze**, **HK Vitals**, and **TrueBasics**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css) ![Groq](https://img.shields.io/badge/Groq-AI-FF6B35) ![Reddit](https://img.shields.io/badge/Reddit-API-FF4500?logo=reddit)

---

## ✨ Features

### 🔥 Trend Wall
- Interactive word cloud showing trending flavor keywords
- Frequency bar chart with sentiment indicators (positive/negative/neutral)
- Real-time visualization of what consumers are discussing on Reddit

### 🧠 Decision Engine
- AI-curated recommendations split into Selected vs Rejected ideas
- Each idea includes: Flavor name, Brand fit, Confidence score, and "Why it works" explanation
- Brand-specific filtering for MuscleBlaze, HK Vitals, or TrueBasics

### 👑 Golden Candidate
- Highlights the #1 strongest recommendation
- Includes market opportunity analysis and supporting user quotes
- Clear, actionable insight for product teams

---

## 🔑 API Keys Setup (REQUIRED)

This project requires **real API credentials** - no mock data. You need both:

### 1. Reddit API Credentials

#### Step-by-Step Guide:

1. **Go to Reddit Apps Page**
   - Visit: https://www.reddit.com/prefs/apps
   - Log in with your Reddit account (create one if needed)

2. **Create a New App**
   - Scroll to the bottom and click **"create another app..."** or **"are you a developer? create an app..."**
   
3. **Fill in the App Details**
   ```
   Name: FlavorScout (or any name you prefer)
   App type: ✅ Select "script" (this is important!)
   Description: Flavor trend analysis tool (optional)
   About URL: (leave blank)
   Redirect URI: http://localhost:3000 (required but not used)
   ```

4. **Click "create app"**

5. **Get Your Credentials**
   After creation, you'll see your app listed. Look for:
   
   ```
   FlavorScout
   personal use script
   ─────────────────────────────────
   client_id: abc123xyz    ← This is right under "personal use script"
   secret: def456uvw       ← Click "edit" to see the secret
   ```

   - **REDDIT_CLIENT_ID**: The string under your app name (e.g., `abc123xyz`)
   - **REDDIT_CLIENT_SECRET**: Click "edit" to reveal the secret
   - **REDDIT_USERNAME**: Your Reddit username
   - **REDDIT_PASSWORD**: Your Reddit password

6. **Important Notes**
   - Your Reddit account must have email verified
   - 2FA users: Create an app-specific password or disable 2FA temporarily
   - The "script" type is essential - other types won't work

### 2. Groq API Key

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
- Reddit account with verified email
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

4. **Add your API credentials to `.env.local`**
   ```env
   # Reddit API (Required)
   REDDIT_CLIENT_ID=your_client_id_here
   REDDIT_CLIENT_SECRET=your_client_secret_here
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password

   # Groq API (Required)
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
│   ├── reddit.ts             # Reddit API client
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
| Data Source | Reddit API (Snoowrap) | Real social media data ingestion |
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
   In Vercel project settings → Environment Variables, add ALL of these:
   
   | Variable | Value |
   |----------|-------|
   | `REDDIT_CLIENT_ID` | Your Reddit app client ID |
   | `REDDIT_CLIENT_SECRET` | Your Reddit app secret |
   | `REDDIT_USERNAME` | Your Reddit username |
   | `REDDIT_PASSWORD` | Your Reddit password |
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

1. **Data Ingestion**: Fetches real posts and comments from supplement-related subreddits
2. **Noise Filtering**: AI removes spam, off-topic content, and irrelevant discussions
3. **Flavor Extraction**: Identifies flavor mentions with sentiment analysis
4. **Recommendation Generation**: Creates actionable suggestions with "Why it works" explanations
5. **Brand Matching**: Assigns flavors to the most appropriate HealthKart brand

### Subreddits Analyzed:
- r/Supplements
- r/fitness
- r/indianfitness
- r/gainit
- r/nutrition
- r/bodybuilding
- r/veganfitness
- r/HealthyFood

---

## 🔧 Troubleshooting

### "Reddit authentication failed"
- Verify your Reddit credentials are correct
- Make sure your Reddit account has a verified email
- Check that you selected "script" type when creating the app
- If using 2FA, you may need to create an app-specific password

### "Groq API key is required"
- Make sure you've added `GROQ_API_KEY` to `.env.local`
- The key should start with `gsk_`
- Try generating a new key if the old one doesn't work

### "No posts found"
- Reddit rate limiting - wait a few minutes and try again
- Check if your Reddit credentials are correct
- Ensure your Reddit account is in good standing

---

## 📝 License

MIT License - feel free to use and modify!

---

Built with ❤️ for HealthKart by Shrayna Srivastava
