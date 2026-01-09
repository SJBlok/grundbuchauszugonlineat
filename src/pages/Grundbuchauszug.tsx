import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight } from "lucide-react";
import iconDocument from "@/assets/icon-document.png";

const features = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Aktuelle Daten aus dem österreichischen Grundbuch",
  "Elektronisch signiertes Dokument",
];

export default function Grundbuchauszug() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Grundbuchauszug
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  Ein Grundbuchauszug ist ein offizielles Dokument, das alle wesentlichen Informationen zu einem Grundstück oder einer Liegenschaft in Österreich enthält.
                </p>

                <p className="text-muted-foreground mb-6">
                  Er gibt Auskunft über Eigentumsverhältnisse, Grundstücksdaten und eingetragene Belastungen wie Hypotheken, Dienstbarkeiten und Pfandrechte.
                </p>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <img src={iconDocument} alt="Grundbuchauszug" className="w-32 h-32 object-contain" />
              </div>
            </div>

            <div className="bg-info p-6 rounded border mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Im Grundbuchauszug enthalten
              </h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-4">
              Die drei Teile des Grundbuchs
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="bg-muted p-5 rounded border-l-4 border-primary">
                <h3 className="font-semibold text-foreground mb-2">A-Blatt (Gutsbestandsblatt)</h3>
                <p className="text-muted-foreground text-sm">
                  Enthält die Beschreibung des Grundstücks: Katastralgemeinde, Grundstücksnummer, Fläche und Nutzungsart.
                </p>
              </div>
              
              <div className="bg-muted p-5 rounded border-l-4 border-secondary">
                <h3 className="font-semibold text-foreground mb-2">B-Blatt (Eigentumsblatt)</h3>
                <p className="text-muted-foreground text-sm">
                  Zeigt die Eigentümer des Grundstücks, deren Anteile und die rechtliche Grundlage des Eigentumserwerbs.
                </p>
              </div>
              
              <div className="bg-muted p-5 rounded border-l-4 border-muted-foreground">
                <h3 className="font-semibold text-foreground mb-2">C-Blatt (Lastenblatt)</h3>
                <p className="text-muted-foreground text-sm">
                  Enthält alle Belastungen wie Hypotheken, Dienstbarkeiten, Pfandrechte und sonstige Beschränkungen.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/anfordern" className="hover:no-underline">
                  Grundbuchauszug anfordern
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
