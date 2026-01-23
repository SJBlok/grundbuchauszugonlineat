import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileStack, 
  ArrowLeft,
  Download,
  Euro,
  Info
} from 'lucide-react';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { grundbuchUrkunden } from '@/lib/uvst-api';

const urkundenSchema = z.object({
  urkundenNummer: z.string().min(1, 'Urkunden Nummer is verplicht'),
  jahr: z.string().min(4, 'Jaar is verplicht (YYYY)'),
});

type UrkundenFormData = z.infer<typeof urkundenSchema>;

export function UrkundenStep() {
  const {
    environment,
    token,
    lookupResult,
    urkundenResult,
    setUrkundenResult,
    isLoading,
    setIsLoading,
    error,
    setError,
    addApiLog,
    prevStep,
  } = useGrundbuchTestStore();

  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrkundenFormData>({
    resolver: zodResolver(urkundenSchema),
  });

  const onSubmit = async (data: UrkundenFormData) => {
    if (!token.value || !lookupResult) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await grundbuchUrkunden(
        environment,
        token.value,
        lookupResult.kgNummer,
        lookupResult.einlagezahl,
        data.urkundenNummer,
        data.jahr,
        addApiLog
      );
      setUrkundenResult(result);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Urkunden query failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!urkundenResult?.response) return;

    const binaryString = atob(urkundenResult.response);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: urkundenResult.resourceContentTyp });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urkunde.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 font-mono">Step 4: Urkunden Abfrage</h2>
        <p className="text-slate-400 text-sm">
          Ophalen van specifieke documenten zoals koopcontracten en hypotheekaktes.
        </p>
      </div>

      <Alert className="bg-blue-900/20 border-blue-500/50">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertTitle className="text-blue-400">Info</AlertTitle>
        <AlertDescription className="text-blue-200/80">
          Urkunden zijn officiële aktes zoals koopcontracten, hypotheekaktes, etc. 
          Je hebt het exacte urkundennummer en jaar nodig.
        </AlertDescription>
      </Alert>

      {/* Property Info Card */}
      {lookupResult && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Geselecteerd perceel</h3>
          <div className="font-mono text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">KG-Nummer:</span>
              <span className="text-cyan-400">{lookupResult.kgNummer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Einlagezahl:</span>
              <span className="text-cyan-400">{lookupResult.einlagezahl}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="urkundenNummer" className="text-slate-300">Urkunden Nummer</Label>
            <Input
              id="urkundenNummer"
              {...register('urkundenNummer')}
              placeholder="12345"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {errors.urkundenNummer && (
              <p className="text-red-400 text-xs">{errors.urkundenNummer.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jahr" className="text-slate-300">Jahr</Label>
            <Input
              id="jahr"
              {...register('jahr')}
              placeholder="2024"
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            {errors.jahr && (
              <p className="text-red-400 text-xs">{errors.jahr.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !token.value}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Laden...
            </>
          ) : (
            <>
              <FileStack className="w-4 h-4 mr-2" />
              Urkunde Ophalen
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && urkundenResult && (
        <Alert className="bg-emerald-900/20 border-emerald-500/50">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400">Urkunde opgehaald!</AlertTitle>
          <AlertDescription className="space-y-4">
            {/* Cost Breakdown */}
            <div className="mt-3 p-3 bg-slate-800 rounded border border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Kosten Breakdown
              </h4>
              <div className="font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gebühr:</span>
                  <span className="text-slate-300">€{urkundenResult.ergebnis.kosten.gebuehr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entgelt:</span>
                  <span className="text-slate-300">€{urkundenResult.ergebnis.kosten.entgelt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">USt:</span>
                  <span className="text-slate-300">€{urkundenResult.ergebnis.kosten.ust.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                  <span className="text-cyan-400 font-medium">Gesamt (inkl. USt):</span>
                  <span className="text-cyan-400 font-medium">€{urkundenResult.ergebnis.kosten.gesamtKostenInklUst.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="p-3 bg-slate-800 rounded border border-slate-700">
              <div className="font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-cyan-400">{urkundenResult.ergebnis.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Document Size:</span>
                  <span className="text-slate-300">{(urkundenResult.resourceSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Content Type:</span>
                  <span className="text-slate-300">{urkundenResult.resourceContentTyp}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Urkunde
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>
      </div>
    </div>
  );
}
