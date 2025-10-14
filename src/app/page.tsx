'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AdGeneratorForm } from '@/components/forms/AdGeneratorForm';
import { AdPreview } from '@/components/ads/AdPreview';
import { AdContent, AIProvider } from '@/types';

export default function Home() {
  const [generatedAd, setGeneratedAd] = useState<{
    ad: AdContent;
    provider: AIProvider;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Meta Ads Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create compelling Meta (Facebook/Instagram) ads using AI.
            Choose between Claude, GPT-4, or Gemini to generate hooks, body text, and CTAs.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Brand Information
            </h2>
            <AdGeneratorForm
              onGenerated={(ad, provider) => setGeneratedAd({ ad, provider })}
            />
          </div>

          {/* Preview Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            {generatedAd ? (
              <AdPreview ad={generatedAd.ad} provider={generatedAd.provider} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Ad Will Appear Here
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Fill in the form and click Generate Ad to see your AI-powered ad copy
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by{' '}
            <a
              href="https://www.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Claude
            </a>
            ,{' '}
            <a
              href="https://openai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI
            </a>
            , and{' '}
            <a
              href="https://deepmind.google/technologies/gemini/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Gemini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
