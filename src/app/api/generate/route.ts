import { NextRequest, NextResponse } from 'next/server';
import { GenerateAdRequest, GenerateAdResponse } from '@/types';
import { createAdPrompt } from '@/lib/prompts/ad-prompts';
import { generateWithClaude } from '@/lib/ai/providers/claude';
import { generateWithOpenAI } from '@/lib/ai/providers/openai';
import { generateWithGemini } from '@/lib/ai/providers/gemini';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAdRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.product || !body.targetAudience || !body.keyBenefits) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Create prompt
    const prompt = createAdPrompt(body);

    // Generate with selected AI provider
    let adContent;
    try {
      switch (body.provider) {
        case 'claude':
          adContent = await generateWithClaude(prompt);
          break;
        case 'openai':
          adContent = await generateWithOpenAI(prompt);
          break;
        case 'gemini':
          adContent = await generateWithGemini(prompt);
          break;
        default:
          throw new Error('Invalid AI provider');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to generate ad with ${body.provider}`,
          provider: body.provider,
        } as GenerateAdResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: adContent,
      provider: body.provider,
    } as GenerateAdResponse);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
