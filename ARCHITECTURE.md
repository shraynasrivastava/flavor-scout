# 🏗️ Flavor Scout - Architecture Guide

This document explains the technical architecture and design decisions for Flavor Scout — the AI-powered flavor trend discovery engine for HealthKart.

---

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            FLAVOR SCOUT                                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐    ┌───────────────┐    ┌───────────────┐              │
│   │   NewsAPI    │───▶│   Next.js     │───▶│    Groq AI    │              │
│   │  (15+ Queries)│   │  API Routes   │    │ Llama 3.3 70B │              │
│   │              │    │  with Cache   │    │               │              │
│   └──────────────┘    └───────────────┘    └───────────────┘              │
│          │                    │                     │                      │
│          │                    ▼                     │                      │
│          │            ┌───────────────┐             │                      │
│          └───────────▶│    React      │◀────────────┘                      │
│                       │   Dashboard   │                                     │
│                       │ (Framer Motion)│                                    │
│                       └───────────────┘                                     │
│                              │                                              │
│         ┌────────────────────┼────────────────────┐                        │
│         ▼                    ▼                    ▼                        │
│   ┌───────────┐       ┌───────────┐       ┌───────────┐                   │
│   │  Flavor   │       │  Decision │       │  Golden   │                   │
│   │ Trend Wall│       │   Engine  │       │ Candidate │                   │
│   │           │       │           │       │           │                   │
│   │ • Tags    │       │ • Selected│       │ • Hero    │                   │
│   │ • Chart   │       │ • Rejected│       │ • Stats   │                   │
│   │ • Top #1  │       │ • Analysis│       │ • Quotes  │                   │
│   └───────────┘       └───────────┘       └───────────┘                   │
│                              │                                              │
│                              ▼                                              │
│                       ┌───────────┐                                        │
│                       │Pain Points│                                        │
│                       │   Panel   │                                        │
│                       │           │                                        │
│                       │ • Clickable│                                       │
│                       │ • Opps    │                                        │
│                       └───────────┘                                        │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Pipeline

### 1. Data Ingestion (The "Ears")
```
User clicks "Refresh" / "Force New"
        │
        ▼
/api/analyze (Next.js API Route)
        │
        ├──▶ Check Cache (10-minute TTL)
        │         │
        │         ├── Cache Hit → Return cached data
        │         └── Cache Miss / Force → Continue
        │
        ▼
fetchNewsArticles() from lib/news.ts
        │
        ▼
Call NewsAPI with 15+ search queries:
  ┌─────────────────────────────────────────┐
  │ • "protein powder flavors India"         │
  │ • "MuscleBlaze new flavor review"        │
  │ • "whey protein taste India"             │
  │ • "HealthKart supplements trending"      │
  │ • "supplement industry India 2024"       │
  │ • "fitness nutrition flavors"            │
  │ • "BCAA electrolyte flavors"             │
  │ • "plant protein vegan India"            │
  │ • "gym supplements India review"         │
  │ • "wellness nutrition trends"            │
  │ • "Optimum Nutrition India" (competitor) │
  │ • "MyProtein flavors" (competitor)       │
  │ • "Indian traditional flavors health"    │
  │ • "kesar pista almond supplements"       │
  │ • "mango guava tropical health"          │
  └─────────────────────────────────────────┘
        │
        ▼
Fetch 100-150 articles + extract content
        │
        ▼
Cache results for 10 minutes
        │
        ▼
Return to analysis pipeline
```

