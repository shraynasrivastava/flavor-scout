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
  'veganfitness'
];

// Keywords to search for flavor-related discussions
export const FLAVOR_KEYWORDS = [
  'protein flavor',
  'whey flavor',
  'best tasting',
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
  'mango',
  'berry',
  'mint',
  'coffee',
  'masala',
  'pista',
  'kesar'
];

// Create Reddit client
function createRedditClient(): Snoowrap | null {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.warn('Reddit API credentials not configured. Using mock data.');
    return null;
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
  limit: number = 50
): Promise<{ posts: RedditPost[]; comments: RedditComment[] }> {
  const client = createRedditClient();
  
  // Return mock data if no Reddit credentials
  if (!client) {
    return getMockRedditData();
  }

  const allPosts: RedditPost[] = [];
  const allComments: RedditComment[] = [];

  try {
    // Search across subreddits for flavor-related posts
    for (const keyword of FLAVOR_KEYWORDS.slice(0, 5)) {
      const searchResults = await client.search({
        query: keyword,
        subreddit: TARGET_SUBREDDITS.join('+'),
        sort: 'relevance',
        time: 'month',
        limit: Math.floor(limit / 5)
      });

      for (const post of searchResults) {
        allPosts.push({
          id: post.id,
          title: post.title,
          selftext: post.selftext || '',
          subreddit: post.subreddit.display_name,
          author: post.author.name,
          score: post.score,
          created_utc: post.created_utc,
          num_comments: post.num_comments,
          url: post.url
        });

        // Fetch top comments
        const comments = await post.comments.fetchMore({ amount: 10 });
        for (const comment of comments.slice(0, 5)) {
          if (comment.body && comment.body.length > 10) {
            allComments.push({
              id: comment.id,
              body: comment.body,
              author: comment.author?.name || '[deleted]',
              score: comment.score,
              created_utc: comment.created_utc
            });
          }
        }
      }
    }

    return { posts: allPosts, comments: allComments };
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    return getMockRedditData();
  }
}

