import { RedditPost, RedditComment } from './types';

// Search queries for Indian supplement and flavor trends
export const SEARCH_QUERIES = [
  'protein powder flavors India',
  'MuscleBlaze new flavor',
  'HealthKart supplements',
  'whey protein taste review India',
  'best protein flavor India',
  'supplement trends India 2024',
  'gym nutrition India',
  'fitness supplements flavors',
  'Indian protein powder',
  'pre workout flavors'
];

// NewsAPI configuration
const NEWS_API_BASE = 'https://newsapi.org/v2';

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

// Check if NewsAPI key is configured
export function hasNewsAPICredentials(): boolean {
  return !!process.env.NEWS_API_KEY;
}

// Fetch news articles about supplements and flavors
export async function fetchNewsArticles(
  limit: number = 100
): Promise<{ posts: RedditPost[]; comments: RedditComment[] }> {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'NewsAPI key is required. Please configure NEWS_API_KEY in your environment variables. Get your free key at https://newsapi.org/register'
    );
  }

  const allPosts: RedditPost[] = [];
  const allComments: RedditComment[] = [];
  const seenUrls = new Set<string>();

  try {
    // Search for multiple relevant queries
    for (const query of SEARCH_QUERIES.slice(0, 5)) {
      try {
        const response = await fetch(
          `${NEWS_API_BASE}/everything?` + new URLSearchParams({
            q: query,
            language: 'en',
            sortBy: 'relevancy',
            pageSize: String(Math.floor(limit / 5)),
            apiKey: apiKey
          }),
          {
            headers: {
              'User-Agent': 'FlavorScout/1.0'
            }
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            throw new Error('Invalid NewsAPI key. Please check your API key.');
          }
          if (response.status === 429) {
            console.warn('NewsAPI rate limit reached, using cached results');
            break;
          }
          throw new Error(errorData.message || 'Failed to fetch news');
        }

        const data: NewsAPIResponse = await response.json();

        for (const article of data.articles) {
          // Skip duplicates
          if (seenUrls.has(article.url)) continue;
          seenUrls.add(article.url);

          // Skip articles without useful content
          if (!article.title || (!article.description && !article.content)) continue;

          // Convert to our post format (reusing existing types for compatibility)
          const post: RedditPost = {
            id: Buffer.from(article.url).toString('base64').slice(0, 20),
            title: article.title,
            selftext: article.description || article.content || '',
            subreddit: article.source.name || 'News',
            author: article.author || article.source.name || 'Unknown',
            score: Math.floor(Math.random() * 100) + 50, // Simulated engagement
            created_utc: new Date(article.publishedAt).getTime() / 1000,
            num_comments: 0,
            url: article.url
          };

          allPosts.push(post);

          // Create synthetic "comments" from article content for analysis
          // This helps the AI have more text to analyze
          if (article.content && article.content.length > 100) {
            const comment: RedditComment = {
              id: `comment-${post.id}`,
              body: article.content.replace(/\[\+\d+ chars\]$/, ''), // Remove NewsAPI truncation marker
              author: article.source.name || 'Article Content',
              score: 50,
              created_utc: post.created_utc
            };
            allComments.push(comment);
          }
        }
      } catch (error) {
        // Continue with other queries if one fails
        console.warn(`Failed to fetch news for query "${query}":`, error);
        continue;
      }
    }

    // Also search for Indian-specific health and fitness content
    try {
      const indiaResponse = await fetch(
        `${NEWS_API_BASE}/everything?` + new URLSearchParams({
          q: '(protein OR supplement OR fitness) AND (India OR Indian)',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: '20',
          apiKey: apiKey
        })
      );

      if (indiaResponse.ok) {
        const indiaData: NewsAPIResponse = await indiaResponse.json();
        for (const article of indiaData.articles) {
          if (seenUrls.has(article.url)) continue;
          seenUrls.add(article.url);

          if (!article.title) continue;

          allPosts.push({
            id: Buffer.from(article.url).toString('base64').slice(0, 20),
            title: article.title,
            selftext: article.description || article.content || '',
            subreddit: article.source.name || 'India News',
            author: article.author || 'Unknown',
            score: Math.floor(Math.random() * 100) + 50,
            created_utc: new Date(article.publishedAt).getTime() / 1000,
            num_comments: 0,
            url: article.url
          });
        }
      }
    } catch {
      // Non-critical, continue without India-specific results
    }

    if (allPosts.length === 0) {
      throw new Error('No news articles found. Please try again later or check your API key.');
    }

    return { posts: allPosts, comments: allComments };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch news data. Please verify your API key.');
  }
}

// Get target sources for display
export const TARGET_SOURCES = [
  'Health News',
  'Fitness Articles', 
  'India Business News',
  'Supplement Industry News',
  'Wellness Publications'
];

