/**
 * SerpAPI Client
 *
 * Client for search engine results and market intelligence using SerpAPI.
 * Provides competitor research, trend analysis, and pain point discovery.
 */

import { getJson } from 'serpapi';

/**
 * Competitor result from search
 */
export interface CompetitorResult {
  name: string;
  url: string;
  title: string;
  description: string;
  position: number;
}

/**
 * Market trend data
 */
export interface TrendData {
  keyword: string;
  relatedQueries: string[];
  risingTopics: string[];
  searchVolume?: string;
}

/**
 * Pain point from forum/community search
 */
export interface PainPoint {
  text: string;
  source: string;
  url: string;
  mentions: number;
}

/**
 * Get SerpAPI key from environment
 */
function getSerpApiKey(): string {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    throw new Error('SERP_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Sleep utility for rate limit handling
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for API calls with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[SerpAPI] Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`[SerpAPI] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Search for competitors in a specific industry and location
 *
 * @param industry - Industry or niche (e.g., "coffee shops", "saas crm")
 * @param location - Geographic location (e.g., "New York", "USA", "online")
 * @returns Top 5 competitor results with URLs and descriptions
 */
export async function searchCompetitors(
  industry: string,
  location: string = 'USA'
): Promise<CompetitorResult[]> {
  console.log(`[SerpAPI] Searching competitors for: ${industry} in ${location}`);

  const apiKey = getSerpApiKey();
  const query = `best ${industry} in ${location}`;

  try {
    const results = await retryWithBackoff(async () => {
      const response = await getJson({
        engine: 'google',
        q: query,
        api_key: apiKey,
        location: location !== 'online' ? location : undefined,
        num: 10,
        timeout: 30000,
      });

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from SerpAPI');
      }

      return response;
    });

    // Extract organic results
    const organicResults = (results as any).organic_results || [];
    const competitors: CompetitorResult[] = [];

    for (let i = 0; i < Math.min(5, organicResults.length); i++) {
      const result = organicResults[i];

      if (result.link && result.title) {
        competitors.push({
          name: extractDomain(result.link),
          url: result.link,
          title: result.title,
          description: result.snippet || result.description || '',
          position: i + 1,
        });
      }
    }

    console.log(`[SerpAPI] Found ${competitors.length} competitors for ${industry}`);
    return competitors;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SerpAPI] Competitor search failed:', errorMessage);

    // Check for rate limit
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      throw new Error('SerpAPI rate limit exceeded. Please wait before retrying.');
    }

    throw new Error(`Failed to search competitors: ${errorMessage}`);
  }
}

/**
 * Get market trends and related search queries
 *
 * @param keyword - Main keyword to analyze trends for
 * @returns Trend data with related queries and rising topics
 */
export async function getMarketTrends(keyword: string): Promise<TrendData> {
  console.log(`[SerpAPI] Getting market trends for: ${keyword}`);

  const apiKey = getSerpApiKey();

  try {
    // Search for related queries
    const relatedSearches = await retryWithBackoff(async () => {
      const response = await getJson({
        engine: 'google',
        q: keyword,
        api_key: apiKey,
        num: 5,
        timeout: 30000,
      });

      return response;
    });

    const related = (relatedSearches as any).related_searches || [];
    const relatedQueries = related
      .map((item: any) => item.query || item.text)
      .filter(Boolean)
      .slice(0, 10);

    // Search for trending topics
    const trendQuery = `${keyword} trends 2025`;
    const trendSearches = await retryWithBackoff(async () => {
      const response = await getJson({
        engine: 'google',
        q: trendQuery,
        api_key: apiKey,
        num: 5,
        timeout: 30000,
      });

      return response;
    });

    const organicResults = (trendSearches as any).organic_results || [];
    const risingTopics: string[] = [];

    // Extract keywords from trending search results
    for (const result of organicResults.slice(0, 5)) {
      if (result.title) {
        // Extract key phrases from titles
        const words = result.title
          .toLowerCase()
          .split(/\s+/)
          .filter((word: string) => word.length > 4)
          .slice(0, 3);
        risingTopics.push(...words);
      }
    }

    const trendData: TrendData = {
      keyword,
      relatedQueries,
      risingTopics: Array.from(new Set(risingTopics)).slice(0, 10),
    };

    console.log(
      `[SerpAPI] Found ${trendData.relatedQueries.length} related queries and ${trendData.risingTopics.length} rising topics`
    );

    return trendData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SerpAPI] Trend analysis failed:', errorMessage);

    // Check for rate limit
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      throw new Error('SerpAPI rate limit exceeded. Please wait before retrying.');
    }

    throw new Error(`Failed to get market trends: ${errorMessage}`);
  }
}

/**
 * Search for pain points and problems related to a product
 *
 * @param product - Product or service to find pain points for
 * @returns Array of pain points extracted from forums and communities
 */
export async function searchPainPoints(product: string): Promise<PainPoint[]> {
  console.log(`[SerpAPI] Searching pain points for: ${product}`);

  const apiKey = getSerpApiKey();
  const queries = [
    `${product} problems site:reddit.com`,
    `${product} issues site:reddit.com`,
    `${product} complaints`,
  ];

  const painPoints: PainPoint[] = [];

  try {
    for (const query of queries) {
      try {
        const results = await retryWithBackoff(async () => {
          const response = await getJson({
            engine: 'google',
            q: query,
            api_key: apiKey,
            num: 5,
            timeout: 30000,
          });

          return response;
        }, 2); // Fewer retries per query to avoid rate limits

        const organicResults = (results as any).organic_results || [];

        for (const result of organicResults) {
          if (result.snippet && result.link) {
            painPoints.push({
              text: result.snippet,
              source: query.includes('reddit') ? 'Reddit' : 'Web',
              url: result.link,
              mentions: 1, // Would need more sophisticated analysis for actual count
            });
          }
        }

        // Small delay between queries to avoid rate limits
        await sleep(500);
      } catch (error) {
        console.warn(`[SerpAPI] Query "${query}" failed, continuing...`);
        // Continue with other queries even if one fails
      }
    }

    // Deduplicate similar pain points
    const uniquePainPoints = deduplicatePainPoints(painPoints);

    console.log(`[SerpAPI] Found ${uniquePainPoints.length} unique pain points for ${product}`);
    return uniquePainPoints.slice(0, 10);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SerpAPI] Pain point search failed:', errorMessage);

    // Check for rate limit
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      throw new Error('SerpAPI rate limit exceeded. Please wait before retrying.');
    }

    throw new Error(`Failed to search pain points: ${errorMessage}`);
  }
}

/**
 * Extract domain name from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Deduplicate similar pain points based on text similarity
 */
function deduplicatePainPoints(painPoints: PainPoint[]): PainPoint[] {
  const unique: PainPoint[] = [];
  const seen = new Set<string>();

  for (const point of painPoints) {
    // Create a normalized key for comparison
    const key = point.text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .slice(0, 50);

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(point);
    }
  }

  return unique;
}

/**
 * Complete market research combining all SerpAPI functions
 *
 * @param industry - Industry to research
 * @param product - Product name
 * @param location - Geographic location
 * @returns Combined research data
 */
export async function conductMarketResearch(
  industry: string,
  product: string,
  location: string = 'USA'
): Promise<{
  competitors: CompetitorResult[];
  trends: TrendData;
  painPoints: PainPoint[];
}> {
  console.log(`[SerpAPI] Starting complete market research for: ${product} in ${industry}`);

  try {
    // Run all research in parallel for efficiency
    const [competitors, trends, painPoints] = await Promise.all([
      searchCompetitors(industry, location),
      getMarketTrends(product),
      searchPainPoints(product),
    ]);

    console.log('[SerpAPI] Market research completed successfully');

    return {
      competitors,
      trends,
      painPoints,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SerpAPI] Market research failed:', errorMessage);
    throw new Error(`Market research failed: ${errorMessage}`);
  }
}
