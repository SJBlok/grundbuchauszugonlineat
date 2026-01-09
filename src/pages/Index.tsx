import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Shield, Clock } from "lucide-react";

const benefits = [
  {
    icon: FileText,
    title: "Vollständige Grundbuchinformationen",
    description: "Alle Eigentums- und Grundstücksdaten aus dem österreichischen Grundbuch.",
  },
  {
    icon: Clock,
    title: "Zustellung innerhalb weniger Minuten",
    description: "Schnelle Bearbeitung und Versand per E-Mail.",
  },
  {
    icon: Shield,
    title: "Sichere Datenverarbeitung",
    description: "Ihre Daten werden vertraulich und sicher behandelt.",
  },
];

const processSteps = [
  {
    number: "1",
    title: "Grundstücksdaten eingeben",
    description: "Geben Sie die Katastralgemeinde und Grundstücksnummer ein.",
  },
  {
    number: "2",
    title: "Produkt auswählen und Angaben prüfen",
    description: "Überprüfen Sie Ihre Angaben und wählen Sie das gewünschte Produkt.",
  },
  {
    number: "3",
    title: "Bestellung abschließen",
    description: "Geben Sie Ihre Kontaktdaten ein und schließen Sie die Bestellung ab.",
  },
  {
    number: "4",
    title: "Versand per E-Mail",
    description: "Der Grundbuchauszug wird innerhalb weniger Minuten per E-Mail versendet.",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Aktuellen Grundbuchauszug online anfordern
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Erhalten Sie vollständige Eigentums- und Grundstücksinformationen aus dem österreichischen Grundbuch – digital und per E-Mail.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/anfordern">Jetzt anfordern</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/ablauf">Ablauf anzeigen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-info py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            So funktioniert es
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div key={step.number} className="bg-background p-6 rounded-lg">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Grundbuchauszug jetzt anfordern
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Starten Sie jetzt Ihre Anfrage und erhalten Sie den Grundbuchauszug innerhalb weniger Minuten per E-Mail.
          </p>
          <Button asChild size="lg">
            <Link to="/anfordern">Jetzt anfordern</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
