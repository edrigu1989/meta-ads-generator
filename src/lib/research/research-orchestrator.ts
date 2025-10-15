/**
 * Research Orchestrator
 *
 * Coordinates all research activities by combining data from multiple sources:
 * - Firecrawl for brand analysis
 * - SerpAPI for competitor and market research
 * - Creates comprehensive ResearchResult
 */

import { ResearchResult, BrandResearch, ResearchInput } from '@/types/research';
import { researchBrand } from './firecrawl-client';
import {
  searchCompetitors,
  getMarketTrends,
  searchPainPoints,
  type CompetitorResult,
  type TrendData,
  type PainPoint,
} from './serp-client';
import { getCachedResearch, setCachedResearch } from '../cache/redis-client';

/**
 * Run complete research workflow
 *
 * @param input - Research input parameters
 * @param forceRefresh - If true, bypass cache and run fresh research
 * @returns Complete research result
 */
export async function runResearch(
  input: ResearchInput,
  forceRefresh: boolean = false
): Promise<ResearchResult> {
  console.log('[Orchestrator] Starting research workflow');
  console.log('[Orchestrator] Input:', JSON.stringify(input, null, 2));
  console.log(`[Orchestrator] Force refresh: ${forceRefresh}`);

  const startTime = Date.now();

  // Step 0: Check cache (unless force refresh)
  if (!forceRefresh) {
    console.log('[Orchestrator] Checking cache...');
    const cachedResult = await getCachedResearch(input.url);

    if (cachedResult) {
      const duration = Date.now() - startTime;
      console.log(`[Orchestrator] Cache hit! Returned in ${duration}ms`);
      console.log(`[Orchestrator] Quality score: ${cachedResult.qualityScore}/100`);
      return cachedResult;
    }

    console.log('[Orchestrator] Cache miss, running fresh research');
  } else {
    console.log('[Orchestrator] Skipping cache (force refresh requested)');
  }

  try {
    // Step 1: Brand Research (Firecrawl + Claude)
    console.log('[Orchestrator] Step 1/3: Analyzing brand website...');
    let brandResearch: BrandResearch;

    try {
      brandResearch = await researchBrand(input.url);
      console.log(`[Orchestrator] Brand research completed: ${brandResearch.name}`);
    } catch (error) {
      console.error('[Orchestrator] Brand research failed:', error);
      throw new Error(
        `Failed to analyze website: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Step 2 & 3: Market Research (SerpAPI) - Run in parallel
    console.log('[Orchestrator] Step 2-3/3: Conducting market research...');

    // Use provided location or extract from URL as fallback
    const location = input.location || extractLocation(input.url);
    console.log(`[Orchestrator] Using location: ${location}`);

    let competitors: CompetitorResult[] = [];
    let trends: TrendData = {
      keyword: input.productType,
      relatedQueries: [],
      risingTopics: [],
    };
    let painPoints: PainPoint[] = [];

    try {
      // Run market research in parallel for efficiency
      const [competitorResults, trendResults, painPointResults] = await Promise.allSettled([
        searchCompetitors(input.productType, location),
        getMarketTrends(input.productType),
        searchPainPoints(input.productType),
      ]);

      if (competitorResults.status === 'fulfilled') {
        competitors = competitorResults.value;
      } else {
        console.warn('[Orchestrator] Competitor search failed:', competitorResults.reason);
      }

      if (trendResults.status === 'fulfilled') {
        trends = trendResults.value;
      } else {
        console.warn('[Orchestrator] Trend analysis failed:', trendResults.reason);
      }

      if (painPointResults.status === 'fulfilled') {
        painPoints = painPointResults.value;
      } else {
        console.warn('[Orchestrator] Pain point search failed:', painPointResults.reason);
      }

      console.log('[Orchestrator] Market research completed');
    } catch (error) {
      console.warn(
        '[Orchestrator] Some market research failed, continuing with partial data:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // Step 4: Compile Results
    console.log('[Orchestrator] Compiling research results...');

    const result: ResearchResult = {
      brand: brandResearch,
      competitors: {
        competitors: competitors.map((comp) => ({
          name: comp.name,
          url: comp.url,
          strengths: extractStrengths(comp.description),
          weaknesses: [],
        })),
        commonMessages: extractCommonMessages(competitors),
        opportunities: identifyOpportunities(brandResearch, competitors),
        pricingStrategies: [],
        uniqueAngles: suggestUniqueAngles(brandResearch),
      },
      market: {
        trends: trends.risingTopics.map((topic) => ({
          topic,
          volume: 'medium' as const,
          momentum: 'stable' as const,
        })),
        painPoints: painPoints.map((pp) => pp.text),
        popularSearches: trends.relatedQueries,
        seasonalPatterns: [],
        emergingOpportunities: trends.risingTopics.slice(0, 5),
      },
      audience: {
        demographics: {
          ageRanges: inferAgeRanges(brandResearch.targetMarkets),
          locations: [location],
          incomeLevel: inferIncomeLevel(brandResearch.productCategories),
          occupation: inferOccupations(brandResearch.targetMarkets),
        },
        awarenessLevel: inferAwarenessLevel(input.objective),
        commonLanguage: {
          keywords: extractKeywords(brandResearch.valueProposition),
          phrases: brandResearch.differentiators.slice(0, 5),
          jargon: [],
          emotionalTriggers: extractEmotionalTriggers(brandResearch.tone),
        },
        behaviors: {
          purchaseDrivers: brandResearch.differentiators,
          objections: painPoints.map((pp) => pp.text).slice(0, 5),
          preferredChannels: ['online', 'social media'],
        },
      },
      timestamp: new Date().toISOString(),
      cached: false,
      qualityScore: calculateQualityScore({
        hasBrand: !!brandResearch,
        hasCompetitors: competitors.length > 0,
        hasTrends: trends.relatedQueries.length > 0,
        hasPainPoints: painPoints.length > 0,
      }),
      sources: [
        {
          type: 'web-scrape' as const,
          url: input.url,
          reliability: 'high' as const,
        },
        {
          type: 'search-results' as const,
          url: 'https://google.com',
          reliability: 'high' as const,
        },
      ],
    };

    const duration = Date.now() - startTime;
    console.log(`[Orchestrator] Research completed in ${duration}ms`);
    console.log(`[Orchestrator] Quality score: ${result.qualityScore}/100`);

    // Save to cache (async, don't wait for it)
    setCachedResearch(input.url, result).catch((error) => {
      console.error('[Orchestrator] Failed to cache research:', error);
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Orchestrator] Research failed after ${duration}ms:`, error);
    throw error;
  }
}

// Helper functions

function extractLocation(url: string): string {
  // Simple heuristic - could be enhanced
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('.uk')) return 'United Kingdom';
    if (hostname.includes('.ca')) return 'Canada';
    if (hostname.includes('.au')) return 'Australia';
    return 'USA';
  } catch {
    return 'USA';
  }
}

