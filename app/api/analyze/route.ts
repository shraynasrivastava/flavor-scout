import { NextRequest, NextResponse } from 'next/server';
import { fetchNewsArticles, getCacheInfo } from '@/lib/news';
import { analyzeWithGroq } from '@/lib/groq';
import { AnalysisResponse, FlavorMention } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for API calls

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
    const { posts, comments } = await fetchNewsArticles(200, forceRefresh);
    
    // Get cache info after fetching
    const cacheInfoAfter = getCacheInfo();
    const usedCache = !forceRefresh && cacheInfoBefore.isCached;
    
    console.log(`[Flavor Scout] Got ${posts.length} articles (cached: ${usedCache})`);

    if (posts.length === 0) {
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
    const { trendKeywords, recommendations, goldenCandidate, negativeMentions, analysisInsights } = await analyzeWithGroq(posts, comments);
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
    const response: AnalysisResponse & { 
      cacheInfo?: { 
        usedCache: boolean; 
        cacheAgeSeconds: number; 
        totalApiFetches: number;
      } 
    } = {
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
        totalApiFetches: cacheInfoAfter.fetchCount
      }
    };

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

    return NextResponse.json(
      { 
        error: isCredentialError ? 'Authentication failed' : 'Analysis failed',
        message: errorMessage,
        hint: isCredentialError 
          ? 'Please verify your NewsAPI and Groq API keys are correct.'
          : 'Please try again. If the problem persists, check your API credentials.'
      },
      { status: isCredentialError ? 401 : 500 }
    );
  }
}
