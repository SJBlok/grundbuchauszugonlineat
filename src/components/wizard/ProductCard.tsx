import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export function ProductCard() {
  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <span className="font-bold text-foreground">
          Aktueller Grundbuchauszug
        </span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">19,90 €</span>
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
    </div>
  );
}
