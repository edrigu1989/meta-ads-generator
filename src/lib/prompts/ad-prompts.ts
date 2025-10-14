import { BrandInfo } from '@/types';

export function createAdPrompt(brandInfo: BrandInfo): string {
  return `You are an expert Meta Ads copywriter. Generate compelling ad copy for the following brand:

Brand Name: ${brandInfo.name}
Product/Service: ${brandInfo.product}
Target Audience: ${brandInfo.targetAudience}
Tone: ${brandInfo.tone}
Key Benefits: ${brandInfo.keyBenefits}
${brandInfo.context ? `Additional Context: ${brandInfo.context}` : ''}

Generate a Meta (Facebook/Instagram) ad with the following structure:

1. HOOK (attention-grabbing first line, max 15 words)
2. BODY (compelling description, 2-3 sentences, max 100 words)
3. CTA (clear call-to-action, max 8 words)

Requirements:
- Hook must stop the scroll and create curiosity
- Body must highlight benefits, not just features
- Use the specified tone: ${brandInfo.tone}
- CTA must be action-oriented and clear
- Focus on emotional triggers and value proposition
- Make it mobile-friendly (short, punchy)

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "hook": "your hook here",
  "body": "your body text here",
  "cta": "your cta here"
}`;
}
