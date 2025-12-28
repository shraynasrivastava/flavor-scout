# 📚 Flavor Scout - Technical Documentation

Comprehensive technical specifications for the Flavor Scout AI-powered flavor trend discovery engine.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Technology Stack](#technology-stack)
3. [Data Models](#data-models)
4. [API Reference](#api-reference)
5. [AI/LLM Integration](#aillm-integration)
6. [Caching System](#caching-system)
7. [Component Architecture](#component-architecture)
8. [Styling System](#styling-system)
9. [Environment Configuration](#environment-configuration)
10. [Deployment Guide](#deployment-guide)
11. [Testing Strategy](#testing-strategy)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Requirements

### Development Environment
| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 18.0+ | 20.x LTS |
| npm | 9.0+ | 10.x |
| RAM | 4GB | 8GB |
| Storage | 500MB | 1GB |

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Technology Stack

### Frontend
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Stack                        │
├─────────────────────────────────────────────────────────┤
│ Framework:     Next.js 14.x (App Router)                │
│ UI Library:    React 19.x                               │
│ Language:      TypeScript 5.x                           │
│ Styling:       Tailwind CSS 4.x                         │
│ Animations:    Framer Motion 12.x                       │
│ Charts:        Recharts 2.x                             │
│ Icons:         Lucide React 0.56x                       │
│ Fonts:         Plus Jakarta Sans, Inter, JetBrains Mono│
└─────────────────────────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────────────────────────┐
│                    Backend Stack                         │
├─────────────────────────────────────────────────────────┤
│ Runtime:       Next.js API Routes (Serverless)          │
│ AI/LLM:        Groq SDK (Llama 3.3 70B Versatile)      │
│ Data Source:   NewsAPI.org                              │
│ Caching:       In-memory (10-minute TTL)                │
│ Deployment:    Vercel Edge Functions                    │
└─────────────────────────────────────────────────────────┘
```

### Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "framer-motion": "^12.23.26",
    "groq-sdk": "^0.37.0",
    "lucide-react": "^0.562.0",
    "recharts": "^2.15.3",
    "react-wordcloud": "^1.2.7"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "typescript": "^5",
    "tailwindcss": "^4.0.2"
  }
}
```

---

## Data Models

### TypeScript Interfaces

#### NewsArticle
```typescript
interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  publishedAt: string;
  url: string;
  score: number;  // Relevance score for ranking
}
```

#### ContentExcerpt
```typescript
interface ContentExcerpt {
  id: string;
  body: string;
  author: string;
  publishedAt: string;
}
```

#### TrendKeyword
```typescript
interface TrendKeyword {
  text: string;                                    // Flavor name
  value: number;                                   // Mention count
  sentiment: 'positive' | 'negative' | 'neutral';
  context?: string;                                // Why trending
}
```

#### FlavorRecommendation
```typescript
interface FlavorRecommendation {
  id: string;
  flavorName: string;
  productType: string;                  // e.g., "Biozyme Whey", "BCAA"
  targetBrand: Brand;                   // MuscleBlaze | HK Vitals | TrueBasics
  confidence: number;                   // 0-100
  whyItWorks: string;                   // Business-friendly explanation
  supportingData: string[];             // Quotes from articles
  status: 'selected' | 'rejected';
  rejectionReason?: string;
  analysis?: FlavorAnalysis;            // Detailed breakdown
  negativeFeedback?: string[];          // Related complaints
  existingComparison?: string;          // vs current products
  promotionOpportunity?: string;        // Marketing suggestion
}
```

#### FlavorAnalysis
```typescript
interface FlavorAnalysis {
  marketDemand: string;        // What's driving demand
  competitorGap: string;       // What competitors miss
  consumerPainPoint: string;   // Problem being solved
  seasonalRelevance?: string;  // Seasonal factors
  riskFactors: string[];       // Potential risks
}
```

#### GoldenCandidate
```typescript
interface GoldenCandidate {
  recommendation: FlavorRecommendation;
  rank: number;
  totalMentions: number;
  sentimentScore: number;       // 0-1
  negativeMentions: number;     // Pain points addressed
  marketGap: string;
  competitiveAdvantage: string; // Why launch first
}
```

#### NegativeMention
```typescript
interface NegativeMention {
  flavor: string;      // e.g., "Rich Chocolate"
  complaint: string;   // e.g., "Too sweet"
  frequency: number;   // Mention count
  source: string;      // Where mentioned
}
```

#### AnalysisResponse
```typescript
interface AnalysisResponse {
  trendKeywords: TrendKeyword[];
  flavorMentions: FlavorMention[];
  recommendations: FlavorRecommendation[];
  goldenCandidate: GoldenCandidate | null;
  negativeMentions: NegativeMention[];
  rawPostCount: number;
  analyzedAt: string;
  analysisInsights?: string;     // Executive summary
  cacheInfo?: CacheInfo;
}
```

#### Brand Profiles
```typescript
type Brand = 'MuscleBlaze' | 'HK Vitals' | 'TrueBasics';

const BRAND_PROFILES: Record<Brand, BrandProfile> = {
  'MuscleBlaze': {
    color: '#FF6B35',           // Orange
    description: 'Hardcore gym enthusiasts',
    productTypes: ['Biozyme Whey', 'Raw Whey', 'Mass Gainer', 'BCAA', 'Pre-Workout', 'Creatine'],
    flavorStyle: 'Bold, intense, Indian fusion'
  },
  'HK Vitals': {
    color: '#4ECDC4',           // Teal
    description: 'Wellness-focused consumers',
    productTypes: ['Electrolytes', 'Apple Cider Vinegar', 'Multivitamin Gummies', 'Biotin', 'Collagen'],
    flavorStyle: 'Light, refreshing, natural'
  },
  'TrueBasics': {
    color: '#7C3AED',           // Purple
    description: 'Premium health seekers',
    productTypes: ['Omega-3', 'Plant Protein', 'Immunity Boost', 'Marine Collagen'],
    flavorStyle: 'Sophisticated, unique, premium'
  }
};
```

---

## API Reference

### GET /api/analyze

Main analysis endpoint that orchestrates data fetching and AI analysis.

#### Request
```
GET /api/analyze?refresh=true
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `refresh` | boolean | No | Force bypass cache if `true` |

#### Response (Success: 200)
```json
{
  "trendKeywords": [
    {
      "text": "Mango Lassi",
      "value": 25,
      "sentiment": "positive",
      "context": "Growing demand for Indian traditional flavors"
    }
  ],
  "flavorMentions": [
    { "flavor": "Kesar Pista", "count": 15, "sources": ["healthkart", "fitness"] }
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "flavorName": "Kesar Pista",
      "productType": "Biozyme Whey",
      "targetBrand": "MuscleBlaze",
      "confidence": 87,
      "whyItWorks": "Indian festive flavor with premium positioning...",
      "supportingData": ["Users asking for Indian flavors...", "..."],
      "status": "selected",
      "analysis": {
        "marketDemand": "15% YoY growth in traditional flavors",
        "competitorGap": "ON has Kaju Katli but no Kesar Pista",
        "consumerPainPoint": "Current Indian flavors are too sweet",
        "riskFactors": ["Seasonal demand spike during Diwali", "Higher ingredient cost"]
      },
      "existingComparison": "Would complement Kulfi as premium Indian line",
      "promotionOpportunity": "Launch during Diwali season"
    }
  ],
  "goldenCandidate": {
    "recommendation": { /* ... */ },
    "rank": 1,
    "totalMentions": 45,
    "sentimentScore": 0.87,
    "negativeMentions": 12,
    "marketGap": "No premium Indian flavor in protein market",
    "competitiveAdvantage": "First mover advantage in festive protein"
  },
  "negativeMentions": [
    {
      "flavor": "Rich Chocolate",
      "complaint": "Too sweet, artificial aftertaste",
      "frequency": 8,
      "source": "Customer reviews"
    }
  ],
  "rawPostCount": 137,
  "analyzedAt": "2024-12-28T10:30:00Z",
  "analysisInsights": "Market shows strong demand for Indian traditional flavors...",
  "cacheInfo": {
    "usedCache": true,
    "cacheAgeSeconds": 180,
    "totalApiFetches": 3
  }
}
```

#### Response (Error: 400/500)
```json
{
  "error": "Missing Credentials",
  "message": "NewsAPI key is required",
  "hint": "Get your free key at https://newsapi.org/register",
  "missingVars": ["NEWS_API_KEY"]
}
```

### GET /api/news

Raw news data endpoint for debugging.

#### Response
```json
{
  "articles": [
    {
      "id": "news-1",
      "title": "MuscleBlaze launches new Kulfi flavor",
      "content": "...",
      "source": "Economic Times",
      "publishedAt": "2024-12-27T10:00:00Z",
      "score": 95
    }
  ],
  "contentExcerpts": [
    {
      "id": "excerpt-1",
      "body": "Users are requesting more Indian flavors...",
      "author": "HealthKart Blog",
      "publishedAt": "2024-12-26T08:00:00Z"
    }
  ],
  "sources": ["Economic Times", "HealthKart Blog", "...]
}
```

---

## AI/LLM Integration

### Groq Configuration

```typescript
// lib/groq.ts
import Groq from 'groq-sdk';

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key required');
  }
  return new Groq({ apiKey });
}

const completion = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  temperature: 0.4,                    // Lower = more factual
  response_format: { type: 'json_object' },
  messages: [{ role: 'user', content: prompt }]
});
```

### Token Management

```typescript
const MAX_INPUT_CHARS = 25000;  // ~6000 tokens

function prepareTextForAnalysis(articles: NewsArticle[], excerpts: ContentExcerpt[]): string {
  // 1. Limit articles to top 40 by score
  const topArticles = articles
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
  
  // 2. Limit excerpts to 30
  const topExcerpts = excerpts.slice(0, 30);
  
  // 3. Truncate individual items
  const articleTexts = topArticles.map(a => 
    `[${a.source}] ${a.title}\n${truncate(a.content, 150)}`
  );
  
  // 4. Combine and cap total
  let result = articleTexts.join('\n\n');
  if (result.length > MAX_INPUT_CHARS) {
    result = result.slice(0, MAX_INPUT_CHARS);
  }
  
  return result;
}
```

### Prompt Engineering

The analysis prompt includes:

1. **System Context**: Role definition as HealthKart product analyst
2. **Product Catalog**: Current flavors for all brands
3. **Competitor Intelligence**: ON, MyProtein, Dymatize offerings
4. **Extraction Rules**: What to identify (flavors, not generic terms)
5. **Anti-Hallucination**: Explicit instructions to use only article data
6. **Output Schema**: JSON structure with required fields
7. **Business Rules**: Minimum 6 recommendations, 2+ per brand

### Anti-Hallucination Measures

| Measure | Implementation |
|---------|----------------|
| Low temperature | `0.4` instead of `0.7+` |
| JSON mode | `response_format: { type: 'json_object' }` |
| Grounded prompts | "ONLY use data from articles" |
| Supporting evidence | Required `supportingData` array |
| Specific examples | Good vs bad keyword examples |

---

## Caching System

### In-Memory Cache Implementation

```typescript
// lib/news.ts
const newsCache: {
  data: { posts: NewsArticle[]; comments: ContentExcerpt[] } | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function fetchNewsArticles(
  limit: number = 200,
  forceRefresh: boolean = false
): Promise<{ posts: NewsArticle[]; comments: ContentExcerpt[] }> {
  
  // Check cache
  if (!forceRefresh && newsCache.data && 
      (Date.now() - newsCache.timestamp < CACHE_DURATION)) {
    console.log('[NewsAPI] Returning cached data');
    return newsCache.data;
  }
  
  // Fetch fresh data
  const data = await fetchFromNewsAPI();
  
  // Update cache
  newsCache.data = data;
  newsCache.timestamp = Date.now();
  
  return data;
}
```

### Cache Behavior

| Action | Behavior |
|--------|----------|
| Initial load | Fetch fresh, cache result |
| "Refresh" button | Use cache if < 10 min old |
| "Force New" button | Always fetch fresh |
| Cache expired | Fetch fresh on next request |

---

## Component Architecture

### Component Hierarchy

```
app/page.tsx (Dashboard)
├── components/BrandSelector.tsx
├── components/LoadingState.tsx
├── components/TrendWall.tsx
│   ├── Top Trending Card
│   ├── Flavor Tags (interactive)
│   ├── Frequency Chart (Recharts)
│   └── Legend
├── components/GoldenCandidate.tsx
│   ├── Hero Section
│   ├── Stat Boxes (4)
│   ├── Why This Works
│   ├── Market Opportunity
│   ├── Competitive Advantage
│   └── Supporting Quotes
├── NegativeMentionsPanel (inline)
│   ├── Summary Stats
│   ├── Clickable Cards
│   └── Opportunity Expansion
└── components/DecisionEngine.tsx
    ├── Selected Ideas Column
    │   └── RecommendationCard (expandable)
    └── Rejected Ideas Column
        └── RecommendationCard (with reason)
```

### State Management

```typescript
// Dashboard state (app/page.tsx)
const [data, setData] = useState<AnalysisResponse | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<ApiError | null>(null);
const [selectedBrand, setSelectedBrand] = useState<Brand | 'all'>('all');
const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

// Derived state
const filteredRecommendations = useMemo(() => 
  data?.recommendations?.filter(r => 
    selectedBrand === 'all' || r.targetBrand === selectedBrand
  ) ?? [],
  [data, selectedBrand]
);
```

---

## Styling System

### Tailwind Configuration

```css
/* app/globals.css */
:root {
  --font-plus-jakarta: 'Plus Jakarta Sans', sans-serif;
  --font-inter: 'Inter', sans-serif;
  --font-jetbrains: 'JetBrains Mono', monospace;
  
  /* Brand Colors */
  --brand-muscleblaze: #FF6B35;
  --brand-hkvitals: #4ECDC4;
  --brand-truebasics: #7C3AED;
  
  /* Accents */
  --accent-purple: #8B5CF6;
  --accent-cyan: #06B6D4;
  
  /* Backgrounds */
  --bg-primary: #0f172a;     /* slate-900 */
  --bg-secondary: #1e293b;   /* slate-800 */
  --bg-tertiary: #334155;    /* slate-700 */
}
```

### Glassmorphism Classes

```css
.glass-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-card-hover:hover {
  border-color: rgba(148, 163, 184, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
```

### Animation Patterns

```typescript
// Framer Motion variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const hoverScale = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.98 }
};
```

---

## Environment Configuration

### Required Variables

```bash
# .env.local (NEVER commit this file)

# NewsAPI - Get free key at https://newsapi.org/register
NEWS_API_KEY=your_32_character_key_here

# Groq - Get free key at https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_key_here
```

### Validation

```typescript
// lib/news.ts
if (!process.env.NEWS_API_KEY) {
  throw new Error(
    'NewsAPI key required. Get free key at https://newsapi.org/register'
  );
}

// lib/groq.ts
if (!process.env.GROQ_API_KEY) {
  throw new Error(
    'Groq API key required. Get free key at https://console.groq.com/keys'
  );
}
```

---

## Deployment Guide

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com/new
   - Import GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment**
   - Settings → Environment Variables
   - Add `NEWS_API_KEY` and `GROQ_API_KEY`
   - Apply to Production, Preview, Development

4. **Deploy**
   - Click Deploy
   - Wait ~1 minute
   - Your app is live!

### Build Configuration

```json
// next.config.ts
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // ...
  },
  // Optimize for Vercel
  output: 'standalone'
};
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Brand filtering works correctly
- [ ] Golden candidate updates with brand selection
- [ ] Trend wall tags are clickable
- [ ] Pain point cards expand on click
- [ ] Decision engine cards expand for analysis
- [ ] Refresh button uses cache
- [ ] Force New button fetches fresh data
- [ ] Error states display correctly
- [ ] Loading states animate smoothly
- [ ] Mobile responsive layout works

### API Testing

```bash
# Test analyze endpoint
curl http://localhost:3000/api/analyze | jq

# Test with force refresh
curl "http://localhost:3000/api/analyze?refresh=true" | jq

# Test news endpoint
curl http://localhost:3000/api/news | jq
```

---

## Troubleshooting Guide

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "NewsAPI key required" | Missing env var | Add `NEWS_API_KEY` to `.env.local` |
| "Groq API key required" | Missing env var | Add `GROQ_API_KEY` to `.env.local` |
| "Request too large" | Token limit | Automatic - system truncates |
| "Rate limit exceeded" | Too many requests | Wait or check API quotas |
| "Model decommissioned" | Outdated model | Update to `llama-3.3-70b-versatile` |
| "No articles found" | API issue | Check NewsAPI key validity |
| "Analysis failed" | Groq error | Check console, retry |

### Debug Logging

```typescript
// Enable in lib/news.ts and lib/groq.ts
console.log('[NewsAPI] Fetching fresh data...');
console.log('[NewsAPI] Fetched X articles and Y excerpts');
console.log('[Groq] Prepared X chars for analysis');
console.log('[Flavor Scout] Generated X recommendations');
```

### Browser Console

Press F12 → Console tab to see:
- Network requests to `/api/analyze`
- Response data structure
- React component errors
- Cache hit/miss logs

---

## Performance Metrics

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 3s | ~2s |
| API Response (cached) | < 500ms | ~200ms |
| API Response (fresh) | < 15s | ~10s |
| Lighthouse Performance | > 90 | 95 |
| Lighthouse Accessibility | > 90 | 92 |

### Optimization Tips

1. **Reduce API calls**: Use cache aggressively
2. **Limit Groq input**: 40 articles max
3. **Lazy load components**: Progressive rendering
4. **Optimize images**: None used currently
5. **Minimize re-renders**: Memoize filtered data

---

**Built with ❤️ for HealthKart by Shrayna Srivastava**

