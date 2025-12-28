import Groq from 'groq-sdk';
import { 
  RedditPost, 
  RedditComment, 
  TrendKeyword, 
  FlavorRecommendation, 
  GoldenCandidate,
  Brand,
  BRAND_PROFILES
} from './types';

// Initialize Groq client
function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('Groq API key not configured. Using mock analysis.');
    return null;
  }
  return new Groq({ apiKey });
}

// Combine posts and comments into analyzable text
function prepareTextForAnalysis(posts: RedditPost[], comments: RedditComment[]): string {
  const postTexts = posts.map(p => `[Post] ${p.title}\n${p.selftext}`).join('\n\n');
  const commentTexts = comments.map(c => `[Comment] ${c.body}`).join('\n\n');
  return `${postTexts}\n\n${commentTexts}`;
}

// Main analysis prompt
const ANALYSIS_PROMPT = `You are a product analyst for HealthKart, analyzing social media discussions to discover flavor trends for their supplement brands:

**Brand Profiles:**
1. **MuscleBlaze** - Hardcore gym performance brand. Target: Serious fitness enthusiasts & bodybuilders. Flavor style: Bold, intense flavors (Dark Chocolate, Black Coffee, Strong Mint)
2. **HK Vitals** - Wellness lifestyle brand. Target: Health-conscious everyday consumers. Flavor style: Refreshing, light flavors (Mango, Mixed Berry, Watermelon, Litchi)  
3. **TrueBasics** - Premium health supplements. Target: Premium segment seeking quality. Flavor style: Sophisticated, unique flavors (Kesar Pista, Green Tea Matcha, Rose Cardamom)

**Your Task:**
Analyze the social media discussions below and extract:

1. **Trending Flavor Keywords**: Identify flavor-related words/phrases mentioned. For each, determine if sentiment is positive, negative, or neutral.

2. **Flavor Recommendations**: Based on user discussions, recommend new flavors. For each recommendation:
   - Suggest a specific flavor name
   - Match it to the most appropriate brand
   - Provide a confidence score (0-100)
   - Write a "Why this works" explanation in PLAIN BUSINESS LANGUAGE (not technical jargon)
   - Mark as "selected" (good opportunity) or "rejected" (too risky/niche)

3. **Golden Candidate**: Identify the #1 strongest recommendation with the highest potential.

**Important Guidelines:**
- Filter out spam, off-topic content, and irrelevant discussions
- Focus on actionable insights that a non-technical product manager can understand
- Explain WHY something would work, not just WHAT users are saying
- Consider market gaps and unmet needs
- Base recommendations on actual user pain points and desires

**Output Format (JSON):**
{
  "trendKeywords": [
    {"text": "flavor name", "value": mention_count, "sentiment": "positive|negative|neutral"}
  ],
  "recommendations": [
    {
      "id": "unique_id",
      "flavorName": "Specific Flavor Name",
      "productType": "Whey Protein|BCAA|Pre-Workout|Electrolytes|Gummies|Multivitamin",
      "targetBrand": "MuscleBlaze|HK Vitals|TrueBasics",
      "confidence": 85,
      "whyItWorks": "Plain language explanation of why this flavor would succeed",
      "supportingData": ["quote or insight 1", "quote or insight 2"],
      "status": "selected|rejected",
      "rejectionReason": "only if rejected - why it's too risky"
    }
  ],
  "goldenCandidate": {
    "recommendationId": "id of the top recommendation",
    "totalMentions": 15,
    "sentimentScore": 0.85,
    "marketGap": "Plain language description of the market opportunity"
  }
}

**Social Media Discussions to Analyze:**
`;