### 2. AI Analysis (The "Brain")
```
Articles + Content from NewsAPI
        │
        ▼
analyzeWithGroq() from lib/groq.ts
        │
        ├──▶ Token Limiting:
        │    • Top 40 articles by relevance
        │    • 30 content excerpts
        │    • Truncate to 25,000 chars max
        │
        ▼
Comprehensive Prompt to Groq Llama 3.3 70B:
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM CONTEXT:                                                  │
│ "You are a senior product analyst at HealthKart..."             │
│                                                                  │
│ CURRENT PRODUCT CATALOG:                                        │
│ • MuscleBlaze: Biozyme Whey (Rich Chocolate, Kulfi, etc.)       │
│ • HK Vitals: Electrolytes (Orange, Lemon, Watermelon)           │
│ • TrueBasics: Plant Protein (Chocolate, Vanilla, Coffee)        │
│                                                                  │
│ COMPETITORS TO WATCH:                                            │
│ • Optimum Nutrition (Kaju Katli, Rasmalai)                       │
│ • MyProtein (Salted Caramel, Tiramisu)                          │
│ • Dymatize (Birthday Cake, Fruity Pebbles)                       │
│                                                                  │
│ REQUIREMENTS:                                                    │
│ 1. Extract SPECIFIC FLAVOR NAMES (not generic terms)            │
│ 2. Track complaints about current products                       │
│ 3. Generate 6+ recommendations (2+ per brand)                    │
│ 4. Identify the Golden Candidate                                 │
│ 5. Include detailed analysis for each recommendation             │
│                                                                  │
│ ANTI-HALLUCINATION RULES:                                        │
│ • ONLY extract insights from actual article content              │
│ • Base recommendations on real data                              │
│ • Include supporting quotes                                      │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──▶ Settings:
        │    • model: "llama-3.3-70b-versatile"
        │    • temperature: 0.4 (factual, not creative)
        │    • response_format: { type: "json_object" }
        │
        ▼
JSON Response:
┌─────────────────────────────────────────────────────────────────┐
│ {                                                                │
│   "analysisInsights": "Executive summary...",                    │
│   "trendKeywords": [                                             │
│     { "text": "Mango Lassi", "value": 25, "sentiment": "+" }    │
│   ],                                                             │
│   "negativeMentions": [                                          │
│     { "flavor": "Rich Chocolate", "complaint": "Too sweet" }     │
│   ],                                                             │
│   "recommendations": [                                           │
│     {                                                            │
│       "flavorName": "Kesar Pista",                              │
│       "targetBrand": "MuscleBlaze",                             │
│       "confidence": 87,                                          │
│       "whyItWorks": "...",                                       │
│       "analysis": { "marketDemand": "...", ... }                 │
│     }                                                            │
│   ],                                                             │
│   "goldenCandidate": { ... }                                     │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Dashboard Rendering (The "Face")
```
AnalysisResponse from API
        │
        ▼
React Dashboard (app/page.tsx)
        │
        ├──▶ Header
        │    • Flavor Scout logo with animation
        │    • Brand selector (All, MuscleBlaze, HK Vitals, TrueBasics)
        │    • Refresh / Force New buttons
        │    • Cache indicator
        │
        ├──▶ Stats Bar
        │    • Articles Analyzed
        │    • Trending Keywords
        │    • Selected Ideas
        │    • Pain Points Found
        │    • Last Updated
        │
        ├──▶ AI Market Analysis Summary
        │    • Executive insights from LLM
        │
        ├──▶ GoldenCandidate.tsx
        │    • Hero card with #1 recommendation
        │    • 4 stat boxes (Confidence, Mentions, Pain Points, Positive %)
        │    • Why This Works
        │    • Market Opportunity
        │    • Competitive Advantage
        │    • vs Current Products
        │
        ├──▶ TrendWall.tsx
        │    • Top Trending Flavor highlight card
        │    • Interactive flavor tags with rankings (1st, 2nd, 3rd)
        │    • Clickable tags with sentiment colors
        │    • Frequency bar chart
        │    • Legend (Positive/Negative/Neutral)
        │
        ├──▶ Pain Points Panel
        │    • Clickable complaint cards
        │    • Click to reveal opportunity
        │    • Frequency visualization
        │
        └──▶ DecisionEngine.tsx
             • Selected Ideas (green, expandable)
             • Rejected Ideas (red, with reasons)
             • Each card shows:
               - Flavor name + confidence
               - Why It Works
               - vs Current Products
               - Promotion Opportunity
               - Expandable Analysis (Market Demand, Competitor Gap, etc.)
