# 🏗️ Flavor Scout - Architecture Guide

This document explains the technical architecture and design decisions for your Loom video presentation.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLAVOR SCOUT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   NewsAPI   │───▶│  Next.js    │───▶│    Groq     │        │
│   │   (Data)    │    │  API Routes │    │   LLM AI    │        │
│   └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         │                   ▼                   │               │
│         │           ┌─────────────┐             │               │
│         └──────────▶│   React     │◀────────────┘               │
│                     │  Dashboard  │                              │
│                     └─────────────┘                              │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                   │
│         ▼                 ▼                 ▼                   │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐              │
│   │ TrendWall │    │ Decision  │    │  Golden   │              │
│   │           │    │  Engine   │    │ Candidate │              │
│   └───────────┘    └───────────┘    └───────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Data Ingestion (The "Ears")
```
User clicks "Refresh"
        │
        ▼
/api/analyze (Next.js API Route)
        │
        ▼
fetchNewsArticles() from lib/news.ts
        │
        ▼
Call NewsAPI with search queries:
  - "protein powder flavors India"
  - "MuscleBlaze new flavor"
  - "HealthKart supplements"
  - "whey protein taste review"
  - "supplement trends India"
        │
        ▼
Fetch articles + content
        │
        ▼
Return news data for analysis
```

### 2. AI Analysis (The "Brain")
```
Articles + Content from NewsAPI
        │
        ▼
analyzeWithGroq() from lib/groq.ts
        │
        ▼
Structured Prompt to Llama 3.1 70B:
┌─────────────────────────────────────────┐
│ "You are a product analyst for         │
│  HealthKart. Analyze these news        │
│  articles and extract:                  │
│  1. Trending flavor keywords            │
│  2. Recommendations with 'Why it works' │
│  3. The #1 Golden Candidate            │
│                                         │
│  ONLY use data actually present.       │
│  Do NOT hallucinate or invent trends.  │
└─────────────────────────────────────────┘
        │
        ▼
JSON Response with:
- trendKeywords[]
- recommendations[]
- goldenCandidate
- dataQuality metrics
```

### 3. Dashboard Rendering (The "Face")
```
AnalysisResponse from API
        │
        ▼
React Dashboard (app/page.tsx)
        │
        ├──▶ TrendWall.tsx
        │         │
        │         ├── Word Cloud (keyword bubbles)
        │         └── Bar Chart (frequency visualization)
        │
        ├──▶ DecisionEngine.tsx
        │         │
        │         ├── Selected Ideas (green)
        │         └── Rejected Ideas (red)
        │
        └──▶ GoldenCandidate.tsx
                  │
                  └── Hero card with #1 recommendation
```

---

## How the AI Makes Decisions (Avoiding Hallucinations)

### 1. Grounded in Real Data
- The AI ONLY analyzes actual news articles
- No synthetic or mock data is used
- Every recommendation is traceable to real industry content

### 2. Structured Output with Validation
```javascript
// We use JSON mode to ensure parseable, structured output
response_format: { type: 'json_object' }

// Lower temperature for factual, consistent outputs
temperature: 0.4  // (not 0.7 or higher which causes creativity/hallucination)
```

### 3. Explicit Instructions to Prevent Hallucination
The prompt includes:
```
"ONLY extract insights that are ACTUALLY present in the data"
"Do NOT invent or hallucinate flavor requests"
"Base recommendations on actual article content"
```

### 4. Supporting Evidence Required
Every recommendation must include:
- `supportingData`: Actual quotes or paraphrased insights from the data
- `whyItWorks`: Plain business language explanation grounded in articles
- `confidence`: Score based on volume and sentiment of real content

---

## UI/UX Design Decisions

### Why This Layout?

1. **Stats Bar at Top**: Immediate context showing data source metrics
2. **Golden Candidate First**: Most important insight above the fold
3. **Trend Wall Middle**: Visual discovery of trending keywords
4. **Decision Engine Last**: Detailed analysis for deep dives

### Why Dark Mode?

- **Fitness Vibe**: Matches MuscleBlaze's hardcore aesthetic
- **Eye Comfort**: Reduces strain during extended analysis
- **Premium Feel**: Aligns with TrueBasics positioning
- **Better Contrast**: Data visualizations pop more

### Glassmorphism Design

