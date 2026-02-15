import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight } from "lucide-react";
import iconDocument from "@/assets/icon-document.png";

const productFeatures = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Zustellung per E-Mail innerhalb weniger Minuten",
  "Elektronisch signiertes PDF-Dokument",
];

const steps = [
  {
    number: "1",
    title: "Grundstücksdaten eingeben",
    description:
      "Geben Sie die erforderlichen Informationen zum Grundstück ein: Katastralgemeinde, Grundstücksnummer, Grundbuchsgericht und Bundesland.",
  },
  {
    number: "2",
    title: "Produkt auswählen und Angaben prüfen",
    description:
      "Überprüfen Sie Ihre eingegebenen Daten und wählen Sie den gewünschten Grundbuchauszug.",
  },
  {
    number: "3",
    title: "Bestellung abschließen",
    description:
      "Geben Sie Ihre Kontaktdaten ein, wählen Sie die Zahlungsart und bestätigen Sie die Bestellung.",
  },
  {
    number: "4",
    title: "Versand per E-Mail",
    description:
      "Nach Abschluss der Bestellung wird der Grundbuchauszug innerhalb weniger Minuten per E-Mail an Sie versendet.",
  },
];

export default function Preise() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Preise
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Transparente Preisgestaltung ohne versteckte Kosten.
            </p>

            {/* Product Card */}
            <div className="bg-background border rounded-lg overflow-hidden mb-8">
              <div className="bg-primary text-primary-foreground px-6 py-3">
                <h2 className="font-semibold">Produkt</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img src={iconDocument} alt="" className="w-20 h-20 object-contain" />
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Aktueller Grundbuchauszug
                      </h3>
                      <span className="text-3xl font-bold text-primary">28,90 €</span>
                    </div>
                    <ul className="space-y-2">
                      {productFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-info p-6 rounded border mb-12">
              <h3 className="font-semibold text-foreground mb-2">
                Zahlungsart
              </h3>
              <p className="text-muted-foreground">
                Die Zahlung erfolgt auf Rechnung (Überweisung). Die Rechnung wird nach Abschluss der Bestellung per E-Mail übermittelt. Die Zahlungsfrist beträgt 14 Tage.
              </p>
            </div>

            {/* Ablauf Section */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Ablauf
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              In wenigen Schritten zu Ihrem Grundbuchauszug.
            </p>

            <div className="space-y-6 mb-12">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/anfordern" className="hover:no-underline">
                  Jetzt anfordern
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
