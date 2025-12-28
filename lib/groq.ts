import Groq from 'groq-sdk';
import { 
  NewsArticle, 
  ContentExcerpt, 
  TrendKeyword, 
  FlavorRecommendation, 
  GoldenCandidate,
  Brand
} from './types';

// Initialize Groq client - throws error if credentials missing
function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Groq API key is required. Please configure GROQ_API_KEY in your environment variables. Get your free key at https://console.groq.com/keys'
    );
  }
  return new Groq({ apiKey });
}

// Token limit for Groq free tier
const MAX_INPUT_CHARS = 25000; // ~6000 tokens, leaving room for prompt

// Truncate text to max length
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

// Combine articles and content into analyzable text (with size limits)
function prepareTextForAnalysis(articles: NewsArticle[], excerpts: ContentExcerpt[]): string {
  // Limit to top 40 articles by score
  const topArticles = [...articles]
    .sort((a, b) => b.score - a.score)
    .slice(0, 40);
  
  // Limit to top 30 excerpts
  const topExcerpts = excerpts.slice(0, 30);
  
  // Build article text with truncation
  const articleTexts = topArticles.map(a => 
    `[${a.source}] ${a.title}\n${truncate(a.content, 150)}`
  ).join('\n\n');
  
  // Build excerpt text with truncation
  const contentTexts = topExcerpts.map(e => 
    `[${e.author}] ${truncate(e.body, 200)}`
  ).join('\n\n');
  
  let result = `=== NEWS HEADLINES & SUMMARIES (${topArticles.length} articles) ===\n${articleTexts}`;
  
  // Only add excerpts if we have room
  if (result.length < MAX_INPUT_CHARS - 5000) {
    result += `\n\n=== ARTICLE EXCERPTS ===\n${contentTexts}`;
  }
  
  // Final truncation to ensure we stay under limit
  if (result.length > MAX_INPUT_CHARS) {
    result = result.slice(0, MAX_INPUT_CHARS) + '\n\n[Content truncated for analysis]';
  }
  
  console.log(`[Groq] Prepared ${result.length} chars for analysis (${topArticles.length} articles, ${topExcerpts.length} excerpts)`);
  
  return result;
}

