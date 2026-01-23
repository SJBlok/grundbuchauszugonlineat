import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardStep } from '@/types/grundbuch-api';

interface StepIndicatorProps {
  currentStep: WizardStep;
  isLoading?: boolean;
}

const steps = [
  { step: 1, label: 'Auth', description: 'Authenticatie' },
  { step: 2, label: 'Adres', description: 'Adres Lookup' },
  { step: 3, label: 'Abfrage', description: 'Grundbuch' },
  { step: 4, label: 'Urkunden', description: 'Documenten' },
];

export function StepIndicator({ currentStep, isLoading }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
      {steps.map(({ step, label }, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isPending = step > currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold transition-all',
                  isCompleted && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50',
                  isCurrent && 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500 shadow-lg shadow-cyan-500/20',
                  isPending && 'bg-slate-800 text-slate-500 border border-slate-700'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent && isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-2 font-medium',
                  isCompleted && 'text-emerald-400',
                  isCurrent && 'text-cyan-400',
                  isPending && 'text-slate-500'
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 md:w-16 h-0.5 mx-2 transition-all',
                  step < currentStep ? 'bg-emerald-500/50' : 'bg-slate-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