// Mock data for development/demo without Reddit API
export function getMockRedditData(): { posts: RedditPost[]; comments: RedditComment[] } {
  const mockPosts: RedditPost[] = [
    {
      id: 'mock1',
      title: 'Best protein powder flavors in 2024? Looking for something not too sweet',
      selftext: 'I\'ve tried ON Gold Standard chocolate and it\'s way too sweet for me. Anyone have recommendations for protein that tastes natural? Thinking about trying unflavored or maybe something like dark chocolate or coffee flavor.',
      subreddit: 'Supplements',
      author: 'fitnessenthusiast',
      score: 156,
      created_utc: Date.now() / 1000 - 86400,
      num_comments: 45,
      url: 'https://reddit.com/r/Supplements/mock1'
    },
    {
      id: 'mock2',
      title: 'Why don\'t more brands make Masala Chai protein?',
      selftext: 'Seriously, I would love a good masala chai whey protein. The Indian market is huge and we love our chai. MuscleBlaze or MyProtein should make this happen!',
      subreddit: 'indianfitness',
      author: 'desilifter',
      score: 234,
      created_utc: Date.now() / 1000 - 172800,
      num_comments: 67,
      url: 'https://reddit.com/r/indianfitness/mock2'
    },
    {
      id: 'mock3',
      title: 'Watermelon electrolytes are a game changer',
      selftext: 'Just tried watermelon flavored electrolytes during my marathon training and they\'re so refreshing. Much better than the artificial grape or orange flavors.',
      subreddit: 'fitness',
      author: 'marathonrunner',
      score: 189,
      created_utc: Date.now() / 1000 - 259200,
      num_comments: 34,
      url: 'https://reddit.com/r/fitness/mock3'
    },
    {
      id: 'mock4',
      title: 'Kesar Pista flavored supplements - would you try it?',
      selftext: 'Just thinking about how awesome a Kesar Pista (saffron pistachio) protein would be. It\'s such a beloved Indian flavor combo. Premium feel too.',
      subreddit: 'indianfitness',
      author: 'supplementgeek',
      score: 312,
      created_utc: Date.now() / 1000 - 345600,
      num_comments: 89,
      url: 'https://reddit.com/r/indianfitness/mock4'
    },
    {
      id: 'mock5',
      title: 'Dark Chocolate protein recommendations?',
      selftext: 'Looking for a protein powder that actually tastes like real dark chocolate, not that overly sweet milk chocolate flavor. I want something bitter and rich.',
      subreddit: 'Supplements',
      author: 'chocoholic_lifter',
      score: 145,
      created_utc: Date.now() / 1000 - 432000,
      num_comments: 52,
      url: 'https://reddit.com/r/Supplements/mock5'
    },
    {
      id: 'mock6',
      title: 'Mango lassi protein shake recipe',
      selftext: 'Made an amazing mango lassi protein shake today! Used vanilla whey + frozen mango + yogurt. Wish there was a dedicated mango lassi flavor though.',
      subreddit: 'fitness',
      author: 'smoothie_king',
      score: 278,
      created_utc: Date.now() / 1000 - 518400,
      num_comments: 41,
      url: 'https://reddit.com/r/fitness/mock6'
    },
    {
      id: 'mock7',
      title: 'Coffee flavored pre-workout that actually works?',
      selftext: 'Need a pre-workout that tastes like real coffee. Most coffee flavors are fake tasting. Want something I can use as a morning coffee replacement.',
      subreddit: 'bodybuilding',
      author: 'caffeine_addict',
      score: 167,
      created_utc: Date.now() / 1000 - 604800,
      num_comments: 38,
      url: 'https://reddit.com/r/bodybuilding/mock7'
    },
    {
      id: 'mock8',
      title: 'Blueberry gummies for vitamins - any good ones?',
      selftext: 'My kids won\'t take regular vitamins but they love gummies. Looking for blueberry flavored multivitamin gummies that aren\'t loaded with sugar.',
      subreddit: 'nutrition',
      author: 'health_mom',
      score: 98,
      created_utc: Date.now() / 1000 - 691200,
      num_comments: 23,
      url: 'https://reddit.com/r/nutrition/mock8'
    },
    {
      id: 'mock9',
      title: 'Paan flavored BCAA - crazy idea or genius?',
      selftext: 'Just had paan after dinner and thought... what if there was a paan flavored BCAA? The mint and fennel would be so refreshing post-workout.',
      subreddit: 'indianfitness',
      author: 'paan_lover',
      score: 445,
      created_utc: Date.now() / 1000 - 777600,
      num_comments: 112,
      url: 'https://reddit.com/r/indianfitness/mock9'
    },
    {
      id: 'mock10',
      title: 'Green tea protein powder - need recommendations',
      selftext: 'Anyone know of a good matcha/green tea flavored protein? I love the antioxidant benefits and the subtle flavor would be great in smoothies.',
      subreddit: 'veganfitness',
      author: 'zen_gains',
      score: 134,
      created_utc: Date.now() / 1000 - 864000,
      num_comments: 29,
      url: 'https://reddit.com/r/veganfitness/mock10'
    },
    {
      id: 'mock11',
      title: 'Chocolate flavors are boring - what unique flavors do you want?',
      selftext: 'I\'m so tired of chocolate and vanilla being the only options. What unique flavors would you buy? I\'d love to see coconut, rose, cardamom, or even savory options.',
      subreddit: 'Supplements',
      author: 'flavor_explorer',
      score: 567,
      created_utc: Date.now() / 1000 - 950400,
      num_comments: 234,
      url: 'https://reddit.com/r/Supplements/mock11'
    },
    {
      id: 'mock12',
      title: 'Litchi flavored electrolytes would be perfect for summer',
      selftext: 'Just had fresh litchi juice and realized this would make an amazing electrolyte flavor. Light, sweet, and super refreshing.',
      subreddit: 'fitness',
      author: 'summer_runner',
      score: 201,
      created_utc: Date.now() / 1000 - 1036800,
      num_comments: 45,
      url: 'https://reddit.com/r/fitness/mock12'
    }
  ];

  const mockComments: RedditComment[] = [
    {
      id: 'c1',
      body: 'I tried MuscleBlaze dark chocolate and it was still too sweet. They need to make an actual bitter dark chocolate variant.',
      author: 'gym_rat',
      score: 45,
      created_utc: Date.now() / 1000 - 100000
    },
    {
      id: 'c2',
      body: 'Masala chai protein would be incredible! I\'d buy this in a heartbeat. Especially if it has real chai spices like cardamom and ginger.',
      author: 'chai_lover',
      score: 89,
      created_utc: Date.now() / 1000 - 150000
    },
    {
      id: 'c3',
      body: 'Kesar Pista is literally my favorite ice cream flavor. A protein powder version would be premium and unique. HealthKart should make this!',
      author: 'indian_bodybuilder',
      score: 123,
      created_utc: Date.now() / 1000 - 200000
    },
    {
      id: 'c4',
      body: 'Watermelon is so underrated. It tastes natural and not artificial like most fruit flavors.',
      author: 'hydration_expert',
      score: 67,
      created_utc: Date.now() / 1000 - 250000
    },
    {
      id: 'c5',
      body: 'Coffee protein would replace my morning coffee and protein shake. Two birds one stone!',
      author: 'busy_professional',
      score: 78,
      created_utc: Date.now() / 1000 - 300000
    },
    {
      id: 'c6',
      body: 'The problem with most chocolate proteins is they use cheap cocoa. A premium dark cocoa would actually taste good.',
      author: 'chocolate_snob',
      score: 56,
      created_utc: Date.now() / 1000 - 350000
    },
    {
      id: 'c7',
      body: 'Mango lassi protein would be amazing for summer! Mix it cold and it\'s basically dessert.',
      author: 'smoothie_addict',
      score: 91,
      created_utc: Date.now() / 1000 - 400000
    },
    {
      id: 'c8',
      body: 'I wish brands would make more Indian flavors. We have such rich flavors like paan, thandai, kesar badam.',
      author: 'desi_fitness',
      score: 134,
      created_utc: Date.now() / 1000 - 450000
    },
    {
      id: 'c9',
      body: 'Blueberry gummies are the only way I can get my vitamins consistently. The flavor masks the vitamin taste.',
      author: 'gummy_fan',
      score: 34,
      created_utc: Date.now() / 1000 - 500000
    },
    {
      id: 'c10',
      body: 'Green tea matcha protein is so good! Has a subtle earthy flavor that mixes well with banana.',
      author: 'matcha_lifter',
      score: 45,
      created_utc: Date.now() / 1000 - 550000
    },
    {
      id: 'c11',
      body: 'Rose flavor in protein? That would be so unique! Rose is used in so many Indian sweets.',
      author: 'flavor_innovator',
      score: 67,
      created_utc: Date.now() / 1000 - 600000
    },
    {
      id: 'c12',
      body: 'Litchi is such a clean, refreshing flavor. Would love to see it in electrolytes or BCAAs.',
      author: 'fruit_fan',
      score: 52,
      created_utc: Date.now() / 1000 - 650000
    },
    {
      id: 'c13',
      body: 'Most protein flavors are way too artificial. We need more natural, less sweet options.',
      author: 'natural_athlete',
      score: 189,
      created_utc: Date.now() / 1000 - 700000
    },
    {
      id: 'c14',
      body: 'Paan BCAA sounds weird but I\'d definitely try it. The refreshing minty taste would be great intra-workout.',
      author: 'curious_lifter',
      score: 78,
      created_utc: Date.now() / 1000 - 750000
    },
    {
      id: 'c15',
      body: 'Coconut protein with a hint of cardamom would be like drinking a healthy kheer!',
      author: 'dessert_protein',
      score: 112,
      created_utc: Date.now() / 1000 - 800000
    }
  ];

  return { posts: mockPosts, comments: mockComments };
}