function extractStrengths(description: string): string[] {
  const strengths: string[] = [];
  const keywords = ['best', 'top', 'leading', 'popular', 'trusted', 'award', 'certified'];

  keywords.forEach((keyword) => {
    if (description.toLowerCase().includes(keyword)) {
      strengths.push(`Recognized as ${keyword} in market`);
    }
  });

  return strengths.slice(0, 3);
}

function extractCommonMessages(competitors: CompetitorResult[]): string[] {
  const messages = new Set<string>();

  competitors.forEach((comp) => {
    const desc = comp.description.toLowerCase();
    if (desc.includes('quality')) messages.add('Focus on quality');
    if (desc.includes('affordable') || desc.includes('price')) messages.add('Competitive pricing');
    if (desc.includes('fast') || desc.includes('quick')) messages.add('Speed and efficiency');
    if (desc.includes('service')) messages.add('Customer service focus');
    if (desc.includes('expert')) messages.add('Expertise and experience');
  });

  return Array.from(messages).slice(0, 5);
}

function identifyOpportunities(
  brand: BrandResearch,
  competitors: CompetitorResult[]
): string[] {
  const opportunities: string[] = [];

  // Look for gaps in competitor messaging
  if (brand.differentiators.length > 0) {
    opportunities.push(`Emphasize unique ${brand.differentiators[0]}`);
  }

  if (competitors.length < 5) {
    opportunities.push('Market has room for growth and new entrants');
  }

  opportunities.push(`Leverage ${brand.tone} tone to stand out`);

  return opportunities.slice(0, 5);
}