// Main analysis prompt - Enhanced with current product catalog
const ANALYSIS_PROMPT = `You are a senior product analyst at HealthKart, India's leading health and fitness brand. Analyze news to discover flavor opportunities.

**CURRENT PRODUCT CATALOG (What we already sell):**

**MUSCLEBLAZE** (Orange brand - Hardcore Gym Enthusiasts):
| Product | Current Flavors | What's Missing | Needs Promotion |
|---------|-----------------|----------------|-----------------|
| Biozyme Whey | Rich Chocolate, Chocolate Hazelnut, Cafe Mocha, Ice Cream Chocolate, Strawberry Shake, Kulfi, Malai Paneer | Peanut Butter variants, Coffee Caramel | Kulfi (Indian), Malai Paneer |
| Raw Whey | Unflavored | Any flavored options | N/A - meant to be unflavored |
| Mass Gainer | Chocolate, Banana Creamy, Cookies & Cream, Kesar Pista Badam | Mango, Coffee | Kesar Pista Badam |
| BCAA | Watermelon, Orange, Green Apple, Icy Blue Splash, Fruit Punch | Cola, Nimbu Pani, Guava | Icy Blue Splash |
| Pre-Workout | Fruit Punch, Blue Raspberry, Orange, Cola | Masala Soda, Jeera variants | Cola |
| Creatine | Unflavored, Tangy Orange, Fruit Punch | Lime variants | Tangy Orange |

**HK VITALS** (Teal brand - Health-Conscious Consumers):
| Product | Current Flavors | What's Missing | Needs Promotion |
|---------|-----------------|----------------|-----------------|
| Electrolytes | Orange, Lemon, Mixed Fruit, Watermelon | Aam Panna, Nimbu Shikanji, Coconut | Watermelon (summer) |
| Apple Cider Vinegar | Original, Honey | Ginger-Turmeric, Cinnamon | Honey variant |
| Multivitamin Gummies | Mixed Berry, Orange | Mango, Guava, Tropical | Mixed Berry |
| Biotin Gummies | Strawberry, Mixed Berry | Peach, Litchi | Strawberry |
| Collagen | Unflavored, Tropical Fruit | Berry, Pomegranate | Tropical Fruit |
| Calcium + D3 | Orange, Mixed Fruit | Chocolate (for kids appeal) | Orange |

**TRUEBASICS** (Purple brand - Premium Health Seekers):
| Product | Current Flavors | What's Missing | Needs Promotion |
|---------|-----------------|----------------|-----------------|
| Omega-3 | Unflavored (capsules) | Lemon-coated, Orange-coated | N/A |
| Plant Protein | Chocolate, Vanilla, Coffee Mocha, Unflavored | Kesar Almond, Dates-Fig | Coffee Mocha |
| Immunity Boost | Orange, Lemon-Ginger | Tulsi-Honey, Haldi Doodh | Lemon-Ginger |
| Marine Collagen | Unflavored, Mixed Berries | Pomegranate, Green Tea | Mixed Berries |
| Multivitamin | Unflavored (tablets) | Chewable fruit variants | N/A |

**COMPETITORS TO WATCH:**
- Optimum Nutrition: Gold Standard flavors (Double Rich Chocolate, Extreme Milk Chocolate, Vanilla Ice Cream)
- MyProtein: Impact Whey (Salted Caramel, Natural Chocolate, Tiramisu, Speculoos)
- Dymatize: ISO100 (Gourmet Chocolate, Fruity Pebbles, Birthday Cake)
- ON India: Lokalized flavors (Kaju Katli, Rasmalai, Paan)

**ANALYSIS REQUIREMENTS:**

1. **TRENDING FLAVOR KEYWORDS**: Extract SPECIFIC FLAVOR NAMES that are trending (not generic terms like "protein" or "health")
   - Focus on actual flavor names: "Kesar Pista", "Masala Chai", "Mango Lassi", "Dark Chocolate", "Salted Caramel", etc.
   - Include traditional Indian flavors: "Aam Panna", "Nimbu Shikanji", "Paan", "Kaju Katli", "Rasmalai", "Gulkand"
   - Include modern trending flavors: "Cookie Butter", "Birthday Cake", "Tiramisu", "Matcha", "Coffee Caramel"
   - Track competitor flavor mentions: ON's Kaju Katli, MyProtein's Salted Caramel, etc.

2. **NEGATIVE MENTIONS**: Track REAL complaints about our current flavors AND best-sellers
   - What complaints exist about our best-selling Rich Chocolate?
   - Are consumers finding our Strawberry too artificial?
   - Is Kulfi flavor authentic enough?
   - What do customers say about sweetness levels?
   - Track texture complaints (chalky, grainy, clumpy)

3. **FLAVOR RECOMMENDATIONS** (MINIMUM 6 recommendations, at least 2 per brand):
   - Identify gaps in current catalog
   - Suggest flavors that address complaints
   - Include "existingComparison": how it compares to what we already have
   - Include "promotionOpportunity": if existing flavor needs better marketing (like Kulfi, Kesar Pista Badam)
   - For each product type, provide at least 2 options (primary + alternative)

4. **GOLDEN CANDIDATE**: The single best opportunity

**OUTPUT FORMAT (JSON only):**
{
  "analysisInsights": "Executive summary focusing on: 1) Which current flavors are loved/hated, 2) What flavors are trending in India, 3) What competitors are doing well",
  "trendKeywords": [
    {"text": "SPECIFIC FLAVOR NAME ONLY", "value": 15, "sentiment": "positive|negative|neutral", "context": "Why this flavor is trending"}
  ],
  "negativeMentions": [
    {"flavor": "Our current flavor name (e.g. Rich Chocolate, Strawberry Shake)", "complaint": "specific user complaint", "frequency": 5, "source": "Customer reviews/social media"}
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "flavorName": "Specific Flavor Name",
      "productType": "Exact Product (e.g., Biozyme Whey, BCAA, Electrolytes)",
      "targetBrand": "MuscleBlaze|HK Vitals|TrueBasics",
      "confidence": 85,
      "whyItWorks": "CEO-level explanation in 1-2 sentences",
      "supportingData": ["quote or insight 1", "insight 2"],
      "status": "selected|rejected",
      "rejectionReason": "only if rejected",
      "existingComparison": "How this compares to our current flavors for this product",
      "promotionOpportunity": "If an existing flavor needs better marketing, mention here",
      "analysis": {
        "marketDemand": "What's driving demand",
        "competitorGap": "What competitors don't have",
        "consumerPainPoint": "Problem being solved",
        "riskFactors": ["risk 1", "risk 2"]
      },
      "negativeFeedback": ["related complaint this addresses"]
    }
  ],
  "goldenCandidate": {
    "recommendationId": "rec-1",
    "totalMentions": 25,
    "sentimentScore": 0.92,
    "negativeMentions": 8,
    "marketGap": "Market opportunity description",
    "competitiveAdvantage": "Why HealthKart should launch this FIRST"
  },
  "dataQuality": {
    "postsAnalyzed": number,
    "commentsAnalyzed": number,
    "relevantDiscussions": number
  }
}

**CRITICAL RULES:**
- Provide MINIMUM 6 recommendations (2+ per brand)
- Focus on INDIAN market preferences (chai, kesar, pista, aam panna, nimbu, etc.)
- Compare to existing catalog - don't recommend what we already have
- Identify existing flavors that need better PROMOTION (Kulfi, Malai Paneer, Kesar Pista Badam are undermarketed)
- Look for competitor weaknesses to exploit

**TRENDING KEYWORDS MUST BE SPECIFIC FLAVORS:**
✅ Good examples: "Mango Lassi", "Dark Chocolate", "Salted Caramel", "Kesar Pista", "Masala Chai", "Paan", "Guava"
❌ Bad examples: "plant-based", "protein-rich", "clean label", "savory" (these are categories, not flavors)

**NEGATIVE MENTIONS MUST BE ABOUT OUR CURRENT PRODUCTS:**
- Focus on complaints about our best sellers: Rich Chocolate, Strawberry, Cafe Mocha, Kulfi
- Track sweetness issues, artificial taste, texture problems
- Note which flavors customers wish we had

**BEST SELLER INSIGHTS:**
- Our top sellers: Rich Chocolate (Biozyme), Cafe Mocha, Strawberry Shake
- Underperforming: Malai Paneer, Kulfi (despite being unique Indian flavors)
- Customer favorites from competitors: ON's Kaju Katli, MyProtein's Salted Caramel

**NEWS ARTICLES TO ANALYZE:**

`;

