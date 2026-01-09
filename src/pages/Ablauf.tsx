import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

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
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ablauf
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              In wenigen Schritten zu Ihrem Grundbuchauszug. Der gesamte Prozess ist einfach und übersichtlich gestaltet.
            </p>

            <div className="space-y-8 mb-12">
              {steps.map((step, index) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-full bg-border ml-6 mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
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

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/anfordern">Jetzt anfordern</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