function suggestUniqueAngles(brand: BrandResearch): string[] {
  const angles: string[] = [];

  angles.push(`Focus on "${brand.valueProposition}"`);

  if (brand.differentiators.length > 1) {
    angles.push(`Combine ${brand.differentiators[0]} with ${brand.differentiators[1]}`);
  }

  angles.push(`Target underserved ${brand.targetMarkets[0] || 'market segment'}`);

  return angles.slice(0, 5);
}

function inferAgeRanges(targetMarkets: string[]): string[] {
  // Simple heuristics
  const markets = targetMarkets.join(' ').toLowerCase();

  if (markets.includes('young') || markets.includes('millennial') || markets.includes('gen z')) {
    return ['18-24', '25-34'];
  }
  if (markets.includes('professional') || markets.includes('business')) {
    return ['25-34', '35-44', '45-54'];
  }
  if (markets.includes('senior') || markets.includes('retiree')) {
    return ['55-64', '65+'];
  }

  return ['25-34', '35-44']; // Default
}

function inferIncomeLevel(
  productCategories: string[]
): 'budget' | 'mid-range' | 'premium' | 'luxury' {
  const categories = productCategories.join(' ').toLowerCase();

  if (categories.includes('luxury') || categories.includes('premium') || categories.includes('high-end')) {
    return 'luxury';
  }
  if (categories.includes('professional') || categories.includes('enterprise')) {
    return 'premium';
  }
  if (categories.includes('affordable') || categories.includes('budget')) {
    return 'budget';
  }

  return 'mid-range';
}

function inferOccupations(targetMarkets: string[]): string[] {
  const occupations: string[] = [];
  const markets = targetMarkets.join(' ').toLowerCase();

  if (markets.includes('professional')) occupations.push('Professionals');
  if (markets.includes('business') || markets.includes('entrepreneur')) occupations.push('Business Owners');
  if (markets.includes('developer') || markets.includes('tech')) occupations.push('Tech Workers');
  if (markets.includes('marketer')) occupations.push('Marketing Professionals');
  if (markets.includes('student')) occupations.push('Students');

  return occupations.length > 0 ? occupations : ['General Public'];
}

function inferAwarenessLevel(
  objective: ResearchInput['objective']
): 'unaware' | 'problem-aware' | 'solution-aware' | 'product-aware' | 'most-aware' {
  switch (objective) {
    case 'competitor-analysis':
      return 'solution-aware';
    case 'market-trends':
      return 'problem-aware';
    case 'audience-insights':
      return 'product-aware';
    case 'full-research':
      return 'solution-aware';
    default:
      return 'solution-aware';
  }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .slice(0, 10);

  return words;
}

function extractEmotionalTriggers(tone: BrandResearch['tone']): string[] {
  const triggers: Record<BrandResearch['tone'], string[]> = {
    professional: ['trust', 'reliability', 'expertise', 'results'],
    casual: ['easy', 'simple', 'friendly', 'relatable'],
    friendly: ['helpful', 'supportive', 'caring', 'welcoming'],
    urgent: ['now', 'limited', 'act fast', 'don\'t miss'],
    humorous: ['fun', 'entertaining', 'enjoyable', 'lighthearted'],
    authoritative: ['proven', 'expert', 'leader', 'authority'],
    playful: ['exciting', 'creative', 'innovative', 'fresh'],
  };

  return triggers[tone] || triggers.professional;
}

function calculateQualityScore(metrics: {
  hasBrand: boolean;
  hasCompetitors: boolean;
  hasTrends: boolean;
  hasPainPoints: boolean;
}): number {
  let score = 0;

  if (metrics.hasBrand) score += 40; // Brand analysis is most important
  if (metrics.hasCompetitors) score += 25;
  if (metrics.hasTrends) score += 20;
  if (metrics.hasPainPoints) score += 15;

  return score;
}
