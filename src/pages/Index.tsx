import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Shield, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-austria.jpg";
import iconDocument from "@/assets/icon-document.png";
import iconMap from "@/assets/icon-map.png";

const benefits = [
  {
    icon: FileText,
    title: "Vollständige Grundbuchinformationen",
    description: "A-Blatt, B-Blatt und C-Blatt mit allen Eigentums- und Grundstücksdaten.",
  },
  {
    icon: Mail,
    title: "Zustellung per E-Mail",
    description: "Elektronische Übermittlung innerhalb weniger Minuten.",
  },
  {
    icon: Shield,
    title: "Sichere Datenverarbeitung",
    description: "Ihre Daten werden vertraulich und gemäß DSGVO behandelt.",
  },
];

const processSteps = [
  {
    number: "1",
    title: "Grundstücksdaten eingeben",
    description: "Katastralgemeinde, Grundstücksnummer und Bundesland angeben.",
  },
  {
    number: "2",
    title: "Angaben prüfen",
    description: "Überprüfen Sie Ihre Eingaben und das gewählte Produkt.",
  },
  {
    number: "3",
    title: "Bestellung abschließen",
    description: "Kontaktdaten eingeben und Bestellung bestätigen.",
  },
  {
    number: "4",
    title: "Dokument erhalten",
    description: "Der Grundbuchauszug wird per E-Mail zugestellt.",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section with Image */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Österreichische Landschaft" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Grundbuchauszug online anfordern
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Erhalten Sie vollständige Eigentums- und Grundstücksinformationen aus dem österreichischen Grundbuch – digital und per E-Mail.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/anfordern" className="hover:no-underline">
                  Jetzt anfordern
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-background/80">
                <Link to="/ablauf" className="hover:no-underline">Ablauf anzeigen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="bg-info border-y">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <img src={iconDocument} alt="" className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Aktueller Grundbuchauszug
              </h2>
              <p className="text-muted-foreground">
                Der Grundbuchauszug enthält alle wesentlichen Informationen zu Eigentum, Grundstücksdaten und eingetragenen Belastungen.
              </p>
            </div>
            <div className="md:ml-auto">
              <span className="text-2xl font-bold text-primary">19,90 €</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-muted py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                So funktioniert es
              </h2>
              <p className="text-muted-foreground mb-6">
                In vier einfachen Schritten zu Ihrem Grundbuchauszug.
              </p>
              <img src={iconMap} alt="Katasterplan" className="w-48 h-48 object-contain opacity-80" />
            </div>
            <div className="md:w-2/3">
              <div className="grid sm:grid-cols-2 gap-4">
                {processSteps.map((step) => (
                  <div key={step.number} className="bg-background p-6 rounded border">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                        {step.number}
                      </span>
                      <h3 className="font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-11">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Grundbuchauszug anfordern
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Starten Sie jetzt Ihre Anfrage und erhalten Sie den Grundbuchauszug innerhalb weniger Minuten per E-Mail.
          </p>
          <Button asChild size="lg">
            <Link to="/anfordern" className="hover:no-underline">
              Jetzt anfordern
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
