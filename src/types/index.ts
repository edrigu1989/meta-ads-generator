export type AIProvider = 'claude' | 'openai' | 'gemini';

export interface AdContent {
  hook: string;
  body: string;
  cta: string;
  reasoning?: string;
  researchInsight?: string;
  competitorGap?: string;
}

export interface BrandInfo {
  name: string;
  product: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'friendly' | 'urgent' | 'humorous';
  keyBenefits: string;
  context?: string;
}

export interface GenerateAdRequest extends BrandInfo {
  provider: AIProvider;
}

export interface GenerateAdResponse {
  success: boolean;
  data?: AdContent;
  error?: string;
  provider: AIProvider;
}
