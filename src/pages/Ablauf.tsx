import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import iconMap from "@/assets/icon-map.png";

const steps = [
  {
    number: "1",
    title: "Grundstücksdaten eingeben",
    description:
      "Geben Sie die erforderlichen Informationen zum Grundstück ein: Katastralgemeinde, Grundstücksnummer, Grundbuchsgericht und Bundesland. Optionale Angaben wie Wohnungs- oder Anteilshinweise können ebenfalls hinzugefügt werden.",
  },
  {
    number: "2",
    title: "Produkt auswählen und Angaben prüfen",
    description:
      "Überprüfen Sie Ihre eingegebenen Daten und wählen Sie den gewünschten Grundbuchauszug. Sie sehen eine Übersicht aller enthaltenen Informationen und den Preis.",
  },
  {
    number: "3",
    title: "Bestellung abschließen",
    description:
      "Geben Sie Ihre Kontaktdaten ein (Name, E-Mail-Adresse, Wohnsitzland). Wählen Sie die Zahlungsart und bestätigen Sie die Bestellung. Die Zahlung erfolgt auf Rechnung.",
  },
  {
    number: "4",
    title: "Versand per E-Mail",
    description:
      "Nach Abschluss der Bestellung wird der Grundbuchauszug innerhalb weniger Minuten per E-Mail an Sie versendet. Sie erhalten zusätzlich eine Rechnung mit den Zahlungsinformationen.",
  },
];

export default function Ablauf() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Ablauf
                </h1>
                <p className="text-lg text-muted-foreground">
                  In wenigen Schritten zu Ihrem Grundbuchauszug. Der gesamte Prozess ist einfach und übersichtlich gestaltet.
                </p>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <img src={iconMap} alt="Katasterplan" className="w-32 h-32 object-contain" />
              </div>
            </div>

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
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-info p-6 rounded border text-center">
              <p className="text-foreground mb-4">
                Bereit, Ihren Grundbuchauszug anzufordern?
              </p>
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
