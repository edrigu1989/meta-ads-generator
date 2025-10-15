'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import ResearchLoading from '@/components/research/ResearchLoading';

/**
 * Form validation schema
 */
const ResearchFormSchema = z.object({
  websiteUrl: z.string().url('Ingresa una URL válida (ej: https://ejemplo.com)'),
  productType: z.string().min(1, 'Selecciona un tipo de producto'),
  campaignGoal: z.string().min(1, 'Selecciona un objetivo de campaña'),
  location: z.string().optional(),
});

type ResearchFormData = z.infer<typeof ResearchFormSchema>;

const PRODUCT_TYPES = [
  { value: 'real-estate', label: 'Bienes Raíces' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'services', label: 'Servicios Profesionales' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'healthcare', label: 'Salud y Bienestar' },
  { value: 'education', label: 'Educación' },
  { value: 'restaurants', label: 'Restaurantes / Food' },
  { value: 'retail', label: 'Retail / Tienda Física' },
  { value: 'finance', label: 'Finanzas / Seguros' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'other', label: 'Otro' },
];

const CAMPAIGN_GOALS = [
  { value: 'awareness', label: 'Awareness - Dar a conocer marca' },
  { value: 'leads', label: 'Leads - Generar contactos' },
  { value: 'sales', label: 'Sales - Vender producto/servicio' },
  { value: 'full-research', label: 'Análisis Completo' },
];

export default function ResearchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResearchFormData>({
    resolver: zodResolver(ResearchFormSchema),
    defaultValues: {
      location: 'USA',
    },
  });

  const onSubmit = async (data: ResearchFormData) => {
    setIsLoading(true);

    // Show initial toast
    const loadingToast = toast.loading('Iniciando investigación...', {
      description: 'Esto tomará 2-3 minutos',
    });

    try {
      console.log('[Research Page] Submitting:', data);

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al realizar la investigación');
      }

      console.log('[Research Page] Success:', result);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success
      toast.success('¡Investigación completada!', {
        description: `Completado en ${Math.round(result.duration / 1000)}s`,
      });

      // Store result in sessionStorage for the results page
      sessionStorage.setItem('researchResult', JSON.stringify(result.data));

      // Redirect to results page
      const researchId = Date.now().toString();
      router.push(`/campaign/research/${researchId}/results`);
    } catch (error) {
      console.error('[Research Page] Error:', error);

      toast.dismiss(loadingToast);
      toast.error('Error en la investigación', {
        description:
          error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });

      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <ResearchLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Investigación de Mercado AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Analiza tu marca, competencia y audiencia en minutos
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Website URL */}
            <div>
              <label
                htmlFor="websiteUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                URL del Sitio Web *
              </label>
              <input
                {...register('websiteUrl')}
                type="url"
                id="websiteUrl"
                placeholder="https://tu-sitio-web.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
              {errors.websiteUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>

            {/* Product Type */}
            <div>
              <label
                htmlFor="productType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Tipo de Producto/Servicio *
              </label>
              <select
                {...register('productType')}
                id="productType"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="">Selecciona una opción</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.productType && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.productType.message}
                </p>
              )}
            </div>

            {/* Campaign Goal */}
            <div>
              <label
                htmlFor="campaignGoal"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Objetivo de la Campaña *
              </label>
              <select
                {...register('campaignGoal')}
                id="campaignGoal"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="">Selecciona un objetivo</option>
                {CAMPAIGN_GOALS.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
              {errors.campaignGoal && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.campaignGoal.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Ubicación (Opcional)
              </label>
              <input
                {...register('location')}
                type="text"
                id="location"
                placeholder="USA"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                País o región para la investigación de mercado
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    ¿Qué obtendrás?
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>✓ Análisis completo de tu marca y propuesta de valor</li>
                    <li>✓ Investigación de competencia y oportunidades</li>
                    <li>✓ Tendencias del mercado y pain points</li>
                    <li>✓ Perfil detallado de tu audiencia objetivo</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
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
                  Analizando...
                </span>
              ) : (
                'Analizar y Generar'
              )}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              ⏱️ Tiempo estimado: 2-3 minutos
            </p>
          </form>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              100% Automatizado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI analiza todo por ti
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Súper Rápido
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resultados en minutos
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Insights Profundos
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Datos accionables
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
