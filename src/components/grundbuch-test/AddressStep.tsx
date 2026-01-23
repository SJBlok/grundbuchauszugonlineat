import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight, Search, Building, X, Edit2, CheckCircle2, Database, FileText } from 'lucide-react';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { authenticate, grundbuchAbfrage } from '@/lib/uvst-api';
import { cn } from '@/lib/utils';

interface AddressSearchResult {
  kgNummer: string;
  kgName: string;
  ez: string;
  gst: string;
  adresse: string;
  plz: string;
  ort: string;
  bundesland: string;
}

// Mock addresses for testing
const mockAddresses: AddressSearchResult[] = [
  { kgNummer: '01001', kgName: 'Innere Stadt', ez: '123', gst: '456', adresse: 'Kärntner Straße 1', plz: '1010', ort: 'Wien', bundesland: 'Wien' },
  { kgNummer: '01002', kgName: 'Leopoldstadt', ez: '789', gst: '012', adresse: 'Praterstraße 25', plz: '1020', ort: 'Wien', bundesland: 'Wien' },
  { kgNummer: '61001', kgName: 'Salzburg', ez: '234', gst: '567', adresse: 'Getreidegasse 9', plz: '5020', ort: 'Salzburg', bundesland: 'Salzburg' },
  { kgNummer: '65001', kgName: 'Innsbruck', ez: '345', gst: '678', adresse: 'Maria-Theresien-Straße 18', plz: '6020', ort: 'Innsbruck', bundesland: 'Tirol' },
  { kgNummer: '60101', kgName: 'Graz - Innere Stadt', ez: '456', gst: '789', adresse: 'Herrengasse 16', plz: '8010', ort: 'Graz', bundesland: 'Steiermark' },
];

