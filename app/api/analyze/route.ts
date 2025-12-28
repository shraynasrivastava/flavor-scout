import { NextResponse } from 'next/server';
import { fetchRedditPosts } from '@/lib/reddit';
import { analyzeWithGroq } from '@/lib/groq';
import { AnalysisResponse, FlavorMention } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for API calls

export async function GET() {
  try {
    // Step 1: Fetch Reddit data
    const { posts, comments } = await fetchRedditPosts(50);

    // Step 2: Analyze with Groq LLM
    const { trendKeywords, recommendations, goldenCandidate } = await analyzeWithGroq(posts, comments);

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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing data:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    );
  }
}