import { NegativeMention, FlavorAnalysis } from './types';

// Analyze content using Groq LLM
export async function analyzeWithGroq(
  articles: NewsArticle[], 
  excerpts: ContentExcerpt[]
): Promise<{
  trendKeywords: TrendKeyword[];
  recommendations: FlavorRecommendation[];
  goldenCandidate: GoldenCandidate | null;
  negativeMentions: NegativeMention[];
  analysisInsights: string;
  dataQuality: { postsAnalyzed: number; commentsAnalyzed: number; relevantDiscussions: number };
}> {
  const client = getGroqClient();
  const textContent = prepareTextForAnalysis(articles, excerpts);
  const fullPrompt = ANALYSIS_PROMPT + textContent;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert product analyst specializing in the Indian health & fitness market. Respond with valid JSON only, no markdown formatting, no code blocks, just raw JSON.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from Groq LLM');
    }

    const parsed = JSON.parse(responseText);
    
    // Transform recommendations with enhanced analysis
    const recommendations: FlavorRecommendation[] = (parsed.recommendations || []).map((rec: Record<string, unknown>, index: number) => {
      const analysis: FlavorAnalysis | undefined = rec.analysis ? {
        marketDemand: String((rec.analysis as Record<string, unknown>).marketDemand || ''),
        competitorGap: String((rec.analysis as Record<string, unknown>).competitorGap || ''),
        consumerPainPoint: String((rec.analysis as Record<string, unknown>).consumerPainPoint || ''),
        seasonalRelevance: (rec.analysis as Record<string, unknown>).seasonalRelevance 
          ? String((rec.analysis as Record<string, unknown>).seasonalRelevance) 
          : undefined,
        riskFactors: Array.isArray((rec.analysis as Record<string, unknown>).riskFactors) 
          ? ((rec.analysis as Record<string, unknown>).riskFactors as string[]).map(String) 
          : []
      } : undefined;

      return {
        id: rec.id || `rec-${index + 1}`,
        flavorName: String(rec.flavorName || 'Unknown Flavor'),
        productType: String(rec.productType || 'Supplement'),
        targetBrand: (rec.targetBrand as Brand) || 'MuscleBlaze',
        confidence: rec.confidence != null ? Number(rec.confidence) : 50,
        whyItWorks: String(rec.whyItWorks || 'Based on user discussions'),
        supportingData: Array.isArray(rec.supportingData) ? rec.supportingData.map(String) : [],
        status: (rec.status as 'selected' | 'rejected') || 'selected',
        rejectionReason: rec.rejectionReason ? String(rec.rejectionReason) : undefined,
        analysis,
        negativeFeedback: Array.isArray(rec.negativeFeedback) ? rec.negativeFeedback.map(String) : undefined,
        existingComparison: rec.existingComparison ? String(rec.existingComparison) : undefined,
        promotionOpportunity: rec.promotionOpportunity ? String(rec.promotionOpportunity) : undefined
      };
    });

    const trendKeywords: TrendKeyword[] = (parsed.trendKeywords || []).map((kw: Record<string, unknown>) => ({
      text: String(kw.text || ''),
      value: kw.value != null ? Number(kw.value) : 1,
      sentiment: (kw.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral',
      context: kw.context ? String(kw.context) : undefined
    })).filter((kw: TrendKeyword) => kw.text.length > 0);

    // Parse negative mentions
    const negativeMentions: NegativeMention[] = (parsed.negativeMentions || []).map((nm: Record<string, unknown>) => ({
      flavor: String(nm.flavor || ''),
      complaint: String(nm.complaint || ''),
      frequency: nm.frequency != null ? Number(nm.frequency) : 1,
      source: String(nm.source || 'Unknown')
    })).filter((nm: NegativeMention) => nm.flavor.length > 0);

    // Build golden candidate with enhanced fields
    let goldenCandidate: GoldenCandidate | null = null;
    if (parsed.goldenCandidate?.recommendationId) {
      const topRec = recommendations.find(r => r.id === parsed.goldenCandidate.recommendationId);
      if (topRec) {
        goldenCandidate = {
          recommendation: topRec,
          rank: 1,
          totalMentions: parsed.goldenCandidate.totalMentions != null 
            ? Number(parsed.goldenCandidate.totalMentions) 
            : 10,
          sentimentScore: parsed.goldenCandidate.sentimentScore != null 
            ? Number(parsed.goldenCandidate.sentimentScore) 
            : 0.8,
          negativeMentions: parsed.goldenCandidate.negativeMentions != null
            ? Number(parsed.goldenCandidate.negativeMentions)
            : 0,
          marketGap: parsed.goldenCandidate.marketGap 
            ? String(parsed.goldenCandidate.marketGap) 
            : 'Strong market opportunity identified',
          competitiveAdvantage: parsed.goldenCandidate.competitiveAdvantage
            ? String(parsed.goldenCandidate.competitiveAdvantage)
            : 'First-mover advantage in emerging flavor segment'
        };
      }
    }

    // Fallback: pick highest confidence selected recommendation
    if (!goldenCandidate) {
      const selected = recommendations.filter(r => r.status === 'selected');
      if (selected.length > 0) {
        const top = selected.reduce((a, b) => a.confidence > b.confidence ? a : b);
        goldenCandidate = {
          recommendation: top,
          rank: 1,
          totalMentions: Math.round(top.confidence / 4),
          sentimentScore: top.confidence / 100,
          negativeMentions: 0,
          marketGap: `Strong demand identified for ${top.flavorName} in the ${top.productType} category`,
          competitiveAdvantage: 'First-mover advantage in this flavor segment'
        };
      }
    }

    const dataQuality = {
      postsAnalyzed: articles.length,
      commentsAnalyzed: excerpts.length,
      relevantDiscussions: parsed.dataQuality?.relevantDiscussions != null 
        ? Number(parsed.dataQuality.relevantDiscussions) 
        : Math.min(articles.length, 20)
    };

    const analysisInsights = parsed.analysisInsights 
      ? String(parsed.analysisInsights) 
      : 'Analysis completed based on current market trends and consumer discussions.';

    return { trendKeywords, recommendations, goldenCandidate, negativeMentions, analysisInsights, dataQuality };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw error;
      }
      throw new Error(`AI analysis failed: ${error.message}`);
    }
    throw new Error('Failed to analyze data with AI');
  }
}

// Validate Groq credentials
export async function validateGroqCredentials(): Promise<boolean> {
  try {
    const client = getGroqClient();
    await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });
    return true;
  } catch {
    return false;
  }
}
