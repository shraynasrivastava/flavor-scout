import Snoowrap from 'snoowrap';
import { RedditPost, RedditComment } from './types';

// Target subreddits for flavor trend discovery
export const TARGET_SUBREDDITS = [
  'Supplements',
  'fitness',
  'indianfitness',
  'gainit',
  'loseit',
  'nutrition',
  'bodybuilding',
  'veganfitness',
  'HealthyFood',
  'Nootropics'
];

// Keywords to search for flavor-related discussions
export const FLAVOR_KEYWORDS = [
  'protein flavor',
  'whey flavor',
  'best tasting protein',
  'worst flavor',
  'new flavor',
  'protein powder taste',
  'pre workout flavor',
  'bcaa flavor',
  'electrolyte flavor',
  'gummy flavor',
  'supplement taste',
  'chocolate protein',
  'vanilla protein',
  'fruity protein',
  'mango supplement',
  'berry flavor',
  'mint flavor',
  'coffee protein',
  'masala chai',
  'pista flavor',
  'kesar flavor',
  'Indian flavor protein',
  'too sweet protein',
  'natural flavor'
];

// Create Reddit client - throws error if credentials missing
function createRedditClient(): Snoowrap {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error(
      'Reddit API credentials are required. Please configure REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, and REDDIT_PASSWORD in your environment variables.'
    );
  }

  return new Snoowrap({
    userAgent: 'FlavorScout/1.0.0 (by /u/' + username + ')',
    clientId,
    clientSecret,
    username,
    password
  });
}

// Fetch posts from subreddits
export async function fetchRedditPosts(
  limit: number = 100
): Promise<{ posts: RedditPost[]; comments: RedditComment[] }> {
  const client = createRedditClient();
  
  const allPosts: RedditPost[] = [];
  const allComments: RedditComment[] = [];
  const seenPostIds = new Set<string>();

  try {
    // Search across subreddits for flavor-related posts
    for (const keyword of FLAVOR_KEYWORDS.slice(0, 8)) {
      try {
        const searchResults = await client.search({
          query: keyword,
          subreddit: TARGET_SUBREDDITS.join('+'),
          sort: 'relevance',
          time: 'month',
          limit: Math.floor(limit / 8)
        });

        for (const post of searchResults) {
          // Avoid duplicates
          if (seenPostIds.has(post.id)) continue;
          seenPostIds.add(post.id);

          allPosts.push({
            id: post.id,
            title: post.title,
            selftext: post.selftext || '',
            subreddit: post.subreddit.display_name,
            author: post.author?.name || '[deleted]',
            score: post.score,
            created_utc: post.created_utc,
            num_comments: post.num_comments,
            url: `https://reddit.com${post.permalink}`
          });

          // Fetch top comments for posts with engagement
          if (post.num_comments > 0) {
            try {
              const comments = await post.comments.fetchMore({ amount: 15 });
              for (const comment of comments.slice(0, 8)) {
                if (comment.body && comment.body.length > 20 && comment.body !== '[deleted]') {
                  allComments.push({
                    id: comment.id,
                    body: comment.body,
                    author: comment.author?.name || '[deleted]',
                    score: comment.score,
                    created_utc: comment.created_utc
                  });
                }
              }
            } catch {
              // Skip if comments can't be fetched
              continue;
            }
          }
        }
      } catch {
        // Skip keyword if search fails
        continue;
      }
    }

    // Also fetch hot posts from supplement subreddits
    for (const subreddit of ['Supplements', 'fitness', 'indianfitness'].slice(0, 3)) {
      try {
        const hotPosts = await client.getSubreddit(subreddit).getHot({ limit: 20 });
        for (const post of hotPosts) {
          if (seenPostIds.has(post.id)) continue;
          
          // Filter for flavor-related content
          const text = (post.title + ' ' + post.selftext).toLowerCase();
          const isFlavorRelated = FLAVOR_KEYWORDS.some(kw => 
            text.includes(kw.toLowerCase().split(' ')[0])
          );
          
          if (isFlavorRelated) {
            seenPostIds.add(post.id);
            allPosts.push({
              id: post.id,
              title: post.title,
              selftext: post.selftext || '',
              subreddit: post.subreddit.display_name,
              author: post.author?.name || '[deleted]',
              score: post.score,
              created_utc: post.created_utc,
              num_comments: post.num_comments,
              url: `https://reddit.com${post.permalink}`
            });
          }
        }
      } catch {
        continue;
      }
    }

    if (allPosts.length === 0) {
      throw new Error('No posts found. Please check your Reddit API credentials and try again.');
    }

    return { posts: allPosts, comments: allComments };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch Reddit data. Please verify your API credentials.');
  }
}

// Check if Reddit credentials are configured
export function hasRedditCredentials(): boolean {
  return !!(
    process.env.REDDIT_CLIENT_ID &&
    process.env.REDDIT_CLIENT_SECRET &&
    process.env.REDDIT_USERNAME &&
    process.env.REDDIT_PASSWORD
  );
}
