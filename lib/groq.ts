import Groq from 'groq-sdk';
import { 
  RedditPost, 
  RedditComment, 
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

// Combine articles and content into analyzable text
function prepareTextForAnalysis(posts: RedditPost[], comments: RedditComment[]): string {
  const articleTexts = posts.map(p => 
    `[ARTICLE from ${p.subreddit}]\nHeadline: ${p.title}\n${p.selftext}`
  ).join('\n\n---\n\n');
  
  const contentTexts = comments.map(c => 
    `[ARTICLE CONTENT from ${c.author}]\n${c.body}`
  ).join('\n\n');
  
  return `=== NEWS ARTICLES ===\n${articleTexts}\n\n=== ARTICLE CONTENT ===\n${contentTexts}`;
}

// Main analysis prompt
const ANALYSIS_PROMPT = `You are a senior product analyst at HealthKart, India's leading health and fitness brand. Your job is to analyze news articles and industry content about supplements, fitness, and health trends to discover flavor opportunities for these brands:

**BRAND PROFILES:**

1. **MuscleBlaze** (Orange brand color)
   - Target: Hardcore gym enthusiasts, bodybuilders, serious athletes
   - Product types: Whey Protein, Mass Gainers, Pre-workout, BCAA
   - Flavor style: BOLD, INTENSE, POWERFUL flavors
   - Examples: Dark Chocolate, Rich Coffee, Cookies & Cream, Double Chocolate

2. **HK Vitals** (Teal brand color)
   - Target: Health-conscious everyday consumers, wellness seekers
   - Product types: Multivitamins, Electrolytes, Apple Cider Vinegar, Biotin
   - Flavor style: LIGHT, REFRESHING, NATURAL flavors
   - Examples: Mango, Watermelon, Mixed Berry, Litchi, Orange

3. **TrueBasics** (Purple brand color)
   - Target: Premium health seekers, professionals wanting quality
   - Product types: Omega-3, Immunity boosters, Plant Protein, Collagen
   - Flavor style: SOPHISTICATED, UNIQUE, PREMIUM flavors
   - Examples: Kesar Pista, Green Tea Matcha, Rose Cardamom, Vanilla Bean

**YOUR ANALYSIS TASK:**

Analyze the news articles and industry content below and provide:

1. **TRENDING KEYWORDS**: Extract flavor-related keywords/phrases that users mention. For each:
   - Count how many times it appears (or estimate based on discussion volume)
   - Classify sentiment: "positive" (users want it), "negative" (users complain about it), or "neutral"

2. **FLAVOR RECOMMENDATIONS**: Based on REAL user discussions, recommend specific new flavors:
   - Match each flavor to the most appropriate brand based on positioning
   - Provide confidence score (0-100) based on volume and sentiment of discussions
   - Write "whyItWorks" in PLAIN BUSINESS LANGUAGE that a product manager can understand
     - BAD: "High cosine similarity score detected"
     - GOOD: "Users are frustrated that current chocolate flavors are too sweet - this Dark Cocoa variant directly addresses that pain point"
   - Include actual quotes or paraphrased insights as "supportingData"
   - Mark as "selected" (strong opportunity) or "rejected" (too risky)
   - If rejected, explain why in "rejectionReason"

3. **GOLDEN CANDIDATE**: Identify the single BEST recommendation with highest potential

**CRITICAL RULES:**
- Only extract insights that are ACTUALLY present in the data
- Do not invent or hallucinate flavor requests that aren't discussed
- Focus on Indian market preferences (chai, kesar, pista, etc.) when present
- Identify pain points (too sweet, artificial taste, etc.) as opportunities
- Consider seasonality (summer = refreshing, winter = warm flavors)

**OUTPUT FORMAT (JSON only, no markdown):**
{
  "trendKeywords": [
    {"text": "keyword", "value": estimated_mentions, "sentiment": "positive|negative|neutral"}
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "flavorName": "Specific Flavor Name",
      "productType": "Whey Protein|BCAA|Pre-Workout|Electrolytes|Gummies|Multivitamin",
      "targetBrand": "MuscleBlaze|HK Vitals|TrueBasics",
      "confidence": 85,
      "whyItWorks": "Clear business explanation",
      "supportingData": ["actual quote or insight 1", "insight 2"],
      "status": "selected|rejected",
      "rejectionReason": "only if rejected"
    }
  ],
  "goldenCandidate": {
    "recommendationId": "rec-1",
    "totalMentions": 25,
    "sentimentScore": 0.92,
    "marketGap": "Description of the market opportunity"
  },
  "dataQuality": {
    "postsAnalyzed": number,
    "commentsAnalyzed": number,
    "relevantDiscussions": number
  }
}

**NEWS ARTICLES TO ANALYZE:**

`;

// Analyze content using Groq LLM
export async function analyzeWithGroq(
  posts: RedditPost[], 
  comments: RedditComment[]
): Promise<{
  trendKeywords: TrendKeyword[];
  recommendations: FlavorRecommendation[];
  goldenCandidate: GoldenCandidate | null;
  dataQuality: { postsAnalyzed: number; commentsAnalyzed: number; relevantDiscussions: number };
}> {
  const client = getGroqClient();
  const textContent = prepareTextForAnalysis(posts, comments);
  const fullPrompt = ANALYSIS_PROMPT + textContent;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
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
      temperature: 0.4, // Lower temperature for more consistent, factual outputs
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from Groq LLM');
    }

    const parsed = JSON.parse(responseText);
    
    // Transform and validate the response
    const recommendations: FlavorRecommendation[] = (parsed.recommendations || []).map((rec: Record<string, unknown>, index: number) => ({
      id: rec.id || `rec-${index + 1}`,
      flavorName: String(rec.flavorName || 'Unknown Flavor'),
      productType: String(rec.productType || 'Supplement'),
      targetBrand: (rec.targetBrand as Brand) || 'MuscleBlaze',
      confidence: rec.confidence != null ? Number(rec.confidence) : 50,
      whyItWorks: String(rec.whyItWorks || 'Based on user discussions'),
      supportingData: Array.isArray(rec.supportingData) ? rec.supportingData.map(String) : [],
      status: (rec.status as 'selected' | 'rejected') || 'selected',
      rejectionReason: rec.rejectionReason ? String(rec.rejectionReason) : undefined
    }));

    const trendKeywords: TrendKeyword[] = (parsed.trendKeywords || []).map((kw: Record<string, unknown>) => ({
      text: String(kw.text || ''),
      value: kw.value != null ? Number(kw.value) : 1,
      sentiment: (kw.sentiment as 'positive' | 'negative' | 'neutral') || 'neutral'
    })).filter((kw: TrendKeyword) => kw.text.length > 0);

    // Build golden candidate
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
          marketGap: parsed.goldenCandidate.marketGap 
            ? String(parsed.goldenCandidate.marketGap) 
            : 'Strong market opportunity identified'
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
          marketGap: `Strong demand identified for ${top.flavorName} in the ${top.productType} category`
        };
      }
    }

    const dataQuality = {
      postsAnalyzed: posts.length,
      commentsAnalyzed: comments.length,
      relevantDiscussions: parsed.dataQuality?.relevantDiscussions != null 
        ? Number(parsed.dataQuality.relevantDiscussions) 
        : Math.min(posts.length, 20)
    };

    return { trendKeywords, recommendations, goldenCandidate, dataQuality };
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
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });
    return true;
  } catch {
    return false;
  }
}
