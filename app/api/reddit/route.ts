import { NextResponse } from 'next/server';
import { fetchRedditPosts, TARGET_SUBREDDITS } from '@/lib/reddit';
import { RedditFetchResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { posts, comments } = await fetchRedditPosts(50);

    const response: RedditFetchResponse = {
      posts,
      comments,
      subreddits: TARGET_SUBREDDITS,
      fetchedAt: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Reddit data' },
      { status: 500 }
    );
  }
}

