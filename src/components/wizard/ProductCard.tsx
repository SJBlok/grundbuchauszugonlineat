import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Info, MapPin } from "lucide-react";

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
    <div className="bg-card border rounded-lg p-4">
      {/* Header row: Title + Badge + Price + Info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-foreground truncate">
            Aktueller Grundbuchauszug
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
            Offiziell
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {showPrice && (
            <span className="font-bold text-foreground">29,88 €</span>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
      </div>
      
      {/* Property Details - compact inline */}
      {propertyData && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="text-foreground font-medium">
                KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}
              </p>
              <p className="text-xs">
                {propertyData.bundesland} • {propertyData.grundbuchsgericht}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
