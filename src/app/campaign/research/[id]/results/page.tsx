'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ResearchResult } from '@/types/research';
import { toast } from 'sonner';
import { formatCacheAge } from '@/lib/cache/redis-client';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function ResearchResultsPage() {
  const router = useRouter();
  const params = useParams();
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['brand', 'competitors', 'market', 'audience'])
  );
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load research from sessionStorage
    const storedResearch = sessionStorage.getItem('researchResult');
    if (storedResearch) {
      try {
        const parsed = JSON.parse(storedResearch);
        setResearch(parsed);
      } catch (error) {
        console.error('Failed to parse research:', error);
        toast.error('Error al cargar los resultados');
        router.push('/campaign/research');
      }
    } else {
      toast.error('No se encontraron resultados');
      router.push('/campaign/research');
    }
  }, [router]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleGenerateAds = async () => {
    if (!research) return;

    setIsGenerating(true);
    toast.loading('Generando ads con research AI...', {
      id: 'generating-ads',
      description: 'Usando insights de marca, competencia y audiencia',
    });

    try {
      // Call ad generation API with research data
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: research.brand.name,
          product: research.brand.productCategories.join(', '),
          targetAudience: research.audience.demographics.occupation.join(', '),
          tone: research.brand.tone,
          keyBenefits: research.brand.valueProposition,
          context: `Diferenciadores: ${research.brand.differentiators.join(', ')}`,
          provider: 'claude', // Use Claude for research-powered generation
          researchData: research, // Pass the full research data
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al generar ads');
      }

      toast.success('¡Ads generados con research!', {
        id: 'generating-ads',
        description: 'Optimizado con insights de mercado',
      });

      // Store generated ad with research flag in sessionStorage
      sessionStorage.setItem(
        'generatedAd',
        JSON.stringify({
          ...result.data,
          withResearch: true,
          researchQuality: research.qualityScore,
        })
      );

      // Navigate to home page to show the result
      router.push('/');
    } catch (error) {
      console.error('Failed to generate ads:', error);
      toast.error('Error al generar ads', {
        id: 'generating-ads',
        description:
          error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditResearch = () => {
    router.push('/campaign/research');
  };

  const handleRefreshResearch = async () => {
    if (!research) return;

    // Get original URL from sources
    const originalUrl = research.sources.find((s) => s.type === 'web-scrape')?.url;

    if (!originalUrl) {
      toast.error('No se pudo determinar la URL original');
      return;
    }

    setIsGenerating(true);
    toast.loading('Actualizando research...', {
      id: 'refreshing-research',
      description: 'Ejecutando nueva investigación',
    });

    try {
      // Call research API with forceRefresh
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: originalUrl,
          productType: research.brand.productCategories[0] || 'services',
          campaignGoal: 'full-research',
          forceRefresh: true, // Force bypass cache
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar research');
      }

      toast.success('¡Research actualizado!', {
        id: 'refreshing-research',
      });

      // Update research state
      setResearch(result.data);

      // Update sessionStorage
      sessionStorage.setItem('researchResult', JSON.stringify(result.data));
    } catch (error) {
      console.error('Failed to refresh research:', error);
      toast.error('Error al actualizar research', {
        id: 'refreshing-research',
        description:
          error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!research) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar with Back Button and Dark Mode Toggle */}
        <div className="flex justify-between items-center">
          <button
          onClick={() => router.push('/campaign/research')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Volver a Nueva Investigación</span>
        </button>
          <DarkModeToggle />
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Research Completado - Score: {research.qualityScore}/100
            </div>

            {/* Cached Badge */}
            {research.cached && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                Cached ({formatCacheAge(research.timestamp)})
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Resultados de Investigación
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {research.brand.name}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGenerateAds}
            disabled={isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generando...
              </span>
            ) : (
              '🚀 Generar Ads con este Research'
            )}
          </button>

          <div className="flex gap-4">
            {research.cached && (
              <button
                onClick={handleRefreshResearch}
                disabled={isGenerating}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ejecutar nuevo research sin usar cache"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Actualizar Research
                </span>
              </button>
            )}

            <button
              onClick={handleEditResearch}
              className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              ✏️ Editar Research
            </button>
          </div>
        </div>

        {/* Research Summary */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Research Summary
          </h2>

          {/* Brand Section */}
          <CollapsibleSection
            title="📊 Tu Marca"
            emoji="📊"
            isExpanded={expandedSections.has('brand')}
            onToggle={() => toggleSection('brand')}
            color="blue"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tono de Voz Detectado
                </h4>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                  {research.brand.tone}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Propuesta de Valor
                </h4>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {research.brand.valueProposition}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Diferenciadores Clave
                </h4>
                <ul className="space-y-2">
                  {research.brand.differentiators.map((diff, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Categorías de Producto
                </h4>
                <div className="flex flex-wrap gap-2">
                  {research.brand.productCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Competitors Section */}
          <CollapsibleSection
            title="🎯 Competencia"
            emoji="🎯"
            isExpanded={expandedSections.has('competitors')}
            onToggle={() => toggleSection('competitors')}
            color="purple"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Competidores Analizados
                </h4>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {research.competitors.competitors.length} competidores
                </p>
                <div className="mt-3 space-y-2">
                  {research.competitors.competitors.map((comp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {comp.name}
                        </p>
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {comp.url}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mensajes Saturados (que todos usan)
                </h4>
                <div className="space-y-2">
                  {research.competitors.commonMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                    >
                      <span className="text-red-500">⚠️</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Oportunidades Sin Explotar
                </h4>
                <ul className="space-y-2">
                  {research.competitors.opportunities.map((opp, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-2 rounded"
                    >
                      <span className="text-green-500 mt-0.5">💡</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ángulos Únicos Sugeridos
                </h4>
                <ul className="space-y-2">
                  {research.competitors.uniqueAngles.map((angle, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <span className="text-purple-500 mt-0.5">→</span>
                      <span>{angle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Market Section */}
          <CollapsibleSection
            title="📈 Mercado"
            emoji="📈"
            isExpanded={expandedSections.has('market')}
            onToggle={() => toggleSection('market')}
            color="green"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Trends Actuales
                </h4>
                <div className="space-y-2">
                  {research.market.trends.map((trend, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {trend.topic}
                      </span>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            trend.volume === 'high'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : trend.volume === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {trend.volume}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            trend.momentum === 'rising'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {trend.momentum}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Pain Points Comunes
                </h4>
                <ul className="space-y-2">
                  {research.market.painPoints.map((pain, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded"
                    >
                      <span className="text-orange-500 mt-0.5">⚡</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Búsquedas Populares
                </h4>
                <div className="flex flex-wrap gap-2">
                  {research.market.popularSearches.map((search, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      {search}
                    </span>
                  ))}
                </div>
              </div>

              {research.market.emergingOpportunities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Oportunidades Emergentes
                  </h4>
                  <ul className="space-y-2">
                    {research.market.emergingOpportunities.map((opp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                      >
                        <span className="text-green-500 mt-0.5">🌟</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Audience Section */}
          <CollapsibleSection
            title="👥 Tu Audiencia"
            emoji="👥"
            isExpanded={expandedSections.has('audience')}
            onToggle={() => toggleSection('audience')}
            color="orange"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Perfil Demográfico
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Edades
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.audience.demographics.ageRanges.map(
                        (age, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-sm"
                          >
                            {age}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Nivel de Ingreso
                    </p>
                    <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium capitalize">
                      {research.audience.demographics.incomeLevel}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Ubicaciones
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.audience.demographics.locations.map(
                        (loc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-sm"
                          >
                            {loc}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Ocupaciones
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.audience.demographics.occupation.map(
                        (occ, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-sm"
                          >
                            {occ}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nivel de Awareness
                </h4>
                <span className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium capitalize">
                  {research.audience.awarenessLevel}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Lenguaje que Usan
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.audience.commonLanguage.keywords.map(
                        (kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm"
                          >
                            {kw}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Frases Comunes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.audience.commonLanguage.phrases.map(
                        (phrase, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-sm"
                          >
                            {phrase}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Triggers Emocionales
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {research.audience.commonLanguage.emotionalTriggers.map(
                        (trigger, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded text-sm"
                          >
                            {trigger}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Comportamientos
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Drivers de Compra
                    </p>
                    <ul className="space-y-1">
                      {research.audience.behaviors.purchaseDrivers.map(
                        (driver, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{driver}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Objeciones Comunes
                    </p>
                    <ul className="space-y-1">
                      {research.audience.behaviors.objections.map(
                        (obj, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span className="text-red-500 mt-0.5">!</span>
                            <span>{obj}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
          <p>Research ID: {params.id}</p>
          <p className="mt-1">
            Generado: {new Date(research.timestamp).toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  emoji: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function CollapsibleSection({
  title,
  emoji,
  children,
  isExpanded,
  onToggle,
  color,
}: CollapsibleSectionProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-900 dark:text-purple-100',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: 'text-green-600 dark:text-green-400',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-900 dark:text-orange-100',
      icon: 'text-orange-600 dark:text-orange-400',
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${colors.border}`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${colors.bg} hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <h3 className={`text-lg font-semibold ${colors.text}`}>{title}</h3>
        </div>
        <svg
          className={`w-6 h-6 ${colors.icon} transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isExpanded && (
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
