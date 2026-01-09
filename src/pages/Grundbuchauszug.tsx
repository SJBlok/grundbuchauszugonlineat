import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const features = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Aktuelle Daten aus dem österreichischen Grundbuch",
  "Rechtssichere Dokumentation",
];

export default function Grundbuchauszug() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Grundbuchauszug
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-8">
                Ein Grundbuchauszug ist ein offizielles Dokument, das alle wesentlichen Informationen zu einem Grundstück oder einer Liegenschaft in Österreich enthält. Er gibt Auskunft über Eigentumsverhältnisse, Grundstücksdaten und eingetragene Belastungen.
              </p>

              <div className="bg-info p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Was enthält ein Grundbuchauszug?
                </h2>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-4">
                Die drei Teile des Grundbuchs
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">A-Blatt (Gutsbestandsblatt)</h3>
                  <p className="text-muted-foreground text-sm">
                    Enthält die Beschreibung des Grundstücks: Katastralgemeinde, Grundstücksnummer, Fläche und Nutzungsart.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">B-Blatt (Eigentumsblatt)</h3>
                  <p className="text-muted-foreground text-sm">
                    Zeigt die Eigentümer des Grundstücks, deren Anteile und die rechtliche Grundlage des Eigentumserwerbs.
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">C-Blatt (Lastenblatt)</h3>
                  <p className="text-muted-foreground text-sm">
                    Enthält alle Belastungen wie Hypotheken, Dienstbarkeiten, Pfandrechte und sonstige Beschränkungen.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button asChild size="lg">
                  <Link to="/anfordern">Grundbuchauszug anfordern</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
