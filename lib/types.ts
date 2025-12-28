// News Article types
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  author: string;
  score: number;
  publishedAt: number;
  commentCount: number;
  url: string;
}

export interface ContentExcerpt {
  id: string;
  body: string;
  author: string;
  score: number;
  publishedAt: number;
}

// Legacy type aliases for compatibility
export type RedditPost = NewsArticle;
export type RedditComment = ContentExcerpt;

// Flavor analysis types
export interface FlavorMention {
  flavor: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sources: string[];
}

export interface TrendKeyword {
  text: string;
  value: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  context?: string; // Brief context about why this is trending
}

// Detailed analysis for why a flavor was selected
export interface FlavorAnalysis {
  marketDemand: string;       // What's driving demand
  competitorGap: string;      // What competitors are missing
  consumerPainPoint: string;  // What problem this solves
  seasonalRelevance?: string; // Seasonal factors
  riskFactors: string[];      // Potential risks
}

// Negative mention tracking
export interface NegativeMention {
  flavor: string;
  complaint: string;
  frequency: number;
  source: string;
}

// Brand types
export type Brand = 'MuscleBlaze' | 'HK Vitals' | 'TrueBasics';

export interface BrandProfile {
  name: Brand;
  description: string;
  targetAudience: string;
  flavorStyle: string;
  color: string;
}

export const BRAND_PROFILES: Record<Brand, BrandProfile> = {
  'MuscleBlaze': {
    name: 'MuscleBlaze',
    description: 'Hardcore gym performance',
    targetAudience: 'Serious fitness enthusiasts and bodybuilders',
    flavorStyle: 'Bold, intense flavors',
    color: '#FF6B35'
  },
  'HK Vitals': {
    name: 'HK Vitals',
    description: 'Wellness lifestyle',
    targetAudience: 'Health-conscious everyday consumers',
    flavorStyle: 'Refreshing, light flavors',
    color: '#4ECDC4'
  },
  'TrueBasics': {
    name: 'TrueBasics',
    description: 'Premium health supplements',
    targetAudience: 'Premium segment seeking quality',
    flavorStyle: 'Sophisticated, unique flavors',
    color: '#9B59B6'
  }
};

// Recommendation types
export interface FlavorRecommendation {
  id: string;
  flavorName: string;
  productType: string;
  targetBrand: Brand;
  confidence: number; // 0-100
  whyItWorks: string;
  supportingData: string[];
  status: 'selected' | 'rejected';
  rejectionReason?: string;
  analysis?: FlavorAnalysis; // Detailed breakdown
  negativeFeedback?: string[]; // Related negative mentions to address
  existingComparison?: string; // How this compares to current flavors
  promotionOpportunity?: string; // If existing flavor needs better marketing
}

export interface GoldenCandidate {
  recommendation: FlavorRecommendation;
  rank: number;
  totalMentions: number;
  sentimentScore: number;
  negativeMentions: number; // Track negative sentiment too
  marketGap: string;
  competitiveAdvantage: string; // Why HealthKart should launch this first
}

// API Response types
export interface AnalysisResponse {
  trendKeywords: TrendKeyword[];
  flavorMentions: FlavorMention[];
  recommendations: FlavorRecommendation[];
  goldenCandidate: GoldenCandidate | null;
  negativeMentions: NegativeMention[]; // Track complaints and issues
  rawPostCount: number;
  analyzedAt: string;
  analysisInsights?: string; // Overall market summary
}

export interface NewsFetchResponse {
  articles: NewsArticle[];
  excerpts: ContentExcerpt[];
  sources: string[];
  fetchedAt: string;
}

// Legacy alias
export type RedditFetchResponse = NewsFetchResponse;

// Dashboard state
export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  data: AnalysisResponse | null;
  selectedBrand: Brand | 'all';
}
