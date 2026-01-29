import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, FileText, Shield, Download } from "lucide-react";
import iconDocument from "@/assets/icon-document.png";

const features = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Aktuelle Daten aus dem österreichischen Grundbuch",
  "Elektronisch signiertes PDF-Dokument",
  "Sofort-Download und Versand per E-Mail",
];

const useCases = [
  "Immobilienkauf oder -verkauf",
  "Prüfung der Eigentumsverhältnisse",
  "Kreditaufnahme und Hypothekenprüfung",
  "Erbschaftsangelegenheiten",
  "Bauvorhaben und Genehmigungen",
  "Nachbarschaftsrechtliche Fragen",
];

export default function Grundbuchauszug() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Grundbuchauszug
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. Der Grundbuchauszug wird sofort im Grundbuch abgefragt und als signiertes PDF zur Verfügung gestellt.
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4 text-primary" />
                    <span>Sofort-Download</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Amtlich signiert</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>PDF-Dokument</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <img src={iconDocument} alt="Grundbuchauszug" className="w-32 h-32 object-contain" />
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-primary text-primary-foreground p-6 rounded-lg mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Aktueller Grundbuchauszug</h2>
                  <p className="text-primary-foreground/80">Vollständiger Auszug aus dem Hauptbuch</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">23,88 €</span>
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/anfordern" className="hover:no-underline">Jetzt bestellen</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-info p-6 rounded border mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Im Grundbuchauszug enthalten
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Structure */}
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Aufbau des Grundbuchauszugs
            </h2>
            
            <div className="space-y-4 mb-12">
              <div className="bg-muted p-5 rounded border-l-4 border-primary">
                <h3 className="font-semibold text-foreground mb-2">A-Blatt (Gutsbestandsblatt)</h3>
                <p className="text-muted-foreground text-sm">
                  <strong>Abteilung A-1:</strong> Alle Grundstücke mit Adresse, Grundstücksnummer, Fläche und Benützungsart.<br />
                  <strong>Abteilung A-2:</strong> Mit der Liegenschaft verbundene Rechte, Zu- und Abschreibungen, öffentlich-rechtliche Beschränkungen.
                </p>
              </div>
              
              <div className="bg-muted p-5 rounded border-l-4 border-secondary">
                <h3 className="font-semibold text-foreground mb-2">B-Blatt (Eigentumsblatt)</h3>
                <p className="text-muted-foreground text-sm">
                  Auskunft über die Eigentumsverhältnisse: Wer ist Eigentümer, welche Eigentumsanteile bestehen, wann und durch welche Urkunde wurde das Eigentumsrecht erworben.
                </p>
              </div>
              
              <div className="bg-muted p-5 rounded border-l-4 border-muted-foreground">
                <h3 className="font-semibold text-foreground mb-2">C-Blatt (Lastenblatt)</h3>
                <p className="text-muted-foreground text-sm">
                  Alle Belastungen der Liegenschaft: Hypotheken, Pfandrechte, Dienstbarkeiten, Vor- und Wiederverkaufsrechte sowie Miet- und Pachtverträge.
                </p>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-info p-6 rounded border mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Wann benötigt man einen Grundbuchauszug?
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {useCases.map((useCase) => (
                  <div key={useCase} className="flex items-center gap-3">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
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
