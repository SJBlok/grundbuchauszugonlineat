import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectResult = (result: AddressSearchResult) => {
    onSelectResult(result);
    // Close dropdown after selection
    setResults([]);
    setQuery("");
    setHasSearched(false);
  };

  // Debounced search as user types
  useEffect(() => {
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
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Adresse eingeben (z.B. Hauptstraße 1, 1010 Wien)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
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
        <div className="text-center py-6 text-muted-foreground">
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
        Adres zoeken via OpenStreetMap (Photon Geocoding)
      </p>
    </div>
  );
}
