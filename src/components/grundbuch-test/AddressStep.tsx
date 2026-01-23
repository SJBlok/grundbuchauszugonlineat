import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, MapPin, ArrowLeft, ArrowRight, Info, Search, Building, X, Edit2, CheckCircle2, Database } from 'lucide-react';
import { useGrundbuchTestStore } from '@/stores/grundbuch-test-store';
import { mockAddressLookup } from '@/lib/uvst-api';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const addressSchema = z.object({
  straat: z.string().min(1, 'Straat is verplicht'),
  huisnummer: z.string().optional(),
  postcode: z.string().optional(),
  plaats: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

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
    addressData,
    setAddressData,
    lookupResult,
    setLookupResult,
    isLoading,
    setIsLoading,
    error,
    setError,
    nextStep,
    prevStep,
  } = useGrundbuchTestStore();

  const [success, setSuccess] = useState(false);
  
  // Address search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AddressSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressSearchResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mock database search state
  const [mockSearchQuery, setMockSearchQuery] = useState("");
  const [mockSearchResults, setMockSearchResults] = useState<AddressSearchResult[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: addressData,
  });

  // Debounced search as user types
  useEffect(() => {
    if (selectedAddress) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 3) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      setHasSearched(true);

      try {
        const { data, error: fetchError } = await supabase.functions.invoke("search-address", {
          body: { query: searchQuery },
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setSearchResults(data.results || []);
      } catch (err: unknown) {
        console.error("Search error:", err);
        setSearchError("Fehler bei der Suche. Bitte versuchen Sie es erneut.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, selectedAddress]);

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
    
    // Parse address into street and house number
    const addressParts = result.adresse.match(/^(.+?)\s+(\d+.*)$/) || [result.adresse, result.adresse, ''];
    const street = addressParts[1] || result.adresse;
    const houseNumber = addressParts[2] || '';
    
    // Update form fields
    setValue('straat', street);
    setValue('huisnummer', houseNumber);
    setValue('postcode', result.plz);
    setValue('plaats', result.ort);
    
    // Update store
    setAddressData({
      straat: street,
      huisnummer: houseNumber,
      postcode: result.plz,
      plaats: result.ort,
    });
    
    // Clear search
    setSearchQuery([result.adresse, result.plz, result.ort].filter(Boolean).join(", "));
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleClearSelection = () => {
    setSelectedAddress(null);
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setLookupResult(null);
    setSuccess(false);
    setMockSearchQuery("");
    setMockSearchResults([]);
    // Clear form fields
    setValue('straat', '');
    setValue('huisnummer', '');
    setValue('postcode', '');
    setValue('plaats', '');
    setAddressData({ straat: '', huisnummer: '', postcode: '', plaats: '' });
    inputRef.current?.focus();
  };

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setAddressData(data);

    try {
      const result = await mockAddressLookup(
        data.straat,
        data.huisnummer || '',
        data.postcode || '',
        data.plaats || ''
      );
      setLookupResult(result);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Address lookup failed');
    } finally {
      setIsLoading(false);
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

      {/* OpenStreetMap Address Search */}
      <div className="space-y-4">
        <Label className="text-slate-300 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Adres zoeken (OpenStreetMap)
        </Label>
        
        {selectedAddress ? (
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
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Adresse eingeben (z.B. Hauptstraße 1, Wien)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-12 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-cyan-400" />
              )}
              {!isSearching && searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setHasSearched(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>

            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <p className="text-sm text-slate-500">
                Noch {3 - searchQuery.length} Zeichen eingeben...
              </p>
            )}

            {searchError && (
              <p className="text-sm text-red-400">{searchError}</p>
            )}

            {hasSearched && !isSearching && searchResults.length === 0 && !searchError && searchQuery.length >= 3 && (
              <div className="text-center py-4 text-slate-400 border border-slate-700 rounded-lg bg-slate-800/50">
                <MapPin className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Keine Ergebnisse gefunden.</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="border border-cyan-500/30 rounded-lg overflow-hidden max-h-60 overflow-y-auto bg-slate-800">
                <div className="bg-slate-700/50 px-3 py-2 border-b border-slate-700 text-xs font-medium text-slate-400 sticky top-0 z-10">
                  {searchResults.length} Ergebnis{searchResults.length !== 1 ? 'se' : ''} – Klicken zum Auswählen
                </div>
                <div className="divide-y divide-slate-700">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.adresse}-${result.plz}-${index}`}
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
                        <div className="h-9 w-9 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                          <Building className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-200 text-sm group-hover:text-cyan-400 transition-colors">
                            {result.adresse}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {result.plz} {result.ort}
                            {result.bundesland && ` • ${result.bundesland}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500 text-center">
              Adresssuche via OpenStreetMap (Photon API)
            </p>
          </div>
        )}
      </div>

      {/* Manual address fields - filled from search or manual entry */}
      <div className="border-t border-slate-700 pt-6">
        <Alert className="bg-amber-900/20 border-amber-500/50 mb-4">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertTitle className="text-amber-400">Mock KG Lookup</AlertTitle>
          <AlertDescription className="text-amber-200/80">
            Na het selecteren van een adres, klik op "KG Opzoeken" om de mock Katastralgemeinde gegevens op te halen.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="straat" className="text-slate-300">Straat</Label>
              <Input
                id="straat"
                {...register('straat')}
                placeholder="Kärntner Straße"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              {errors.straat && (
                <p className="text-red-400 text-xs">{errors.straat.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="huisnummer" className="text-slate-300">Huisnummer</Label>
              <Input
                id="huisnummer"
                {...register('huisnummer')}
                placeholder="1"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              {errors.huisnummer && (
                <p className="text-red-400 text-xs">{errors.huisnummer.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode" className="text-slate-300">Postcode</Label>
              <Input
                id="postcode"
                {...register('postcode')}
                placeholder="1010"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              {errors.postcode && (
                <p className="text-red-400 text-xs">{errors.postcode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plaats" className="text-slate-300">Plaats</Label>
              <Input
                id="plaats"
                {...register('plaats')}
                placeholder="Wien"
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
              {errors.plaats && (
                <p className="text-red-400 text-xs">{errors.plaats.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                KG Opzoeken...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                KG Opzoeken (Mock)
              </>
            )}
          </Button>
        </form>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && lookupResult && (
        <Alert className="bg-emerald-900/20 border-emerald-500/50">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400">KG gegevens gevonden!</AlertTitle>
          <AlertDescription>
            <div className="mt-2 p-3 bg-slate-800 rounded font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">KG-Nummer:</span>
                <span className="text-cyan-400">{lookupResult.kgNummer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">KG-Name:</span>
                <span className="text-slate-300">{lookupResult.kgName}</span>
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
          disabled={!lookupResult}
          className="bg-cyan-600 hover:bg-cyan-500 text-white"
        >
          Volgende
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
