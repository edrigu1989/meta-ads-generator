import OpenAI from 'openai';
import { AdContent } from '@/types';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWithOpenAI(prompt: string): Promise<AdContent> {
  const completion = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1024,
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(responseText) as AdContent;
}
