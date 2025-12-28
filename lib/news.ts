import { NewsArticle, ContentExcerpt } from './types';

// Expanded search queries for comprehensive coverage
export const SEARCH_QUERIES = [
  // HealthKart & Brand Specific
  'HealthKart products India',
  'MuscleBlaze protein flavor',
  'MuscleBlaze new product launch',
  'HK Vitals supplements',
  'TrueBasics health products',
  'HealthKart whey protein review',
  
  // Protein & Supplements Flavors
  'protein powder flavors India',
  'best tasting whey protein',
  'chocolate protein powder',
  'vanilla whey protein',
  'new protein flavors 2024',
  'protein shake flavors',
  
  // Indian Market Specific
  'Indian supplement market',
  'fitness supplements India',
  'gym nutrition India',
  'bodybuilding supplements India',
  'health supplements trends India',
  
  // Competitor Products
  'Optimum Nutrition India',
  'MyProtein India flavors',
  'Dymatize protein India',
  'Ultimate Nutrition India',
  'BSN protein flavors',
  'Amway Nutrilite India',
  
  // Flavor Trends
  'mango protein powder',
  'chocolate flavor supplements',
  'berry flavor protein',
  'coffee flavored protein',
  'peanut butter protein',
  'cookies cream protein',
  
  // Health & Wellness
  'multivitamin gummies India',
  'electrolyte drinks India',
  'BCAA supplements flavor',
  'pre workout flavors',
  'mass gainer flavors',
  
  // Consumer Trends
  'protein powder reviews India',
  'supplement taste reviews',
  'best protein powder taste',
  'protein powder comparison India'
];

// NewsAPI configuration
const NEWS_API_BASE = 'https://newsapi.org/v2';

interface NewsAPIArticle {
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
  articles: NewsAPIArticle[];
}

// Check if NewsAPI key is configured
export function hasNewsAPICredentials(): boolean {
  return !!process.env.NEWS_API_KEY;
}

// Fetch news articles about supplements and flavors
export async function fetchNewsArticles(
  limit: number = 200
): Promise<{ posts: NewsArticle[]; comments: ContentExcerpt[] }> {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'NewsAPI key is required. Please configure NEWS_API_KEY in your environment variables. Get your free key at https://newsapi.org/register'
    );
  }

  const allPosts: NewsArticle[] = [];
  const allComments: ContentExcerpt[] = [];
  const seenUrls = new Set<string>();

  try {
    // Search for multiple relevant queries - use more queries for better coverage
    const queriesToUse = SEARCH_QUERIES.slice(0, 15); // Use top 15 queries
    
    for (const query of queriesToUse) {
      try {
        const response = await fetch(
          `${NEWS_API_BASE}/everything?` + new URLSearchParams({
            q: query,
            language: 'en',
            sortBy: 'relevancy',
            pageSize: String(Math.min(20, Math.floor(limit / queriesToUse.length))),
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
          if (response.status === 426) {
            throw new Error('NewsAPI requires HTTPS in production. This works in development.');
          }
          if (response.status === 429) {
            console.warn('NewsAPI rate limit reached, using collected results');
            break;
          }
          console.warn(`NewsAPI error for "${query}":`, errorData.message);
          continue;
        }

        const data: NewsAPIResponse = await response.json();

        for (const article of data.articles) {
          // Skip duplicates
          if (seenUrls.has(article.url)) continue;
          seenUrls.add(article.url);

          // Skip articles without useful content
          if (!article.title || (!article.description && !article.content)) continue;

          // Convert to our article format
          const post: NewsArticle = {
            id: Buffer.from(article.url).toString('base64').slice(0, 20),
            title: article.title,
            content: article.description || article.content || '',
            source: article.source.name || 'News',
            author: article.author || article.source.name || 'Unknown',
            score: Math.floor(Math.random() * 100) + 50, // Simulated engagement
            publishedAt: new Date(article.publishedAt).getTime() / 1000,
            commentCount: 0,
            url: article.url
          };

          allPosts.push(post);

          // Create content excerpts from article content for deeper analysis
          if (article.content && article.content.length > 100) {
            const excerpt: ContentExcerpt = {
              id: `excerpt-${post.id}`,
              body: article.content.replace(/\[\+\d+ chars\]$/, ''), // Remove NewsAPI truncation marker
              author: article.source.name || 'Article Content',
              score: 50,
              publishedAt: post.publishedAt
            };
            allComments.push(excerpt);
          }
          
          // Also add description as separate excerpt for more data
          if (article.description && article.description.length > 50) {
            const descExcerpt: ContentExcerpt = {
              id: `desc-${post.id}`,
              body: article.description,
              author: article.source.name || 'Article Summary',
              score: 60,
              publishedAt: post.publishedAt
            };
            allComments.push(descExcerpt);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('API key')) {
          throw error;
        }
        // Continue with other queries if one fails
        console.warn(`Failed to fetch news for query "${query}":`, error);
        continue;
      }
    }

    // Additional search for health and fitness news from India
    try {
      const indiaQueries = [
        '(protein OR supplement OR fitness) AND India',
        '(whey OR BCAA OR preworkout) AND (flavor OR taste)',
        'HealthKart OR MuscleBlaze OR "HK Vitals"'
      ];
      
      for (const query of indiaQueries) {
        const indiaResponse = await fetch(
          `${NEWS_API_BASE}/everything?` + new URLSearchParams({
            q: query,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: '30',
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
              content: article.description || article.content || '',
              source: article.source.name || 'India News',
              author: article.author || 'Unknown',
              score: Math.floor(Math.random() * 100) + 50,
              publishedAt: new Date(article.publishedAt).getTime() / 1000,
              commentCount: 0,
              url: article.url
            });
          }
        }
      }
    } catch {
      // Non-critical, continue without additional results
    }

    if (allPosts.length === 0) {
      throw new Error('No news articles found. Please try again later or check your API key.');
    }

    console.log(`[NewsAPI] Fetched ${allPosts.length} articles and ${allComments.length} content excerpts`);

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
  'Health & Fitness News',
  'Supplement Industry Publications',
  'India Business News',
  'Wellness & Nutrition Articles',
  'Fitness Magazine Content',
  'Product Review Sites'
];