We use glassmorphism (frosted glass effect) because:
- Creates depth without heavy borders
- Modern, premium appearance
- Works well with the brand colors
- Allows background gradients to show through

### Color System

| Color | Usage |
|-------|-------|
| 🟢 Emerald | Positive sentiment, selected ideas |
| 🔴 Red | Negative sentiment, rejected ideas |
| 🟡 Gold/Yellow | Golden candidate, top recommendation |
| 🟣 Purple | Interactive elements, primary actions |
| 🟠 Orange | MuscleBlaze brand |
| 🩵 Teal | HK Vitals brand |
| 🟣 Purple | TrueBasics brand |

---

## API Endpoints

### GET /api/analyze
Main endpoint that orchestrates the entire flow:
1. Validates API credentials
2. Fetches news articles
3. Runs Groq AI analysis
4. Returns combined response

**Response:**
```json
{
  "trendKeywords": [...],
  "flavorMentions": [...],
  "recommendations": [...],
  "goldenCandidate": {...},
  "rawPostCount": 45,
  "analyzedAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/news
Raw news data endpoint (for debugging):
```json
{
  "articles": [...],
  "contentExcerpts": [...],
  "sources": [...],
  "fetchedAt": "..."
}
```

---

## Error Handling

The app handles these scenarios gracefully:

1. **Missing Credentials**: Clear message showing which env vars are missing
2. **NewsAPI Auth Failure**: Helpful troubleshooting guidance
3. **Groq API Error**: Retry option with error details
4. **No Articles Found**: Message suggesting to wait and retry
5. **Rate Limiting**: Graceful degradation with caching headers

---

## NewsAPI Setup

### Getting Your Free API Key

1. Visit https://newsapi.org/register
2. Sign up with email or Google
3. Copy your API key from the dashboard
4. Add to `.env.local`:
   ```
   NEWS_API_KEY=your_key_here
   ```

### Free Tier Limits
- 100 requests per day
- Articles from past month
- Perfect for development and demos

### Search Queries Used
The app searches for relevant content using these queries:
- "protein powder flavors India"
- "MuscleBlaze new flavor"
- "HealthKart supplements"
- "whey protein taste review India"
- "supplement trends India"
- "fitness nutrition India"

---

## Technology Choices

### Why Next.js?
- Single deployment (frontend + API routes)
- Free hosting on Vercel
- Built-in TypeScript support
- App Router for modern React patterns
- Edge functions for fast API responses

### Why Groq?
- Fastest LLM inference available (~100 tokens/sec)
- Free tier with generous limits
- Llama 3.1 70B excels at analysis tasks
- JSON mode for structured outputs

### Why NewsAPI?
- Free tier with 100 requests/day
- Searches news from multiple sources
- Articles about supplements, fitness, health
- Simple API key authentication
- Returns headlines, descriptions, and content

---

## Demo Script for Loom Video (5 mins)

### 1. Intro (30 seconds)
"This is Flavor Scout - an AI-powered tool that discovers viral flavor trends from news articles and industry content for HealthKart's brands."

### 2. Live Dashboard Demo (1.5 minutes)
- Show the Golden Candidate card
- Explain the confidence score and market opportunity
- Demonstrate the Trend Wall word cloud
- Click through brand filters

### 3. How AI Avoids Hallucinations (1 minute)
- Show actual news articles being analyzed
- Explain how insights are extracted
- Demonstrate the supporting data
- Mention temperature settings and JSON mode

### 4. Decision Engine Walkthrough (1 minute)
- Show selected vs rejected ideas
- Explain why ideas get rejected
- Read a "Why it works" explanation

### 5. Technical Overview (30 seconds)
- Quick architecture diagram
- Mention NewsAPI and Groq
- Show the Vercel deployment

### 6. Closing (30 seconds)
"This tool gives product teams real industry insights to make data-driven flavor decisions. No guessing - just real news content analyzed by AI."

---

## Future Enhancements

1. **More Data Sources**: Twitter/X, Instagram, Amazon reviews
2. **Historical Trends**: Track flavor mentions over time
3. **Export Reports**: PDF/Excel for stakeholders
4. **Slack Integration**: Alert team on new trends
5. **A/B Testing Tracker**: Compare recommended vs launched
6. **Competitor Analysis**: Track competitor flavor releases

---

Built with ❤️ for HealthKart by Shrayna Srivastava
