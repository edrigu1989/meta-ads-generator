'use client';

import { useEffect, useState } from 'react';

interface ResearchLoadingProps {
  currentStep?: number;
}

const RESEARCH_STEPS = [
  { id: 1, label: 'Analizando tu sitio web...', duration: 8000 },
  { id: 2, label: 'Investigando competencia...', duration: 15000 },
  { id: 3, label: 'Analizando mercado...', duration: 12000 },
  { id: 4, label: 'Perfilando audiencia...', duration: 10000 },
  { id: 5, label: 'Generando estrategia...', duration: 8000 },
];

export default function ResearchLoading({ currentStep = 0 }: ResearchLoadingProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep > 0) {
      setActiveStep(currentStep);
      return;
    }

    // Auto-progress simulation
    let stepIndex = 0;
    let progressInterval: NodeJS.Timeout;

    const nextStep = () => {
      if (stepIndex < RESEARCH_STEPS.length) {
        setActiveStep(stepIndex + 1);

        // Progress bar animation
        let currentProgress = 0;
        const targetProgress = ((stepIndex + 1) / RESEARCH_STEPS.length) * 100;
        const increment = (targetProgress - progress) / 50;

        progressInterval = setInterval(() => {
          currentProgress += increment;
          if (currentProgress >= targetProgress) {
            currentProgress = targetProgress;
            clearInterval(progressInterval);
          }
          setProgress(currentProgress);
        }, 20);

        stepIndex++;
        if (stepIndex < RESEARCH_STEPS.length) {
          setTimeout(nextStep, RESEARCH_STEPS[stepIndex - 1].duration);
        }
      }
    };

    const timer = setTimeout(nextStep, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [currentStep]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin"
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
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Investigación en Progreso
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tiempo estimado: 2-3 minutos
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {RESEARCH_STEPS.map((step) => {
          const isCompleted = activeStep > step.id;
          const isActive = activeStep === step.id;
          const isPending = activeStep < step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 scale-105'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : isActive ? (
                  <svg
                    className="w-5 h-5 animate-spin"
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
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p
                  className={`font-medium transition-colors duration-300 ${
                    isCompleted
                      ? 'text-green-900 dark:text-green-100'
                      : isActive
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Status indicator */}
              {isActive && (
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info message */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
        No cierres esta ventana. La investigación se está ejecutando...
      </div>
    </div>
  );
}
