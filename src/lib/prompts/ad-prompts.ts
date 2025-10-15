import { BrandInfo } from '@/types';
import { ResearchResult } from '@/types/research';

export function createAdPrompt(
  brandInfo: BrandInfo,
  researchData?: ResearchResult
): string {
  // Build research insights section if available
  let researchInsights = '';

  if (researchData) {
    researchInsights = `
🔬 RESEARCH-POWERED INSIGHTS (USE THESE TO CREATE SUPERIOR ADS):

✅ BRAND VOICE TO MATCH:
Tone: ${researchData.brand.tone}
Value Proposition: ${researchData.brand.valueProposition}

🎯 DIFFERENTIATION STRATEGY:
Key Differentiators vs Competition:
${researchData.brand.differentiators.map((d) => `- ${d}`).join('\n')}

💡 OPPORTUNITIES TO EXPLOIT (Focus here!):
${researchData.competitors.opportunities.map((o) => `- ${o}`).join('\n')}

🚫 SATURATED MESSAGES TO AVOID:
These messages are overused by competitors - DO NOT use similar language:
${researchData.competitors.commonMessages.map((m) => `- ${m}`).join('\n')}

⚡ REAL PAIN POINTS TO ADDRESS:
${researchData.market.painPoints.slice(0, 5).map((p) => `- ${p}`).join('\n')}

🗣️ AUDIENCE LANGUAGE TO USE:
Keywords: ${researchData.audience.commonLanguage.keywords.slice(0, 8).join(', ')}
Phrases: ${researchData.audience.commonLanguage.phrases.slice(0, 5).join(', ')}
Emotional Triggers: ${researchData.audience.commonLanguage.emotionalTriggers.join(', ')}

👥 AUDIENCE PROFILE:
Awareness Level: ${researchData.audience.awarenessLevel}
Income Level: ${researchData.audience.demographics.incomeLevel}
Purchase Drivers: ${researchData.audience.behaviors.purchaseDrivers.slice(0, 3).join(', ')}

📈 TRENDING TOPICS TO LEVERAGE:
${researchData.market.trends
  .slice(0, 3)
  .map((t) => `- ${t.topic} (${t.volume}, ${t.momentum})`)
  .join('\n')}

🎨 UNIQUE ANGLES SUGGESTED:
${researchData.competitors.uniqueAngles.map((a) => `- ${a}`).join('\n')}

⚠️ CRITICAL INSTRUCTIONS:
1. Generate ads that EXPLOIT the opportunities found in research
2. AVOID messaging patterns saturated by competitors
3. USE the exact language and keywords the audience uses
4. ATTACK the real pain points identified
5. Match the ${researchData.brand.tone} tone consistently
6. Leverage unique angles that competitors aren't using
7. Address the ${researchData.audience.awarenessLevel} awareness level appropriately
`;
  }

  return `You are an expert Meta Ads copywriter. Generate compelling ad copy for the following brand:

Brand Name: ${brandInfo.name}
Product/Service: ${brandInfo.product}
Target Audience: ${brandInfo.targetAudience}
Tone: ${brandInfo.tone}
Key Benefits: ${brandInfo.keyBenefits}
${brandInfo.context ? `Additional Context: ${brandInfo.context}` : ''}
${researchInsights}

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
${
  researchData
    ? `
🎯 RESEARCH-ENHANCED REQUIREMENTS:
- MUST exploit opportunities identified in research
- MUST avoid saturated competitor messaging
- MUST use audience language and keywords
- MUST address real pain points
- MUST align with unique angles suggested
- MUST match ${researchData.brand.tone} tone from brand analysis`
    : ''
}

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "hook": "your hook here",
  "body": "your body text here",
  "cta": "your cta here"${
    researchData
      ? `,
  "reasoning": "Explain in 1-2 sentences WHY this ad will work for this audience and objective",
  "researchInsight": "Explain which specific research discovery you used (e.g., 'Targets pain point: [X]' or 'Uses audience keyword: [Y]')",
  "competitorGap": "Explain what competitors are doing WRONG that this ad exploits (e.g., 'Competitors focus on [X], we focus on [Y]')"`
      : ''
  }
}`;
}