export function AddressStep() {
  const {
    environment,
    token,
    setToken,
    isTokenValid,
    abfrageConfig,
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

  const [selectedAddress, setSelectedAddress] = useState<AddressSearchResult | null>(null);
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  
  // Mock database search state
  const [mockSearchQuery, setMockSearchQuery] = useState("");
  const [mockSearchResults, setMockSearchResults] = useState<AddressSearchResult[]>([]);

  // Mock database search effect
  useEffect(() => {
    if (mockSearchQuery.length === 0) {
      setMockSearchResults([]);
      return;
    }
    
    const query = mockSearchQuery.toLowerCase();
    const filtered = mockAddresses.filter(addr => 
      addr.plz.includes(query) || 
      addr.ort.toLowerCase().includes(query) ||
      addr.adresse.toLowerCase().includes(query) ||
      addr.kgName.toLowerCase().includes(query)
    );
    setMockSearchResults(filtered);
  }, [mockSearchQuery]);

  const handleSelectAddress = (result: AddressSearchResult) => {
    setSelectedAddress(result);
    setAbfrageResult(null);
    setError(null);
    
    // Clear mock search
    setMockSearchQuery("");
    setMockSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedAddress(null);
    setAbfrageResult(null);
    setError(null);
    setMockSearchQuery("");
    setMockSearchResults([]);
  };

  const handleFetchDocuments = async () => {
    if (!selectedAddress) return;
    
    setIsFetchingDocs(true);
    setError(null);
    
    try {
      // First authenticate if needed
      let currentToken = token.value;
      if (!isTokenValid()) {
        const newToken = await authenticate(environment, addApiLog);
        setToken(newToken);
        currentToken = newToken.value;
      }
      
      if (!currentToken) {
        throw new Error('Geen geldige token beschikbaar');
      }
      
      // Fetch documents using the selected address KG data
      const result = await grundbuchAbfrage(
        environment,
        currentToken,
        selectedAddress.kgNummer,
        selectedAddress.ez,
        abfrageConfig,
        addApiLog
      );
      
      setAbfrageResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Documenten ophalen mislukt');
    } finally {
      setIsFetchingDocs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 font-mono">Step 2: Adres Lookup</h2>
        <p className="text-slate-400 text-sm">
          Zoek eerst een adres via OpenStreetMap of selecteer een mock adres.
        </p>
      </div>

      {/* Mock Database Search */}
      <div className="space-y-3">
        <Label className="text-slate-300 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Mock database zoeken (postcode, stad, adres of KG)
        </Label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Zoek op postcode (bijv. 1010), stad, adres..."
            value={mockSearchQuery}
            onChange={(e) => setMockSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
          {mockSearchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => setMockSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Mock Search Results */}
        {mockSearchResults.length > 0 && (
          <div className="border border-cyan-500/30 rounded-lg overflow-hidden bg-slate-800">
            <div className="bg-slate-700/50 px-3 py-2 border-b border-slate-700 text-xs font-medium text-slate-400">
              {mockSearchResults.length} resultaat{mockSearchResults.length !== 1 ? 'en' : ''} gevonden
            </div>
            <div className="divide-y divide-slate-700 max-h-48 overflow-y-auto">
              {mockSearchResults.map((result, index) => (
                <button
                  key={`mock-${result.kgNummer}-${index}`}
                  onClick={() => handleSelectAddress(result)}
                  type="button"
                  className={cn(
                    "w-full text-left p-3 transition-all duration-150 cursor-pointer",
                    "hover:bg-cyan-500/10 active:bg-cyan-500/20",
                    "focus:outline-none focus:bg-cyan-500/10",
                    "group"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Building className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">
                        {result.adresse}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {result.plz} {result.ort} • KG: {result.kgName} ({result.kgNummer})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        EZ: {result.ez} | GST: {result.gst}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {mockSearchQuery.length > 0 && mockSearchResults.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-2">
            Geen mock adressen gevonden voor "{mockSearchQuery}"
          </p>
        )}

        {/* Quick Mock Address Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {mockAddresses.map((addr, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectAddress(addr)}
              className="border-slate-600 text-slate-300 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 text-xs"
            >
              {addr.adresse}, {addr.ort}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="border-2 border-emerald-500/40 bg-emerald-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-400">Adres geselecteerd</p>
              <p className="text-sm text-slate-300 mt-1">{selectedAddress.adresse}</p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedAddress.plz} {selectedAddress.ort}
                {selectedAddress.bundesland && ` • ${selectedAddress.bundesland}`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                KG: {selectedAddress.kgName} ({selectedAddress.kgNummer}) • EZ: {selectedAddress.ez} • GST: {selectedAddress.gst}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Wijzigen
            </Button>
          </div>
        </div>
      )}

      {/* Fetch Documents Button */}
      {selectedAddress && (
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleFetchDocuments}
            disabled={isFetchingDocs || isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            {isFetchingDocs ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Documenten ophalen...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Documenten ophalen (UVST API)
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

          {abfrageResult && (
            <Alert className="bg-emerald-900/20 border-emerald-500/50">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <AlertTitle className="text-emerald-400">Documenten opgehaald!</AlertTitle>
              <AlertDescription>
                <div className="mt-2 p-3 bg-slate-800 rounded font-mono text-xs space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="text-cyan-400">{abfrageResult.ergebnis?.transactionId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kosten:</span>
                    <span className="text-cyan-400">€{abfrageResult.ergebnis?.kosten?.gesamtKostenInklUst?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resource Type:</span>
                    <span className="text-slate-300">{abfrageResult.resourceContentTyp || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resource Size:</span>
                    <span className="text-slate-300">{abfrageResult.resourceSize ? `${(abfrageResult.resourceSize / 1024).toFixed(1)} KB` : 'N/A'}</span>
                  </div>
                  {abfrageResult.response && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <p className="text-slate-400 mb-1">Document (base64):</p>
                      <p className="text-slate-500 text-xs truncate">
                        {abfrageResult.response.substring(0, 100)}...
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
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
          disabled={!selectedAddress}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          Volgende
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