// Analyze content using Groq LLM
export async function analyzeWithGroq(
  posts: RedditPost[], 
  comments: RedditComment[]
): Promise<{
  trendKeywords: TrendKeyword[];
  recommendations: FlavorRecommendation[];
  goldenCandidate: GoldenCandidate | null;
}> {
  const client = getGroqClient();
  
  if (!client) {
    return getMockAnalysis();
  }

  const textContent = prepareTextForAnalysis(posts, comments);
  const fullPrompt = ANALYSIS_PROMPT + textContent;

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert product analyst. Always respond with valid JSON only, no markdown formatting or extra text.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    const parsed = JSON.parse(responseText);
    
    // Transform the response to match our types
    const recommendations: FlavorRecommendation[] = (parsed.recommendations || []).map((rec: Record<string, unknown>, index: number) => ({
      id: rec.id || `rec-${index}`,
      flavorName: rec.flavorName as string,
      productType: rec.productType as string,
      targetBrand: rec.targetBrand as Brand,
      confidence: rec.confidence as number,
      whyItWorks: rec.whyItWorks as string,
      supportingData: rec.supportingData as string[],
      status: rec.status as 'selected' | 'rejected',
      rejectionReason: rec.rejectionReason as string | undefined
    }));

    const trendKeywords: TrendKeyword[] = (parsed.trendKeywords || []).map((kw: Record<string, unknown>) => ({
      text: kw.text as string,
      value: kw.value as number,
      sentiment: kw.sentiment as 'positive' | 'negative' | 'neutral'
    }));

    let goldenCandidate: GoldenCandidate | null = null;
    if (parsed.goldenCandidate && parsed.goldenCandidate.recommendationId) {
      const topRec = recommendations.find(r => r.id === parsed.goldenCandidate.recommendationId);
      if (topRec) {
        goldenCandidate = {
          recommendation: topRec,
          rank: 1,
          totalMentions: parsed.goldenCandidate.totalMentions || 0,
          sentimentScore: parsed.goldenCandidate.sentimentScore || 0,
          marketGap: parsed.goldenCandidate.marketGap || ''
        };
      }
    }

    // If no golden candidate from LLM, pick the highest confidence selected recommendation
    if (!goldenCandidate) {
      const selected = recommendations.filter(r => r.status === 'selected');
      if (selected.length > 0) {
        const top = selected.reduce((a, b) => a.confidence > b.confidence ? a : b);
        goldenCandidate = {
          recommendation: top,
          rank: 1,
          totalMentions: trendKeywords.find(k => k.text.toLowerCase().includes(top.flavorName.toLowerCase().split(' ')[0]))?.value || 10,
          sentimentScore: 0.85,
          marketGap: `Strong demand for ${top.flavorName} in the ${top.productType} category`
        };
      }
    }

    return { trendKeywords, recommendations, goldenCandidate };
  } catch (error) {
    console.error('Error analyzing with Groq:', error);
    return getMockAnalysis();
  }
}

