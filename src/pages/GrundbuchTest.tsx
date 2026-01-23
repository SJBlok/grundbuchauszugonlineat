import { useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { StepIndicator } from '@/components/grundbuch-test/StepIndicator';
import { AuthStep } from '@/components/grundbuch-test/AuthStep';
import { AddressStep } from '@/components/grundbuch-test/AddressStep';
import { AbfrageStep } from '@/components/grundbuch-test/AbfrageStep';
import { UrkundenStep } from '@/components/grundbuch-test/UrkundenStep';
import { APILogger } from '@/components/grundbuch-test/APILogger';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { Button } from '@/components/ui/button';
import { RotateCcw, Terminal } from 'lucide-react';

export default function GrundbuchTest() {
  const [searchParams] = useSearchParams();
  const { currentStep, isLoading, reset, environment } = useGrundbuchTestStore();

  // Access control: only in dev mode or with admin param
  const isDevMode = import.meta.env.DEV;
  const hasAdminParam = searchParams.get('admin') === 'true';
  const hasAccess = isDevMode || hasAdminParam;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <AuthStep />;
      case 2:
        return <AddressStep />;
      case 3:
        return <AbfrageStep />;
      case 4:
        return <UrkundenStep />;
      default:
        return <AuthStep />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0a0e27]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-cyan-400">
              Grundbuch API Tester
            </h1>
            <span 
              className={`px-2 py-0.5 text-xs font-mono rounded ${
                environment === 'prod' 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' 
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
              }`}
            >
              {environment.toUpperCase()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} isLoading={isLoading} />

          {/* Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-[#151932] rounded-lg border border-slate-700 p-6 shadow-xl">
                {renderStep()}
              </div>
            </div>

            {/* API Logger Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#151932] rounded-lg border border-slate-700 p-4 sticky top-24">
                <APILogger />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="container mx-auto px-4 py-4 text-center text-slate-500 text-xs font-mono">
          UVST API Test Interface • For Development Use Only
        </div>
      </footer>
    </div>
  );
}
