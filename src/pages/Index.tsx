import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Shield, ChevronRight, Download, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-austria.jpg";
import iconDocument from "@/assets/icon-document.png";
import iconMap from "@/assets/icon-map.png";

const benefits = [
  {
    icon: Download,
    title: "Sofort-Download als PDF",
    description: "Der Grundbuchauszug wird sofort im Grundbuch abgefragt und als PDF zur Verfügung gestellt.",
  },
  {
    icon: Mail,
    title: "Versand per E-Mail",
    description: "Zusätzlich erhalten Sie das Dokument per E-Mail an Ihre angegebene Adresse.",
  },
  {
    icon: Shield,
    title: "Amtlich signiertes Dokument",
    description: "Jeder Auszug enthält eine elektronische Signatur der Justiz zur Bestätigung der Echtheit.",
  },
];

const processSteps = [
  {
    number: "1",
    title: "Produktauswahl",
    description: "Gewünschtes Produkt auswählen.",
  },
  {
    number: "2",
    title: "Grundbuchdaten",
    description: "Tragen Sie die Daten der Immobilie ein.",
  },
  {
    number: "3",
    title: "Zahlvorgang",
    description: "Überprüfen und sicher bezahlen.",
  },
  {
    number: "4",
    title: "PDF-Download",
    description: "Herunterladen und per Mail erhalten.",
  },
];

const grundbuchInfo = [
  {
    title: "Öffentliches Register",
    description: "Das Grundbuch ist ein öffentlich geführtes Register und für jeden einsehbar. Jeder ist berechtigt einen Grundbuchauszug online anzufordern.",
  },
  {
    title: "Liegenschaftsinformationen",
    description: "In einem Grundbuchauszug werden Informationen über eine Liegenschaft gesammelt: Grundstücksgröße, Nutzungsart, Eigentümer und verbundene Rechte und Pflichten.",
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
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Grundbuchauszug <span className="text-primary">ONLINE</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. Der Grundbuchauszug wird sofort im Grundbuch abgefragt und als signiertes PDF zur Verfügung gestellt.
            </p>
            
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Sofort-Download als PDF & Versand per Mail</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Amtlich signierter Grundbuchauszug</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/anfordern" className="hover:no-underline">
                  Grundbuchauszug anfordern
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-background/80">
                <Link to="/grundbuchauszug" className="hover:no-underline">Mehr erfahren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Price Banner */}
      <section className="bg-info border-y">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={iconDocument} alt="" className="w-14 h-14 object-contain" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Aktueller Grundbuchauszug
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vollständiger Auszug aus dem österreichischen Grundbuch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-primary">19,90 €</span>
              <Button asChild>
                <Link to="/anfordern" className="hover:no-underline">Jetzt bestellen</Link>
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
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            Bestellablauf
          </h2>
          <p className="text-muted-foreground text-center mb-12">ohne Registrierung</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step) => (
              <div key={step.number} className="bg-background p-6 rounded border text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
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

      {/* What is Grundbuch Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Was ist ein Grundbuchauszug?
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                In einem Grundbuchauszug werden Informationen über eine Liegenschaft bzw. eine Immobilie gesammelt. Hier ist ersichtlich wie groß das Grundstück ist und wie dieses genutzt wird.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Ebenso sind hier Informationen zum Eigentümer wie Name, Adresse und Geburtsdatum ersichtlich und seit wann dieser Eigentümer der Immobilie ist. Außerdem wird im Grundbuchauszug festgehalten, ob und welche Pflichten und Rechte mit der Liegenschaft verbunden sind.
              </p>
              <div className="space-y-4">
                {grundbuchInfo.map((info) => (
                  <div key={info.title} className="bg-info p-4 rounded border-l-4 border-primary">
                    <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <img src={iconMap} alt="Katasterplan" className="w-64 h-64 object-contain opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="bg-info py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            Aufbau eines Grundbuchauszugs
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background p-6 rounded border-t-4 border-primary">
              <h3 className="text-lg font-bold text-primary mb-2">A-Blatt</h3>
              <h4 className="font-semibold text-foreground mb-3">Gutsbestandsblatt</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Das A-Blatt besteht aus der Abteilung A-1 und A-2. Darin befinden sich alle Grundstücke des Grundbuchkörpers mit Adresse, Grundstücksnummer und Benützungsart.
              </p>
              <p className="text-sm text-muted-foreground">
                Abteilung A-2 enthält die mit der Liegenschaft verbundenen Rechte sowie Zu- und Abschreibungen.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded border-t-4 border-secondary">
              <h3 className="text-lg font-bold text-secondary mb-2">B-Blatt</h3>
              <h4 className="font-semibold text-foreground mb-3">Eigentumsblatt</h4>
              <p className="text-sm text-muted-foreground">
                Das B-Blatt gibt Auskunft über die Eigentumsverhältnisse der Liegenschaft. Hier wird ersichtlich, wer der Eigentümer ist. Bei mehreren Eigentümern ist der jeweilige Eigentumsanteil eingetragen. Weiters kann festgestellt werden, wann und durch welche Urkunde das Eigentumsrecht erworben wurde.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded border-t-4 border-muted-foreground">
              <h3 className="text-lg font-bold text-muted-foreground mb-2">C-Blatt</h3>
              <h4 className="font-semibold text-foreground mb-3">Lastenblatt</h4>
              <p className="text-sm text-muted-foreground">
                Das C-Blatt enthält die mit der Liegenschaft verbundenen Belastungen: Hypotheken, Dienstbarkeiten, Vor- und Wiederverkaufsrechte sowie Miet- und Pachtverträge. Bei Eigentumsübertragung gehen die Lasten auf den neuen Eigentümer über.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/lexikon" className="hover:no-underline">
                Zum Grundbuch-Lexikon
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
            Mit Eingabe der Katastralgemeinde in Verbindung mit Grundstücksnummer oder Einlagezahl können Sie sofort einen Grundbuchauszug als PDF erhalten.
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
