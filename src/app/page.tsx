'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AdGeneratorForm } from '@/components/forms/AdGeneratorForm';
import { AdPreview } from '@/components/ads/AdPreview';
import { AdContent, AIProvider } from '@/types';

export default function Home() {
  const [generatedAd, setGeneratedAd] = useState<{
    ad: AdContent;
    provider: AIProvider;
    withResearch?: boolean;
    researchQuality?: number;
  } | null>(null);

  // Load generated ad from sessionStorage (e.g., from research flow)
  useEffect(() => {
    const storedAd = sessionStorage.getItem('generatedAd');
    if (storedAd) {
      try {
        const parsed = JSON.parse(storedAd);
        setGeneratedAd({
          ad: {
            hook: parsed.hook,
            body: parsed.body,
            cta: parsed.cta,
            reasoning: parsed.reasoning,
            researchInsight: parsed.researchInsight,
            competitorGap: parsed.competitorGap,
          },
          provider: 'claude', // Research-powered ads use Claude
          withResearch: parsed.withResearch,
          researchQuality: parsed.researchQuality,
        });
        // Clear from sessionStorage after loading
        sessionStorage.removeItem('generatedAd');
      } catch (error) {
        console.error('Failed to load generated ad:', error);
      }
    }
  }, []);

  // Show generated ad if exists, otherwise show options
  const showGeneratedAd = generatedAd !== null;

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
            Create compelling Meta (Facebook/Instagram) ads using AI
          </p>
        </div>

        {showGeneratedAd ? (
          // Show generated ad and form
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
              <AdPreview
                ad={generatedAd.ad}
                provider={generatedAd.provider}
                withResearch={generatedAd.withResearch}
                researchQuality={generatedAd.researchQuality}
              />
            </div>
          </div>
        ) : (
          // Show two options
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Elige tu método de generación
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Generation */}
              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Generación Rápida
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Form simple, resultados en 30 segundos
                  </p>

                  <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400 pt-4">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Ingresa info básica de tu marca</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Elige tu AI favorito (Claude, GPT-4, Gemini)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Genera ad copy instantáneamente</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => setGeneratedAd({ ad: { hook: '', body: '', cta: '' }, provider: 'claude' })}
                    className="mt-6 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Empezar →
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ideal para probar ideas rápidamente
                  </p>
                </div>
              </div>

              {/* Research-Powered Generation */}
              <div className="group bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl shadow-xl p-8 border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-2xl relative overflow-hidden">
                {/* Recommended Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                    💎 Recomendado
                  </span>
                </div>

                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-2">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Con Research Profundo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Análisis automático de mercado, 2-3 minutos
                  </p>

                  <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400 pt-4">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      <span>Analiza tu sitio web automáticamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      <span>Investiga competencia y tendencias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      <span>Identifica pain points reales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">✓</span>
                      <span className="font-semibold">Explica por qué funciona cada ad</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => window.location.href = '/campaign/research'}
                    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Empezar →
                  </button>

                  <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                    Mejor performance, insights únicos
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                💡 <strong>Tip:</strong> El modo Research usa datos reales de tu mercado para crear ads más efectivos
              </p>
            </div>
          </div>
        )}

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
