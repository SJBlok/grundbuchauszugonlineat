import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  Download,
  Euro
} from 'lucide-react';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { grundbuchAbfrage } from '@/lib/uvst-api';
import type { AbfrageConfig } from '@/types/grundbuch-api';

export function AbfrageStep() {
  const {
    environment,
    token,
    lookupResult,
    abfrageConfig,
    setAbfrageConfig,
    abfrageResult,
    setAbfrageResult,
    isLoading,
    setIsLoading,
    error,
    setError,
    addApiLog,
    nextStep,
    prevStep,
  } = useGrundbuchTestStore();

  const [success, setSuccess] = useState(false);

  const handleAbfrage = async () => {
    if (!token.value || !lookupResult) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await grundbuchAbfrage(
        environment,
        token.value,
        lookupResult.kgNummer,
        lookupResult.einlagezahl,
        abfrageConfig,
        'GT_GBA',
        addApiLog
      );
      setAbfrageResult(result);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Grundbuch query failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!abfrageResult?.response) return;

    const binaryString = atob(abfrageResult.response);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: abfrageResult.resourceContentTyp });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grundbuchauszug.${abfrageConfig.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 font-mono">Step 3: Grundbuch Abfrage</h2>
        <p className="text-slate-400 text-sm">
          Vraag de Grundbuchauszug op met de gevonden gegevens.
        </p>
      </div>

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
            <div className="flex justify-between">
              <span className="text-slate-400">Gericht:</span>
              <span className="text-slate-300">{lookupResult.gericht}</span>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-300">Configuratie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="historisch" className="text-slate-300 text-sm">Historische Daten</Label>
            <Switch
              id="historisch"
              checked={abfrageConfig.historisch}
              onCheckedChange={(checked) => setAbfrageConfig({ historisch: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="signiert" className="text-slate-300 text-sm">Signiert</Label>
            <Switch
              id="signiert"
              checked={abfrageConfig.signiert}
              onCheckedChange={(checked) => setAbfrageConfig({ signiert: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Label htmlFor="linked" className="text-slate-300 text-sm">Linked (Urkunden)</Label>
            <Switch
              id="linked"
              checked={abfrageConfig.linked}
              onCheckedChange={(checked) => setAbfrageConfig({ linked: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-300">Format</Label>
          <Tabs 
            value={abfrageConfig.format} 
            onValueChange={(v) => setAbfrageConfig({ format: v as AbfrageConfig['format'] })}
          >
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger 
                value="PDF" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                PDF
              </TabsTrigger>
              <TabsTrigger 
                value="XML"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                XML
              </TabsTrigger>
              <TabsTrigger 
                value="HTML"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stichtag" className="text-slate-300">Stichtag (optioneel)</Label>
          <Input
            id="stichtag"
            type="date"
            value={abfrageConfig.stichtag || ''}
            onChange={(e) => setAbfrageConfig({ stichtag: e.target.value || undefined })}
            className="bg-slate-800 border-slate-700 text-slate-100 w-48"
          />
        </div>
      </div>

      <Button
        onClick={handleAbfrage}
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
            <FileText className="w-4 h-4 mr-2" />
            Grundbuchauszug Ophalen
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && abfrageResult && (
        <Alert className="bg-emerald-900/20 border-emerald-500/50">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400">Grundbuchauszug opgehaald!</AlertTitle>
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
                  <span className="text-slate-300">€{abfrageResult.ergebnis.kosten.gebuehr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entgelt:</span>
                  <span className="text-slate-300">€{abfrageResult.ergebnis.kosten.entgelt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">USt:</span>
                  <span className="text-slate-300">€{abfrageResult.ergebnis.kosten.ust.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                  <span className="text-cyan-400 font-medium">Gesamt (inkl. USt):</span>
                  <span className="text-cyan-400 font-medium">€{abfrageResult.ergebnis.kosten.gesamtKostenInklUst.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="p-3 bg-slate-800 rounded border border-slate-700">
              <div className="font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-cyan-400">{abfrageResult.ergebnis.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Document Size:</span>
                  <span className="text-slate-300">{(abfrageResult.resourceSize / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Content Type:</span>
                  <span className="text-slate-300">{abfrageResult.resourceContentTyp}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download {abfrageConfig.format}
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
        <Button
          type="button"
          onClick={nextStep}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          Volgende (Urkunden)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
