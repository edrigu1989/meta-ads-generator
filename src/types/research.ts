/**
 * Research System Types
 *
 * Type definitions for the AI-powered research system that analyzes
 * brands, competitors, markets, and audiences to enhance ad generation.
 */

/**
 * Input for initiating research analysis
 */
export interface ResearchInput {
  /** Website URL to analyze */
  url: string;
  /** Type of product or service being offered */
  productType: string;
  /** Primary objective of the research (e.g., "competitor analysis", "market trends", "audience insights") */
  objective: 'competitor-analysis' | 'market-trends' | 'audience-insights' | 'full-research';
}

/**
 * Brand research results from analyzing the brand's own website and positioning
 */
export interface BrandResearch {
  /** Brand name */
  name: string;
  /** Brand tone and voice (e.g., "professional", "casual", "playful") */
  tone: 'professional' | 'casual' | 'friendly' | 'urgent' | 'humorous' | 'authoritative' | 'playful';
  /** Core value proposition */
  valueProposition: string;
  /** Key differentiators from competitors */
  differentiators: string[];
  /** Main product/service categories */
  productCategories: string[];
  /** Target market segments */
  targetMarkets: string[];
}

/**
 * Competitor insights from analyzing similar brands and their messaging
 */
export interface CompetitorInsight {
  /** List of main competitors identified */
  competitors: Array<{
    name: string;
    url: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  /** Common messaging patterns across competitors */
  commonMessages: string[];
  /** Gaps and opportunities in the market */
  opportunities: string[];
  /** Pricing strategies observed */
  pricingStrategies: string[];
  /** Unique angles not being used by competitors */
  uniqueAngles: string[];
}

/**
 * Market intelligence from trend analysis and search data
 */
export interface MarketIntelligence {
  /** Current trending topics in the industry */
  trends: Array<{
    topic: string;
    volume: 'high' | 'medium' | 'low';
    momentum: 'rising' | 'stable' | 'declining';
  }>;
  /** Common pain points mentioned by customers */
  painPoints: string[];
  /** Popular search queries related to the product */
  popularSearches: string[];
  /** Seasonal patterns or timing considerations */
  seasonalPatterns: Array<{
    period: string;
    insight: string;
  }>;
  /** Emerging opportunities in the market */
  emergingOpportunities: string[];
}

/**
 * Audience profile based on demographic and psychographic research
 */
export interface AudienceProfile {
  /** Primary demographic segments */
  demographics: {
    ageRanges: string[];
    locations: string[];
    incomeLevel: 'budget' | 'mid-range' | 'premium' | 'luxury';
    occupation: string[];
  };
  /** Customer awareness level (Eugene Schwartz scale) */
  awarenessLevel: 'unaware' | 'problem-aware' | 'solution-aware' | 'product-aware' | 'most-aware';
  /** Common language and terminology used by the audience */
  commonLanguage: {
    keywords: string[];
    phrases: string[];
    jargon: string[];
    emotionalTriggers: string[];
  };
  /** Behavioral patterns */
  behaviors: {
    purchaseDrivers: string[];
    objections: string[];
    preferredChannels: string[];
  };
}

/**
 * Complete research result combining all research components
 */
export interface ResearchResult {
  /** Brand research data */
  brand: BrandResearch;
  /** Competitor analysis data */
  competitors: CompetitorInsight;
  /** Market intelligence data */
  market: MarketIntelligence;
  /** Audience profile data */
  audience: AudienceProfile;
  /** Timestamp when research was conducted */
  timestamp: string;
  /** Whether this result was retrieved from cache */
  cached: boolean;
  /** Research quality score (0-100) */
  qualityScore: number;
  /** Data sources used for the research */
  sources: Array<{
    type: 'web-scrape' | 'search-results' | 'content-analysis';
    url: string;
    reliability: 'high' | 'medium' | 'low';
  }>;
}

/**
 * API request for generating research
 */
export interface GenerateResearchRequest extends ResearchInput {
  /** Whether to use cached results if available */
  useCache?: boolean;
  /** Maximum age of cached results in minutes */
  cacheMaxAge?: number;
}

/**
 * API response for research generation
 */
export interface GenerateResearchResponse {
  success: boolean;
  data?: ResearchResult;
  error?: string;
  cached?: boolean;
  /** Time taken to generate research in milliseconds */
  processingTime?: number;
}
