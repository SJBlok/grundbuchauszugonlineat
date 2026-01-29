import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Info, MapPin, FileText, CheckCircle2 } from "lucide-react";
import grundbuchPreview from "@/assets/grundbuch-preview.jpg";

interface PropertyData {
  katastralgemeinde: string;
  grundstuecksnummer: string;
  bundesland: string;
  grundbuchsgericht: string;
  wohnungsHinweis?: string;
}

interface ProductCardProps {
  propertyData?: PropertyData;
  showPrice?: boolean;
}

export function ProductCard({ propertyData, showPrice = true }: ProductCardProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Header with image and badge */}
      <div className="relative">
        <div className="flex gap-3 p-3 sm:p-4">
          {/* Document Preview Thumbnail */}
          <div className="shrink-0">
            <div className="w-16 h-20 sm:w-20 sm:h-24 rounded border bg-muted overflow-hidden shadow-sm">
              <img 
                src={grundbuchPreview} 
                alt="Grundbuchauszug Vorschau" 
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
          
          {/* Title and Price */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground text-sm sm:text-base">
                    Aktueller Grundbuchauszug
                  </h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                    Offiziell
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Direkt aus dem österreichischen Grundbuch
                </p>
              </div>
              
              {/* Info Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground -mt-1 -mr-1">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Aktueller Grundbuchauszug – Inhalt</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-bold text-foreground">
                        Vollständige Eigentumsinformationen
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Enthält alle im Grundbuch eingetragenen Eigentümer, Eigentumsanteile sowie die rechtliche Grundlage des Eigentumserwerbs (B-Blatt).
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-foreground">
                        Detaillierte Grundstücks- und Objektdaten
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Zeigt die Katastralgemeinde, Grundstücksnummern, Flächenangaben und sonstige objektspezifische Informationen gemäß A1- und A2-Blatt.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-foreground">
                        Übersicht über Lasten und Beschränkungen
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Gibt Auskunft über Hypotheken, Dienstbarkeiten, Pfandrechte sowie weitere im C-Blatt eingetragene Belastungen.
                      </p>
                    </div>

                    <p className="text-muted-foreground pt-2 border-t">
                      Die Zustellung erfolgt per E-Mail innerhalb weniger Minuten nach Bestellabschluss.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Price - only shown if showPrice is true */}
            {showPrice && (
              <div className="mt-2">
                <span className="text-lg sm:text-xl font-bold text-foreground">19,90 €</span>
                <span className="text-xs text-muted-foreground ml-1">inkl. MwSt.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content includes */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="bg-muted/40 rounded-md p-2.5 sm:p-3">
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Enthält
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>A-Blatt: Grundstücksdaten</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>B-Blatt: Eigentümer & Anteile</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>C-Blatt: Lasten & Beschränkungen</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Property Details - shown when propertyData is provided */}
      {propertyData && (
        <div className="border-t bg-muted/20">
          <div className="px-3 sm:px-4 py-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Grundstück
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}
                </p>
                <p className="text-xs text-muted-foreground">
                  {propertyData.bundesland} • {propertyData.grundbuchsgericht}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
