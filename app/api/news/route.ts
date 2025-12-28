import { NextResponse } from 'next/server';
import { fetchNewsArticles, TARGET_SOURCES, hasNewsAPICredentials } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    // Check credentials are configured
    if (!hasNewsAPICredentials()) {
      return NextResponse.json(
        { 
          error: 'NewsAPI key not configured',
          message: 'Please add NEWS_API_KEY to your environment variables. Get your free key at https://newsapi.org/register'
        },
        { status: 401 }
      );
    }

    const { posts, comments } = await fetchNewsArticles(50);

    return NextResponse.json({
      articles: posts,
      contentExcerpts: comments,
      sources: TARGET_SOURCES,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[News API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch news data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

