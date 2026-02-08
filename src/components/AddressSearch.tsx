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
    setQuery("");
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

  // If address is selected, show compact confirmation with property details
  if (selectedResult) {
    const addressDisplay = [selectedResult.adresse, selectedResult.plz, selectedResult.ort].filter(Boolean).join(", ");
    
    return (
      <div className="space-y-4">
        {/* Compact address input with edit button */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">
            Adresse des Grundstücks <span className="text-destructive">*</span>
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                type="text"
                value={addressDisplay}
                readOnly
                className="pl-9 bg-muted/30 border-primary/30 cursor-default truncate"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEditSelection}
              className="h-11 px-3 shrink-0"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1.5" />
              Ändern
            </Button>
          </div>
        </div>

        {/* Property Details - Highlighted */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-primary font-medium mb-1">Gefundenes Grundstück</p>
          <p className="text-sm font-medium text-foreground">
            {[selectedResult.adresse, selectedResult.plz, selectedResult.ort].filter(Boolean).join(", ")}
          </p>
          {(selectedResult.kgName || selectedResult.gst || selectedResult.ez) && (
            <p className="text-xs text-muted-foreground mt-1">
              {[
                selectedResult.kgName && `KG ${selectedResult.kgName}`,
                selectedResult.kgNummer && `(${selectedResult.kgNummer})`,
                selectedResult.gst && `GST ${selectedResult.gst}`,
                selectedResult.ez && `EZ ${selectedResult.ez}`,
              ].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Geben Sie die Adresse des Grundstücks ein <span className="text-destructive">*</span>
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="z.B. Hauptstraße 1, 1010 Wien"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-10"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {query.length > 0 && query.length < 3 && (
        <p className="text-xs text-muted-foreground">
          Noch {3 - query.length} Zeichen eingeben...
        </p>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && query.length >= 3 && (
        <div className="text-center py-4 text-muted-foreground border rounded bg-muted/30">
          <MapPin className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Keine Ergebnisse gefunden.</p>
          <p className="text-xs mt-1">Versuchen Sie eine andere Adresse oder wählen Sie einen anderen Tab.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="border border-border rounded overflow-hidden max-h-64 overflow-y-auto bg-background shadow-sm">
          <div className="bg-muted/50 px-3 py-2 border-b text-xs font-medium text-muted-foreground sticky top-0 z-10">
            {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} gefunden
          </div>
          <div className="divide-y divide-border">
            {results.map((result, index) => (
              <button
                key={`${result.kgNummer}-${result.gst}-${index}`}
                onClick={() => handleSelectResult(result)}
                type="button"
                className={cn(
                  "w-full text-left p-3 transition-all duration-150 cursor-pointer",
                  "hover:bg-primary/5 active:bg-primary/10",
                  "focus:outline-none focus:bg-primary/10",
                  "group"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Building className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                      {result.adresse}
                      {result.plz && result.ort && `, ${result.plz} ${result.ort}`}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {result.kgName && <p>KG: {result.kgName} ({result.kgNummer})</p>}
                      {result.gst && <p>Grundstück: {result.gst}</p>}
                      {result.bundesland && (
                        <p className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.bundesland}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