// Mock analysis for development/demo
function getMockAnalysis(): {
  trendKeywords: TrendKeyword[];
  recommendations: FlavorRecommendation[];
  goldenCandidate: GoldenCandidate | null;
} {
  const trendKeywords: TrendKeyword[] = [
    { text: 'Masala Chai', value: 45, sentiment: 'positive' },
    { text: 'Kesar Pista', value: 38, sentiment: 'positive' },
    { text: 'Dark Chocolate', value: 35, sentiment: 'positive' },
    { text: 'Watermelon', value: 32, sentiment: 'positive' },
    { text: 'Mango Lassi', value: 28, sentiment: 'positive' },
    { text: 'Coffee', value: 25, sentiment: 'positive' },
    { text: 'Too Sweet', value: 42, sentiment: 'negative' },
    { text: 'Artificial', value: 30, sentiment: 'negative' },
    { text: 'Green Tea', value: 22, sentiment: 'positive' },
    { text: 'Paan', value: 20, sentiment: 'positive' },
    { text: 'Litchi', value: 18, sentiment: 'positive' },
    { text: 'Blueberry', value: 16, sentiment: 'positive' },
    { text: 'Rose', value: 15, sentiment: 'neutral' },
    { text: 'Coconut', value: 14, sentiment: 'positive' },
    { text: 'Vanilla', value: 12, sentiment: 'neutral' }
  ];

  const recommendations: FlavorRecommendation[] = [
    {
      id: 'rec-1',
      flavorName: 'Kesar Pista',
      productType: 'Whey Protein',
      targetBrand: 'TrueBasics',
      confidence: 92,
      whyItWorks: 'Users are actively requesting this premium Indian flavor. It combines the beloved taste of saffron and pistachio that evokes luxury, perfectly matching TrueBasics\' premium positioning. No major competitor offers this.',
      supportingData: [
        '"Kesar Pista is literally my favorite ice cream flavor. A protein powder version would be premium and unique."',
        '"HealthKart should make this!"',
        '38 mentions with 94% positive sentiment'
      ],
      status: 'selected'
    },
    {
      id: 'rec-2',
      flavorName: 'Masala Chai',
      productType: 'Whey Protein',
      targetBrand: 'MuscleBlaze',
      confidence: 88,
      whyItWorks: 'Highest volume of requests in Indian fitness communities. Users want to combine their morning chai ritual with protein intake. This solves a real convenience need for Indian gym-goers.',
      supportingData: [
        '"Why don\'t more brands make Masala Chai protein?"',
        '"Especially if it has real chai spices like cardamom and ginger"',
        '45 mentions with 89% positive sentiment'
      ],
      status: 'selected'
    },
    {
      id: 'rec-3',
      flavorName: 'Dark Cocoa Intense',
      productType: 'Whey Protein',
      targetBrand: 'MuscleBlaze',
      confidence: 85,
      whyItWorks: 'Users are complaining that current chocolate flavors are too sweet. A bitter, less sweet dark chocolate variant solves this specific pain point and appeals to the hardcore gym crowd.',
      supportingData: [
        '"Looking for a protein powder that actually tastes like real dark chocolate"',
        '"The problem with most chocolate proteins is they use cheap cocoa"',
        '35 mentions of dark chocolate preference'
      ],
      status: 'selected'
    },
    {
      id: 'rec-4',
      flavorName: 'Watermelon Splash',
      productType: 'Electrolytes',
      targetBrand: 'HK Vitals',
      confidence: 82,
      whyItWorks: 'Marathon runners and fitness enthusiasts love the refreshing, natural taste of watermelon. It\'s perfect for HK Vitals\' wellness-focused, lighter flavor profile.',
      supportingData: [
        '"Watermelon flavored electrolytes are so refreshing"',
        '"Much better than artificial grape or orange"',
        '32 mentions with positive sentiment'
      ],
      status: 'selected'
    },
    {
      id: 'rec-5',
      flavorName: 'Mango Lassi',
      productType: 'Whey Protein',
      targetBrand: 'HK Vitals',
      confidence: 78,
      whyItWorks: 'Users are already making DIY mango lassi protein shakes. A ready-made version would save time and deliver consistent taste. Perfect summer flavor for health-conscious consumers.',
      supportingData: [
        '"Made an amazing mango lassi protein shake today!"',
        '"Wish there was a dedicated mango lassi flavor"',
        '28 mentions, high engagement'
      ],
      status: 'selected'
    },
    {
      id: 'rec-6',
      flavorName: 'Green Tea Matcha',
      productType: 'Whey Protein',
      targetBrand: 'TrueBasics',
      confidence: 75,
      whyItWorks: 'Appeals to health-conscious consumers who value antioxidants. The subtle, earthy flavor matches TrueBasics\' sophisticated positioning and attracts the wellness-premium segment.',
      supportingData: [
        '"Love the antioxidant benefits and the subtle flavor"',
        '"Has a subtle earthy flavor that mixes well"',
        '22 mentions in vegan/health communities'
      ],
      status: 'selected'
    },
    {
      id: 'rec-7',
      flavorName: 'Paan Fusion',
      productType: 'BCAA',
      targetBrand: 'MuscleBlaze',
      confidence: 65,
      whyItWorks: 'Highly unique and conversation-worthy flavor that could go viral. The refreshing mint and fennel would be genuinely refreshing during workouts.',
      supportingData: [
        '"The mint and fennel would be so refreshing post-workout"',
        '"I\'d definitely try it"',
        '20 mentions, high curiosity'
      ],
      status: 'selected'
    },
    {
      id: 'rec-8',
      flavorName: 'Rose Cardamom',
      productType: 'Whey Protein',
      targetBrand: 'TrueBasics',
      confidence: 55,
      whyItWorks: 'Unique premium flavor with cultural appeal, but may be too niche for mainstream adoption. Better suited for limited edition release.',
      supportingData: [
        '"Rose flavor in protein? That would be so unique!"',
        '"Rose is used in so many Indian sweets"',
        '15 mentions, polarizing sentiment'
      ],
      status: 'rejected',
      rejectionReason: 'Flavor may be too polarizing for mainstream market. Consider as limited edition only.'
    },
    {
      id: 'rec-9',
      flavorName: 'Coconut Kheer',
      productType: 'Whey Protein',
      targetBrand: 'HK Vitals',
      confidence: 50,
      whyItWorks: 'Appeals to those who love traditional Indian desserts, but the savory-sweet crossover may confuse consumers.',
      supportingData: [
        '"Coconut protein with a hint of cardamom would be like drinking a healthy kheer!"',
        '14 mentions, niche interest'
      ],
      status: 'rejected',
      rejectionReason: 'May not appeal to mainstream audience. Dessert flavors in protein can be hit or miss.'
    }
  ];

  const goldenCandidate: GoldenCandidate = {
    recommendation: recommendations[0],
    rank: 1,
    totalMentions: 38,
    sentimentScore: 0.94,
    marketGap: 'No major protein brand currently offers a Kesar Pista flavor, despite it being one of India\'s most beloved premium dessert flavors. This represents a clear first-mover advantage in the premium supplement segment.'
  };

  return { trendKeywords, recommendations, goldenCandidate };
}

