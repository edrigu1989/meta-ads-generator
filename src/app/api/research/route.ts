/**
 * Research API Endpoint
 *
 * POST /api/research
 * Executes comprehensive research workflow combining brand analysis,
 * competitor research, market trends, and audience insights.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runResearch } from '@/lib/research/research-orchestrator';
import { ResearchInput } from '@/types/research';

/**
 * Request validation schema
 */
const ResearchRequestSchema = z.object({
  websiteUrl: z.string().url('Invalid website URL format'),
  productType: z.string().min(2, 'Product type must be at least 2 characters'),
  campaignGoal: z.enum([
    'competitor-analysis',
    'market-trends',
    'audience-insights',
    'full-research',
  ]),
  location: z.string().optional().default('USA'),
  forceRefresh: z.boolean().optional().default(false),
});

/**
 * Validate environment variables
 */
function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ['FIRECRAWL_API_KEY', 'SERP_API_KEY', 'ANTHROPIC_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * POST handler - Execute research workflow
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Validate environment configuration
    const envCheck = validateEnvironment();
    if (!envCheck.valid) {
      console.error('[Research API] Missing environment variables:', envCheck.missing);
      return NextResponse.json(
        {
          success: false,
          error: `Missing required API keys: ${envCheck.missing.join(', ')}. Please configure environment variables.`,
          duration: Date.now() - startTime,
        },
        { status: 503 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    console.log('[Research API] Received request body:', JSON.stringify(body, null, 2));

    let validatedData;
    try {
      validatedData = ResearchRequestSchema.parse(body);
      console.log('[Research API] Validation successful:', JSON.stringify(validatedData, null, 2));
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[Research API] Validation failed!');
        console.error('[Research API] Validation errors:', JSON.stringify(error.issues, null, 2));
        console.error('[Research API] Received data:', JSON.stringify(body, null, 2));

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              received: err.path.length > 0 ? body[err.path[0]] : body,
            })),
            duration: Date.now() - startTime,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    console.log('[Research API] Starting research for:', validatedData.websiteUrl);

    // 3. Build research input
    const researchInput: ResearchInput = {
      url: validatedData.websiteUrl,
      productType: validatedData.productType,
      objective: validatedData.campaignGoal,
    };

    // 4. Execute research workflow
    let result;
    try {
      result = await runResearch(researchInput, validatedData.forceRefresh);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle specific error types
      if (errorMessage.includes('rate limit')) {
        console.error('[Research API] Rate limit exceeded:', errorMessage);
        return NextResponse.json(
          {
            success: false,
            error: 'API rate limit exceeded. Please try again in a few minutes.',
            duration: Date.now() - startTime,
          },
          { status: 429 }
        );
      }

      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        console.error('[Research API] Timeout error:', errorMessage);
        return NextResponse.json(
          {
            success: false,
            error: 'Research request timed out. Please try again with a simpler query.',
            duration: Date.now() - startTime,
          },
          { status: 504 }
        );
      }

      if (errorMessage.includes('Invalid URL') || errorMessage.includes('Failed to scrape')) {
        console.error('[Research API] Invalid URL or scraping failed:', errorMessage);
        return NextResponse.json(
          {
            success: false,
            error: `Unable to analyze website: ${errorMessage}`,
            duration: Date.now() - startTime,
          },
          { status: 400 }
        );
      }

      // Generic error
      console.error('[Research API] Research failed:', errorMessage);
      return NextResponse.json(
        {
          success: false,
          error: `Research failed: ${errorMessage}`,
          duration: Date.now() - startTime,
        },
        { status: 500 }
      );
    }

    // 5. Return successful result
    const duration = Date.now() - startTime;
    console.log(`[Research API] Research completed successfully in ${duration}ms`);
    console.log(`[Research API] Quality score: ${result.qualityScore}/100`);

    return NextResponse.json(
      {
        success: true,
        data: result,
        duration,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch-all for unexpected errors
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Research API] Unexpected error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
        duration,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - Return API info
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/research',
      method: 'POST',
      description: 'Execute comprehensive brand and market research',
      requiredFields: {
        websiteUrl: 'string (valid URL)',
        productType: 'string (min 2 chars)',
        campaignGoal: 'competitor-analysis | market-trends | audience-insights | full-research',
        location: 'string (optional, default: USA)',
      },
      requiredEnvVars: ['FIRECRAWL_API_KEY', 'SERP_API_KEY', 'ANTHROPIC_API_KEY'],
    },
    { status: 200 }
  );
}
