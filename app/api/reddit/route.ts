import { NextResponse } from 'next/server';
import { fetchRedditPosts, TARGET_SUBREDDITS, hasRedditCredentials } from '@/lib/reddit';
import { RedditFetchResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  try {
    // Check credentials are configured
    if (!hasRedditCredentials()) {
      return NextResponse.json(
        { 
          error: 'Reddit credentials not configured',
          message: 'Please add REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD to your environment variables'
        },
        { status: 401 }
      );
    }

    const { posts, comments } = await fetchRedditPosts(50);

    const response: RedditFetchResponse = {
      posts,
      comments,
      subreddits: TARGET_SUBREDDITS,
      fetchedAt: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Reddit API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Reddit data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
