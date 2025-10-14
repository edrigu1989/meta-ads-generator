'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GenerateAdRequest, AdContent, AIProvider } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  product: z.string().min(5, 'Product description must be at least 5 characters'),
  targetAudience: z.string().min(5, 'Target audience must be at least 5 characters'),
  tone: z.enum(['professional', 'casual', 'friendly', 'urgent', 'humorous']),
  keyBenefits: z.string().min(10, 'Key benefits must be at least 10 characters'),
  context: z.string().optional(),
  provider: z.enum(['claude', 'openai', 'gemini']),
});

type FormData = z.infer<typeof formSchema>;

interface AdGeneratorFormProps {
  onGenerated: (ad: AdContent, provider: AIProvider) => void;
}

export function AdGeneratorForm({ onGenerated }: AdGeneratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tone: 'professional',
      provider: 'claude',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate ad');
      }

      toast.success('Ad generated successfully!');
      onGenerated(result.data, result.provider);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate ad');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Brand Name *
          </label>
          <input
            id="name"
            {...register('name')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Corp"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="product" className="block text-sm font-medium mb-2">
            Product/Service *
          </label>
          <input
            id="product"
            {...register('product')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="AI-powered project management tool"
          />
          {errors.product && (
            <p className="mt-1 text-sm text-red-500">{errors.product.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium mb-2">
            Target Audience *
          </label>
          <input
            id="targetAudience"
            {...register('targetAudience')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Small business owners and startup founders"
          />
          {errors.targetAudience && (
            <p className="mt-1 text-sm text-red-500">{errors.targetAudience.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tone" className="block text-sm font-medium mb-2">
            Tone *
          </label>
          <select
            id="tone"
            {...register('tone')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
            <option value="urgent">Urgent</option>
            <option value="humorous">Humorous</option>
          </select>
          {errors.tone && (
            <p className="mt-1 text-sm text-red-500">{errors.tone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="keyBenefits" className="block text-sm font-medium mb-2">
            Key Benefits *
          </label>
          <textarea
            id="keyBenefits"
            {...register('keyBenefits')}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Saves time, increases productivity, easy to use"
          />
          {errors.keyBenefits && (
            <p className="mt-1 text-sm text-red-500">{errors.keyBenefits.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            id="context"
            {...register('context')}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Special offer, seasonal campaign, etc."
          />
        </div>

        <div>
          <label htmlFor="provider" className="block text-sm font-medium mb-2">
            AI Provider *
          </label>
          <select
            id="provider"
            {...register('provider')}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">GPT-4 (OpenAI)</option>
            <option value="gemini">Gemini (Google)</option>
          </select>
          {errors.provider && (
            <p className="mt-1 text-sm text-red-500">{errors.provider.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Ad
          </>
        )}
      </button>
    </form>
  );
}
