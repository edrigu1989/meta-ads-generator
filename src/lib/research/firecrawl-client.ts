/**
 * Firecrawl API Client
 *
 * Client for web scraping and content extraction using Firecrawl.
 * Provides robust error handling, retry logic, and brand analysis.
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import Anthropic from '@anthropic-ai/sdk';
import { BrandResearch } from '@/types/research';

// Singleton Firecrawl client
let firecrawlClient: FirecrawlApp | null = null;

/**
 * Get or create Firecrawl client singleton
 */
function getFirecrawlClient(): FirecrawlApp {
  if (!firecrawlClient) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }
    firecrawlClient = new FirecrawlApp({ apiKey });
    console.log('[Firecrawl] Client initialized');
  }
  return firecrawlClient;
}

// Singleton Claude client
let claudeClient: Anthropic | null = null;

/**
 * Get or create Claude client singleton
 */
function getClaudeClient(): Anthropic {
  if (!claudeClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    claudeClient = new Anthropic({ apiKey });
    console.log('[Claude] Client initialized for brand analysis');
  }
  return claudeClient;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect language based on location
 */
function getLanguageFromLocation(location?: string): string {
  if (!location) return 'English';

  const loc = location.toLowerCase();

  // Spanish-speaking countries
  if (
    loc.includes('argentina') ||
    loc.includes('spain') ||
    loc.includes('españa') ||
    loc.includes('mexico') ||
    loc.includes('colombia') ||
    loc.includes('chile') ||
    loc.includes('peru') ||
    loc.includes('venezuela') ||
    loc.includes('ecuador') ||
    loc.includes('guatemala') ||
    loc.includes('cuba') ||
    loc.includes('bolivia') ||
    loc.includes('dominican') ||
    loc.includes('honduras') ||
    loc.includes('paraguay') ||
    loc.includes('salvador') ||
    loc.includes('nicaragua') ||
    loc.includes('costa rica') ||
    loc.includes('panama') ||
    loc.includes('uruguay')
  ) {
    return 'Spanish';
  }

  // Portuguese-speaking countries
  if (loc.includes('brazil') || loc.includes('brasil') || loc.includes('portugal')) {
    return 'Portuguese';
  }

  // French-speaking countries
  if (loc.includes('france') || loc.includes('canada') || loc.includes('belgium')) {
    return 'French';
  }

  // German-speaking countries
  if (loc.includes('germany') || loc.includes('austria') || loc.includes('switzerland')) {
    return 'German';
  }

  // Default to English
  return 'English';
}

/**
 * Scrape website content using Firecrawl
 *
 * @param url - Website URL to scrape
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Structured markdown content
 */
export async function scrapeWebsite(
  url: string,
  maxRetries: number = 3
): Promise<string> {
  console.log(`[Firecrawl] Starting scrape for: ${url}`);

  // Validate URL
  if (!isValidUrl(url)) {
    const error = `Invalid URL format: ${url}`;
    console.error(`[Firecrawl] ${error}`);
    throw new Error(error);
  }

  const client = getFirecrawlClient();
  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Firecrawl] Attempt ${attempt}/${maxRetries} for ${url}`);

      // Scrape with Firecrawl
      const result = await client.scrape(url, {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 30000, // 30 seconds timeout
      });

      if (!result || !result.markdown) {
        throw new Error('No markdown content returned from Firecrawl');
      }

      console.log(
        `[Firecrawl] Successfully scraped ${url} (${result.markdown.length} chars)`
      );

      return result.markdown;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[Firecrawl] Attempt ${attempt} failed:`,
        lastError.message
      );

      // Check for rate limit error
      if (lastError.message.includes('rate limit')) {
        console.log('[Firecrawl] Rate limit detected, waiting longer...');
        await sleep(5000 * attempt); // Exponential backoff for rate limits
      } else if (attempt < maxRetries) {
        // Regular exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`[Firecrawl] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  const errorMessage = `Failed to scrape ${url} after ${maxRetries} attempts: ${lastError?.message}`;
  console.error(`[Firecrawl] ${errorMessage}`);
  throw new Error(errorMessage);
}

/**
 * Extract brand information from markdown content using Claude
 *
 * @param markdown - Website content in markdown format
 * @param location - Geographic location for language detection
 * @returns BrandResearch object with extracted information
 */
export async function extractBrandInfo(
  markdown: string,
  location?: string
): Promise<BrandResearch> {
  console.log(
    `[Firecrawl] Extracting brand info from ${markdown.length} chars of markdown`
  );

  if (!markdown || markdown.trim().length === 0) {
    throw new Error('Markdown content is empty');
  }

  const language = getLanguageFromLocation(location);
  console.log(`[Firecrawl] Using language: ${language} for location: ${location}`);

  const client = getClaudeClient();

  try {
    const languageInstruction =
      language !== 'English'
        ? `\n\nIMPORTANT: Respond in ${language}. All text fields (valueProposition, differentiators, productCategories, targetMarkets) must be in ${language}.`
        : '';

    const prompt = `Analyze this website content and extract brand information. Return ONLY a JSON object with this exact structure (no markdown, no code blocks):${languageInstruction}

{
  "name": "brand name",
  "tone": "professional|casual|friendly|urgent|humorous|authoritative|playful",
  "valueProposition": "core value proposition in one sentence",
  "differentiators": ["key differentiator 1", "key differentiator 2", "key differentiator 3"],
  "productCategories": ["category 1", "category 2"],
  "targetMarkets": ["market segment 1", "market segment 2"]
}

Website content:
${markdown.slice(0, 8000)}

Extract the brand's:
1. Name (exact brand name)
2. Tone (choose the most appropriate from the list)
3. Value proposition (what makes them unique, in one clear sentence)
4. Differentiators (3-5 key points that set them apart)
5. Product categories (main products/services they offer)
6. Target markets (who they serve, be specific)

Analyze the language, messaging, and content to determine these accurately.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    if (!responseText) {
      throw new Error('Empty response from Claude');
    }

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Firecrawl] Failed to parse Claude response:', responseText);
      throw new Error('Failed to parse brand information from Claude response');
    }

    const brandInfo = JSON.parse(jsonMatch[0]) as BrandResearch;

    // Validate required fields
    if (!brandInfo.name || !brandInfo.valueProposition) {
      throw new Error('Incomplete brand information extracted');
    }

    console.log(`[Firecrawl] Successfully extracted brand info for: ${brandInfo.name}`);
    return brandInfo;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[Firecrawl] Brand extraction failed:', errorMessage);
    throw new Error(`Failed to extract brand information: ${errorMessage}`);
  }
}

/**
 * Complete brand research workflow: scrape + extract
 *
 * @param url - Website URL to analyze
 * @param location - Geographic location for language detection
 * @returns Complete BrandResearch object
 */
export async function researchBrand(
  url: string,
  location?: string
): Promise<BrandResearch> {
  console.log(`[Firecrawl] Starting complete brand research for: ${url}`);

  try {
    // Step 1: Scrape website
    const markdown = await scrapeWebsite(url);

    // Step 2: Extract brand info with location for language detection
    const brandInfo = await extractBrandInfo(markdown, location);

    console.log(`[Firecrawl] Brand research completed for: ${brandInfo.name}`);
    return brandInfo;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('[Firecrawl] Brand research failed:', errorMessage);
    throw new Error(`Brand research failed: ${errorMessage}`);
  }
}
