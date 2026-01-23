import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Key } from 'lucide-react';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { authenticate } from '@/lib/uvst-api';
import type { Environment } from '@/types/grundbuch-api';

const authSchema = z.object({
  // Credentials come from server-side secrets, no input needed
});

export function AuthStep() {
  const { 
    environment, 
    setEnvironment, 
    token, 
    setToken, 
    isLoading, 
    setIsLoading,
    error,
    setError,
    addApiLog,
    nextStep,
  } = useGrundbuchTestStore();

  const [success, setSuccess] = useState(false);

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const tokenState = await authenticate(environment, addApiLog);
      setToken(tokenState);
      setSuccess(true);
      
      // Auto-advance after success
      setTimeout(() => {
        nextStep();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const tokenExpiresIn = token.expiresAt 
    ? Math.max(0, Math.round((token.expiresAt - Date.now()) / 1000 / 60))
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 font-mono">Step 1: Authenticatie</h2>
        <p className="text-slate-400 text-sm">
          Verkrijg een JWT token van de UVST API om verdere requests te kunnen doen.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Environment</Label>
          <Tabs value={environment} onValueChange={(v) => setEnvironment(v as Environment)}>
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger 
                value="test" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                🧪 Test
              </TabsTrigger>
              <TabsTrigger 
                value="prod"
                className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
              >
                🚀 Production
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {environment === 'prod' && (
            <p className="text-orange-400 text-xs">
              ⚠️ Production environment - echte kosten worden in rekening gebracht!
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Key className="w-4 h-4" />
            <span>Credentials worden veilig opgehaald via server-side secrets</span>
          </div>
        </div>

        <Button 
          onClick={handleAuthenticate}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Authenticating...
            </>
          ) : (
            'Authenticatie Testen'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && token.value && (
        <Alert className="bg-emerald-900/20 border-emerald-500/50">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400">Authenticatie succesvol!</AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="mt-2 p-3 bg-slate-800 rounded font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Token:</span>
                <span className="text-cyan-400">{token.value.substring(0, 30)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expires in:</span>
                <span className="text-emerald-400">{tokenExpiresIn} minuten</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-slate-300">{token.type}</span>
              </div>
            </div>
            <p className="text-emerald-300 text-sm mt-2">
              Automatisch door naar Step 2...
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
