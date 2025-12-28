import { NextRequest, NextResponse } from 'next/server';
import { fetchNewsArticles, getCacheInfo } from '@/lib/news';
import { analyzeWithGroq } from '@/lib/groq';
import { AnalysisResponse, FlavorMention } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for API calls

// Fallback cache to store last successful analysis
interface FallbackCache {
  data: (AnalysisResponse & { cacheInfo?: CacheInfoType }) | null;
  timestamp: number;
  error?: string;
}

interface CacheInfoType {
  usedCache: boolean;
  cacheAgeSeconds: number;
  totalApiFetches: number;
  isFallback?: boolean;
  fallbackReason?: string;
}

const fallbackCache: FallbackCache = {
  data: null,
  timestamp: 0
};

// Helper to get fallback response
function getFallbackResponse(errorMessage: string): (AnalysisResponse & { cacheInfo?: CacheInfoType }) | null {
  if (!fallbackCache.data) return null;
  
  const ageSeconds = Math.floor((Date.now() - fallbackCache.timestamp) / 1000);
  
  return {
    ...fallbackCache.data,
    cacheInfo: {
      ...fallbackCache.data.cacheInfo,
      usedCache: true,
      cacheAgeSeconds: ageSeconds,
      totalApiFetches: fallbackCache.data.cacheInfo?.totalApiFetches || 0,
      isFallback: true,
      fallbackReason: errorMessage
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check if force refresh is requested via query param
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Validate environment variables first
    const missingVars = [];
    if (!process.env.NEWS_API_KEY) missingVars.push('NEWS_API_KEY');
    if (!process.env.GROQ_API_KEY) missingVars.push('GROQ_API_KEY');

    if (missingVars.length > 0) {
      // Try fallback if credentials are missing but we have cached data
      const fallback = getFallbackResponse(`Missing credentials: ${missingVars.join(', ')}`);
      if (fallback) {
        console.log('[Flavor Scout] Using fallback data due to missing credentials');
        return NextResponse.json(fallback);
      }
      
      return NextResponse.json(
        { 
          error: 'Missing API credentials',
          message: `Please configure the following environment variables: ${missingVars.join(', ')}`,
          missingVars,
          hint: 'Get your free NewsAPI key at https://newsapi.org/register and Groq key at https://console.groq.com/keys'
        },
        { status: 503 }
      );
    }

    // Get cache info before fetching
    const cacheInfoBefore = getCacheInfo();
    
    // Step 1: Fetch news articles (uses cache if available)
    console.log(`[Flavor Scout] Fetching news articles... (forceRefresh: ${forceRefresh})`);
    let posts, comments;
    
    try {
      const newsData = await fetchNewsArticles(200, forceRefresh);
      posts = newsData.posts;
      comments = newsData.comments;
    } catch (newsError) {
      console.error('[Flavor Scout] NewsAPI error:', newsError);
      const errorMsg = newsError instanceof Error ? newsError.message : 'NewsAPI fetch failed';
      
      // Try fallback
      const fallback = getFallbackResponse(`NewsAPI error: ${errorMsg}`);
      if (fallback) {
        console.log('[Flavor Scout] Using fallback data due to NewsAPI error');
        return NextResponse.json(fallback);
      }
      
      throw newsError; // Re-throw if no fallback
    }
    
    // Get cache info after fetching
    const cacheInfoAfter = getCacheInfo();
    const usedCache = !forceRefresh && cacheInfoBefore.isCached;
    
    console.log(`[Flavor Scout] Got ${posts.length} articles (cached: ${usedCache})`);

    if (posts.length === 0) {
      // Try fallback if no articles found
      const fallback = getFallbackResponse('No articles found from NewsAPI');
      if (fallback) {
        console.log('[Flavor Scout] Using fallback data due to no articles');
        return NextResponse.json(fallback);
      }
      
      return NextResponse.json(
        { 
          error: 'No data found',
          message: 'Could not fetch any relevant news articles. Please try again later.'
        },
        { status: 404 }
      );
    }

    // Step 2: Analyze with Groq LLM
    console.log('[Flavor Scout] Analyzing with Groq AI...');
    let trendKeywords, recommendations, goldenCandidate, negativeMentions, analysisInsights;
    
    try {
      const analysisResult = await analyzeWithGroq(posts, comments);
      trendKeywords = analysisResult.trendKeywords;
      recommendations = analysisResult.recommendations;
      goldenCandidate = analysisResult.goldenCandidate;
      negativeMentions = analysisResult.negativeMentions;
      analysisInsights = analysisResult.analysisInsights;
    } catch (groqError) {
      console.error('[Flavor Scout] Groq API error:', groqError);
      const errorMsg = groqError instanceof Error ? groqError.message : 'Groq analysis failed';
      
      // Try fallback
      const fallback = getFallbackResponse(`Groq API error: ${errorMsg}`);
      if (fallback) {
        console.log('[Flavor Scout] Using fallback data due to Groq error');
        return NextResponse.json(fallback);
      }
      
      throw groqError; // Re-throw if no fallback
    }
    
    console.log(`[Flavor Scout] Generated ${recommendations.length} recommendations`);

    // Step 3: Create flavor mentions summary from keywords
    const flavorMentions: FlavorMention[] = trendKeywords
      .filter(kw => kw.sentiment === 'positive')
      .slice(0, 10)
      .map(kw => ({
        flavor: kw.text,
        count: kw.value,
        sentiment: kw.sentiment,
        sources: ['News Articles']
      }));

    // Build response with cache info
    const response: AnalysisResponse & { cacheInfo?: CacheInfoType } = {
      trendKeywords,
      flavorMentions,
      recommendations,
      goldenCandidate,
      negativeMentions,
      rawPostCount: posts.length,
      analyzedAt: new Date().toISOString(),
      analysisInsights,
      cacheInfo: {
        usedCache,
        cacheAgeSeconds: cacheInfoAfter.ageSeconds,
        totalApiFetches: cacheInfoAfter.fetchCount,
        isFallback: false
      }
    };

    // Save to fallback cache on successful response
    fallbackCache.data = response;
    fallbackCache.timestamp = Date.now();
    console.log('[Flavor Scout] Updated fallback cache with fresh data');

    // Add cache headers for better performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('[Flavor Scout] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isCredentialError = errorMessage.toLowerCase().includes('api key') ||
                              errorMessage.toLowerCase().includes('unauthorized') ||
                              errorMessage.toLowerCase().includes('invalid');
    const isRateLimitError = errorMessage.toLowerCase().includes('rate limit') ||
                              errorMessage.toLowerCase().includes('too many') ||
                              errorMessage.toLowerCase().includes('429');

    // Try fallback for any error
    const fallback = getFallbackResponse(errorMessage);
    if (fallback) {
      console.log('[Flavor Scout] Using fallback data due to error:', errorMessage);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(
      { 
        error: isCredentialError ? 'Authentication failed' : 
               isRateLimitError ? 'Rate limit exceeded' : 'Analysis failed',
        message: errorMessage,
        hint: isCredentialError 
          ? 'Please verify your NewsAPI and Groq API keys are correct.'
          : isRateLimitError
          ? 'API rate limit reached. Please wait a few minutes and try again.'
          : 'Please try again. If the problem persists, check your API credentials.'
      },
      { status: isCredentialError ? 401 : isRateLimitError ? 429 : 500 }
    );
  }
}