```

---

## How the AI Avoids Hallucinations

### 1. Grounded in Real Data
- The AI ONLY analyzes actual news articles from NewsAPI
- No synthetic or mock data is used
- Every recommendation is traceable to real industry content

### 2. Structured Output with Validation
```javascript
// JSON mode ensures parseable, structured output
response_format: { type: 'json_object' }

// Lower temperature for factual, consistent outputs
temperature: 0.4  // (not 0.7+ which causes creativity/hallucination)
```

### 3. Explicit Anti-Hallucination Rules in Prompt
```
✅ "ONLY extract insights that are ACTUALLY present in the data"
✅ "Do NOT invent or hallucinate flavor requests"
✅ "Base recommendations on actual article content"
✅ "Trending keywords MUST be SPECIFIC FLAVOR NAMES"
   • Good: "Mango Lassi", "Kesar Pista", "Dark Chocolate"
   • Bad: "plant-based", "protein-rich", "clean label"
```

### 4. Supporting Evidence Required
Every recommendation must include:
- `supportingData`: Actual quotes from articles
- `whyItWorks`: Business explanation grounded in data
- `analysis`: Detailed breakdown (market demand, competitor gap, etc.)
- `confidence`: Score based on mention volume and sentiment

### 5. Token Limiting to Reduce Noise
- Only top 40 articles analyzed (by relevance score)
- Content truncated to 150 chars per article
- Total input capped at 25,000 characters
- Reduces irrelevant content that could confuse the model

---

## UI/UX Design Decisions

### Why This Layout?

| Section | Position | Reason |
|---------|----------|--------|
| **Stats Bar** | Top | Immediate context about data quality |
| **AI Summary** | After stats | Executive overview before details |
| **Golden Candidate** | Above fold | Most important insight first |
| **Trend Wall** | Middle | Visual discovery of trending flavors |
| **Pain Points** | Below trends | Problems = opportunities |
| **Decision Engine** | Bottom | Detailed analysis for deep dives |

### Why Dark Mode?
- **Fitness Aesthetic**: Matches MuscleBlaze's hardcore brand
- **Eye Comfort**: Reduces strain during extended analysis
- **Premium Feel**: Aligns with TrueBasics positioning
- **Better Contrast**: Data visualizations pop more
- **Modern Look**: Expected by tech-savvy audience

### Glassmorphism Design
- Creates depth without heavy borders
- Modern, premium appearance
- Works well with brand color overlays
- Allows background gradients to show through

### Color System

| Color | Hex | Usage |
|-------|-----|-------|
| 🟢 Emerald | `#10B981` | Positive sentiment, selected ideas |
| 🔴 Red | `#EF4444` | Negative sentiment, rejected ideas |
| 🟡 Yellow/Gold | `#F59E0B` | Golden candidate, highlights |
| 🟣 Purple | `#8B5CF6` | Interactive elements, stats |
| 🟠 Orange | `#FF6B35` | MuscleBlaze brand |
| 🩵 Teal | `#4ECDC4` | HK Vitals brand |
| 💜 Purple | `#7C3AED` | TrueBasics brand |

### Typography

| Font | Usage |
|------|-------|
| **Plus Jakarta Sans** | Headings, brand text |
| **Inter** | Body text, descriptions |
| **JetBrains Mono** | Numbers, stats, data |

---

## API Endpoints

### GET /api/analyze
Main orchestration endpoint:

**Query Parameters:**
- `refresh=true`: Force fetch new data (bypass cache)

