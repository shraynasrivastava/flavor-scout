import { NextResponse } from 'next/server';
import { fetchRedditPosts } from '@/lib/reddit';
import { analyzeWithGroq } from '@/lib/groq';
import { AnalysisResponse, FlavorMention } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for API calls

export async function GET() {
  try {
    // Validate environment variables first
    const missingVars = [];
    if (!process.env.REDDIT_CLIENT_ID) missingVars.push('REDDIT_CLIENT_ID');
    if (!process.env.REDDIT_CLIENT_SECRET) missingVars.push('REDDIT_CLIENT_SECRET');
    if (!process.env.REDDIT_USERNAME) missingVars.push('REDDIT_USERNAME');
    if (!process.env.REDDIT_PASSWORD) missingVars.push('REDDIT_PASSWORD');
    if (!process.env.GROQ_API_KEY) missingVars.push('GROQ_API_KEY');

    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing API credentials',
          message: `Please configure the following environment variables: ${missingVars.join(', ')}`,
          missingVars 
        },
        { status: 503 }
      );
    }

    // Step 1: Fetch Reddit data
    console.log('[Flavor Scout] Fetching Reddit data...');
    const { posts, comments } = await fetchRedditPosts(100);
    console.log(`[Flavor Scout] Fetched ${posts.length} posts and ${comments.length} comments`);

    if (posts.length === 0) {
      return NextResponse.json(
        { 
          error: 'No data found',
          message: 'Could not fetch any relevant posts from Reddit. Please try again later.'
        },
        { status: 404 }
      );
    }

    // Step 2: Analyze with Groq LLM
    console.log('[Flavor Scout] Analyzing with Groq AI...');
    const { trendKeywords, recommendations, goldenCandidate, dataQuality } = await analyzeWithGroq(posts, comments);
    console.log(`[Flavor Scout] Generated ${recommendations.length} recommendations`);

    // Step 3: Create flavor mentions summary from keywords
    const flavorMentions: FlavorMention[] = trendKeywords
      .filter(kw => kw.sentiment === 'positive')
      .slice(0, 10)
      .map(kw => ({
        flavor: kw.text,
        count: kw.value,
        sentiment: kw.sentiment,
        sources: ['Reddit']
      }));

    const response: AnalysisResponse = {
      trendKeywords,
      flavorMentions,
      recommendations,
      goldenCandidate,
      rawPostCount: posts.length,
      analyzedAt: new Date().toISOString()
    };

    // Add cache headers for better performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('[Flavor Scout] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isCredentialError = errorMessage.toLowerCase().includes('credential') || 
                              errorMessage.toLowerCase().includes('api key') ||
                              errorMessage.toLowerCase().includes('unauthorized');

    return NextResponse.json(
      { 
        error: isCredentialError ? 'Authentication failed' : 'Analysis failed',
        message: errorMessage,
        hint: isCredentialError 
          ? 'Please verify your Reddit and Groq API credentials are correct.'
          : 'Please try again. If the problem persists, check your API credentials.'
      },
      { status: isCredentialError ? 401 : 500 }
    );
  }
}
