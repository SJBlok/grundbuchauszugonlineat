import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Building, X, CheckCircle2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

interface AddressSearchProps {
  onSelectResult: (result: AddressSearchResult) => void;
}

export function AddressSearch({ onSelectResult }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<AddressSearchResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectResult = (result: AddressSearchResult) => {
    setSelectedResult(result);
    onSelectResult(result);
    // Show selected address in search bar and close dropdown
    const addressDisplay = [result.adresse, result.plz, result.ort].filter(Boolean).join(", ");
    setQuery(addressDisplay);
    setResults([]);
    setHasSearched(false);
  };

  const handleClearSelection = () => {
    setSelectedResult(null);
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleEditSelection = () => {
    setSelectedResult(null);
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  // Debounced search as user types
  useEffect(() => {
    // Don't search if we have a selected result
    if (selectedResult) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const { data, error: fetchError } = await supabase.functions.invoke("search-address", {
          body: { query },
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setResults(data.results || []);
      } catch (err: any) {
        console.error("Search error:", err);
        setError("Fehler bei der Suche. Bitte versuchen Sie es erneut.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedResult]);

  // If address is selected, show confirmation card
  if (selectedResult) {
    const addressDisplay = [selectedResult.adresse, selectedResult.plz, selectedResult.ort].filter(Boolean).join(", ");
    
    return (
      <div className="space-y-4">
        <div className="border-2 border-success/40 bg-success/5 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Adresse ausgewählt</p>
              <p className="text-sm text-muted-foreground mt-1">{addressDisplay}</p>
              {selectedResult.bundesland && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedResult.bundesland}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditSelection}
                className="h-8 px-3"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Ändern
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Adresse eingeben (z.B. Hauptstraße 1, 1010 Wien)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 h-12 bg-background"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {query.length > 0 && query.length < 3 && (
        <p className="text-sm text-muted-foreground">
          Noch {3 - query.length} Zeichen eingeben...
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && query.length >= 3 && (
        <div className="text-center py-6 text-muted-foreground border rounded-lg bg-muted/30">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Keine Ergebnisse gefunden.</p>
          <p className="text-sm">Versuchen Sie eine andere Adresse oder geben Sie die Daten manuell ein.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="border-2 border-primary/20 rounded-lg overflow-hidden max-h-80 overflow-y-auto bg-background shadow-lg">
          <div className="bg-muted/50 px-4 py-2 border-b text-sm font-medium text-muted-foreground">
            {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} gefunden – Klicken zum Auswählen
          </div>
          <div className="divide-y divide-border">
            {results.map((result, index) => (
              <button
                key={`${result.kgNummer}-${result.gst}-${index}`}
                onClick={() => handleSelectResult(result)}
                type="button"
                className={cn(
                  "w-full text-left p-4 transition-all duration-150 cursor-pointer",
                  "hover:bg-primary/5 hover:border-l-4 hover:border-l-primary hover:pl-3",
                  "focus:outline-none focus:bg-primary/10 focus:border-l-4 focus:border-l-primary focus:pl-3",
                  "active:bg-primary/15 active:scale-[0.99]",
                  "group"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {result.adresse}
                      {result.plz && result.ort && `, ${result.plz} ${result.ort}`}
                    </p>
                    <div className="text-sm text-muted-foreground mt-1.5 space-y-0.5">
                      {result.kgName && <p>KG: {result.kgName} ({result.kgNummer})</p>}
                      {result.gst && <p>Grundstück: {result.gst}</p>}
                      {result.ez && <p>Einlagezahl: {result.ez}</p>}
                      {result.bundesland && (
                        <p className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.bundesland}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                      Auswählen
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Adresssuche via OpenStreetMap
      </p>
    </div>
  );
}
