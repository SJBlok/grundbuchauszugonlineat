import { useState, useCallback } from "react";
import { Search, MapPin, Loader2, Building } from "lucide-react";
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

  const handleSearch = useCallback(async () => {
    if (query.length < 3) {
      setError("Bitte geben Sie mindestens 3 Zeichen ein.");
      return;
    }

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
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Adresse eingeben (z.B. Hauptstraße 1, 1010 Wien)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || query.length < 3}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Suchen"
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {hasSearched && !isLoading && results.length === 0 && !error && (
        <div className="text-center py-6 text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Keine Ergebnisse gefunden.</p>
          <p className="text-sm">Versuchen Sie eine andere Adresse oder geben Sie die Daten manuell ein.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.kgNummer}-${result.gst}-${index}`}
              onClick={() => onSelectResult(result)}
              className={cn(
                "w-full text-left p-3 hover:bg-accent transition-colors",
                "focus:outline-none focus:bg-accent"
              )}
            >
              <div className="flex items-start gap-3">
                <Building className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {result.adresse}
                    {result.plz && result.ort && `, ${result.plz} ${result.ort}`}
                  </p>
                  <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                    <p>KG: {result.kgName} ({result.kgNummer})</p>
                    {result.gst && <p>Grundstück: {result.gst}</p>}
                    {result.ez && <p>Einlagezahl: {result.ez}</p>}
                    {result.bundesland && <p>{result.bundesland}</p>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Suche im Anschriftenverzeichnis des Grundbuchs (bis zu 1.000 Treffer möglich)
      </p>
    </div>
  );
}