**Response:**
```json
{
  "trendKeywords": [
    { "text": "Mango Lassi", "value": 25, "sentiment": "positive", "context": "..." }
  ],
  "flavorMentions": [...],
  "recommendations": [
    {
      "id": "rec-1",
      "flavorName": "Kesar Pista",
      "productType": "Biozyme Whey",
      "targetBrand": "MuscleBlaze",
      "confidence": 87,
      "whyItWorks": "...",
      "status": "selected",
      "analysis": {
        "marketDemand": "...",
        "competitorGap": "...",
        "consumerPainPoint": "...",
        "riskFactors": [...]
      }
    }
  ],
  "goldenCandidate": {
    "recommendation": {...},
    "totalMentions": 45,
    "sentimentScore": 0.85,
    "negativeMentions": 12,
    "marketGap": "...",
    "competitiveAdvantage": "..."
  },
  "negativeMentions": [
    { "flavor": "Rich Chocolate", "complaint": "Too sweet", "frequency": 8 }
  ],
  "rawPostCount": 137,
  "analyzedAt": "2024-12-28T10:30:00Z",
  "analysisInsights": "Executive summary...",
  "cacheInfo": {
    "usedCache": true,
    "cacheAgeSeconds": 180,
    "totalApiFetches": 3
  }
}
```

### GET /api/news
Raw news data endpoint (debugging):
```json
{
  "articles": [...],
  "contentExcerpts": [...],
  "sources": [...]
}
```

---

## Caching Strategy

### In-Memory Cache (lib/news.ts)
```javascript
const newsCache = {
  data: null,
  timestamp: 0
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### Cache Behavior:
1. **Refresh Button**: Uses cache if available
2. **Force New Button**: Bypasses cache completely
3. **Cache Age**: Displayed in header (e.g., "Cached (3m ago)")
4. **Auto-Expire**: After 10 minutes, fresh data is fetched

### Why This Strategy?
- NewsAPI free tier: 100 requests/day
- Groq free tier: 14,400 requests/day
- 10-minute cache balances freshness vs. API usage
- User can force refresh when needed

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Missing `NEWS_API_KEY` | Clear error with setup link |
| Missing `GROQ_API_KEY` | Clear error with setup link |
| NewsAPI auth failure | Troubleshooting guidance |
| NewsAPI rate limit | Suggest waiting, show cache |
| Groq token limit | Auto-truncate input |
| Groq API error | Retry button, error details |
| No articles found | Suggest different search |
| Network error | Retry button |

---

## Performance Optimizations

1. **Token Limiting**: Caps Groq input at 25,000 chars
2. **Article Limiting**: Only top 40 articles sent to LLM
3. **Caching**: 10-minute NewsAPI cache
4. **Lazy Loading**: Components render progressively
5. **Animations**: GPU-accelerated via Framer Motion
6. **Image-Free**: No heavy image assets

---

## Security Considerations

1. **API Keys**: Server-side only, never exposed to client
2. **Environment Variables**: Stored in `.env.local` (gitignored)
3. **Rate Limiting**: Built-in via API provider limits
4. **Input Validation**: All API inputs sanitized
5. **CORS**: Default Next.js configuration

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│              Vercel Edge                 │
├─────────────────────────────────────────┤
│                                          │
│   ┌─────────────┐    ┌─────────────┐    │
│   │  Next.js    │    │  API Routes │    │
│   │  Frontend   │────│  (Serverless)│   │
│   │  (Static)   │    │             │    │
│   └─────────────┘    └─────────────┘    │
│                             │            │
│                             ▼            │
│                    ┌─────────────┐       │
│                    │ Environment │       │
│                    │  Variables  │       │
│                    │ NEWS_API_KEY│       │
│                    │ GROQ_API_KEY│       │
│                    └─────────────┘       │
│                                          │
└─────────────────────────────────────────┘
```

---

## Future Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| **More Data Sources** | High | Twitter/X, Instagram, Amazon reviews |
| **Historical Trends** | High | Track flavor mentions over time |
| **Export Reports** | Medium | PDF/Excel for stakeholders |
| **Slack Integration** | Medium | Alert team on new trends |
| **A/B Testing Tracker** | Low | Compare recommended vs launched |
| **Competitor Dashboard** | Low | Dedicated competitor analysis |
| **Multi-Language** | Low | Hindi content analysis |

---

**Built with ❤️ for HealthKart by Shrayna Srivastava**
