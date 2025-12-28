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
│   │   Reddit    │───▶│  Next.js    │───▶│    Groq     │        │
│   │    API      │    │  API Routes │    │    LLM      │        │
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
fetchRedditPosts() from lib/reddit.ts
        │
        ├── Has Reddit credentials? ──▶ Fetch live data from Reddit
        │                                    │
        │                                    ▼
        │                              Subreddits searched:
        │                              - r/Supplements
        │                              - r/fitness
        │                              - r/indianfitness
        │                              - r/gainit
        │                              - r/nutrition
        │
        └── No credentials? ──▶ Return realistic mock data
                                      │
                                      ▼
                                Posts + Comments
```

### 2. AI Analysis (The "Brain")
```
Posts + Comments
        │
        ▼
analyzeWithGroq() from lib/groq.ts
        │
        ▼
Structured Prompt to Llama 3.1 70B:
┌─────────────────────────────────────────┐
│ "You are a product analyst for         │
│  HealthKart. Analyze these discussions │
│  and extract:                           │
│  1. Trending flavor keywords            │
│  2. Recommendations with 'Why it works' │
│  3. The #1 Golden Candidate            │
│                                         │
│  Brand profiles provided for matching:  │
│  - MuscleBlaze (hardcore gym)           │
│  - HK Vitals (wellness lifestyle)       │
│  - TrueBasics (premium health)          │
└─────────────────────────────────────────┘
        │
        ▼
JSON Response with:
- trendKeywords[]
- recommendations[]
- goldenCandidate
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

## How the AI Makes Decisions

### Avoiding Hallucinations

1. **Grounded in Real Data**: The AI only analyzes actual Reddit discussions, not imagined scenarios

2. **Structured Output**: We use `response_format: { type: 'json_object' }` to ensure the AI returns valid, parseable JSON

3. **Explicit Brand Profiles**: The prompt includes detailed brand descriptions so the AI makes informed matches

4. **Supporting Evidence**: Every recommendation must include actual quotes from the data

### Prompt Engineering

The key to quality recommendations is the prompt structure:

```
❌ Bad: "Analyze these posts and suggest flavors"

✅ Good: "You are a product analyst for HealthKart.
         For each recommendation:
         1. Explain WHY in plain business language
         2. Include supporting user quotes
         3. Mark as selected/rejected with reasoning
         4. Match to the most appropriate brand"
```

---

## UI/UX Design Decisions

### Why This Layout?

1. **Stats Bar at Top**: Immediate context (posts analyzed, keywords found, ideas generated)

2. **Golden Candidate First**: The most important insight is above the fold - product managers see the #1 recommendation immediately

3. **Trend Wall Middle**: Visual discovery - lets users explore what's trending before seeing recommendations

4. **Decision Engine Last**: Detailed analysis for those who want to dig deeper

### Why Dark Mode?

- Matches the "hardcore fitness" vibe of MuscleBlaze
- Reduces eye strain for extended analysis sessions
- Premium, modern aesthetic that fits TrueBasics positioning
- Better contrast for data visualization colors

### Color Coding

| Color | Meaning |
|-------|---------|
| Green/Emerald | Positive sentiment, selected ideas |
| Red/Rose | Negative sentiment, rejected ideas |
| Yellow/Gold | Golden candidate, top recommendation |
| Purple | Brand accent, interactive elements |
| Brand colors | MuscleBlaze (orange), HK Vitals (teal), TrueBasics (purple) |

---

## API Endpoints

### GET /api/analyze
Main endpoint that:
1. Fetches Reddit data
2. Runs Groq analysis
3. Returns combined response

**Response:**
```json
{
  "trendKeywords": [...],
  "flavorMentions": [...],
  "recommendations": [...],
  "goldenCandidate": {...},
  "rawPostCount": 12,
  "analyzedAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/reddit
Raw Reddit data endpoint (for debugging):
```json
{
  "posts": [...],
  "comments": [...],
  "subreddits": [...],
  "fetchedAt": "..."
}
```

---

## Technology Choices

### Why Next.js?
- Single deployment (frontend + API)
- Free hosting on Vercel
- Built-in TypeScript support
- App Router for modern React patterns

### Why Groq?
- Fastest LLM inference available
- Free tier with generous limits
- Llama 3.1 70B is excellent for analysis tasks
- JSON mode for structured outputs

### Why Reddit?
- Rich discussions about supplements and flavors
- Active Indian fitness community (r/indianfitness)
- User opinions are authentic and detailed
- Free API access with simple authentication

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Auto-deploys on every push

### Environment Variables
```
GROQ_API_KEY=gsk_xxx...
REDDIT_CLIENT_ID=xxx (optional)
REDDIT_CLIENT_SECRET=xxx (optional)
REDDIT_USERNAME=xxx (optional)
REDDIT_PASSWORD=xxx (optional)
```

---

## Future Enhancements

1. **More Data Sources**: Add Twitter/X, Instagram, Amazon reviews
2. **Historical Trends**: Track flavor mentions over time
3. **Export Reports**: PDF/Excel export for stakeholders
4. **Slack Integration**: Alert product team when new trends emerge
5. **A/B Testing Tracker**: Compare recommended vs launched flavors

---

## Demo Script for Loom Video

1. **Intro (30s)**: "This is Flavor Scout - an AI tool that discovers viral flavor trends from social media"

2. **Show Dashboard (1 min)**: Walk through each section, explain what users see

3. **Explain AI (1 min)**: Show how the prompt engineering works, why recommendations are trustworthy

4. **Brand Matching (30s)**: Filter by brand, explain the matching logic

5. **Technical Overview (1 min)**: Quick architecture explanation

6. **Refresh Demo (30s)**: Show the loading state, new data coming in

7. **Closing (30s)**: Call to action, next steps

---

Built with ❤️ for HealthKart

