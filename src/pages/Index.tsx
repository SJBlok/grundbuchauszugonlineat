import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Shield, ChevronRight, Download, CheckCircle, Clock, BadgeCheck, ArrowRight } from "lucide-react";
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
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Österreichische Landschaft" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Österreichisches Grundbuch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight font-serif">
              Grundbuchauszug{" "}
              <span className="text-primary">Online</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. 
              Sofort als signiertes PDF verfügbar.
            </p>
            
            <div className="flex flex-col gap-3 mb-10">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Sofort-Download als PDF & Versand per Mail</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Amtlich signierter Grundbuchauszug</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span>Keine Registrierung erforderlich</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button asChild size="xl" className="w-full sm:w-auto">
                <Link to="/anfordern" className="hover:no-underline">
                  Grundbuchauszug anfordern
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm">
                <Link to="/grundbuchauszug" className="hover:no-underline">Mehr erfahren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Price Banner */}
      <section className="bg-white border-y border-border/50 shadow-premium-sm">
        <div className="container mx-auto px-4 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center lg:text-left">
              <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground font-serif">
                  Aktueller Grundbuchauszug
                </h2>
                <p className="text-muted-foreground mt-1">
                  Vollständiger Auszug aus dem österreichischen Grundbuch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="text-center lg:text-right">
                <span className="text-3xl lg:text-4xl font-bold text-foreground">€19,90</span>
                <p className="text-sm text-muted-foreground">inkl. USt.</p>
              </div>
              <Button asChild size="lg" className="flex-1 lg:flex-none h-14 px-8 text-base">
                <Link to="/anfordern" className="hover:no-underline">
                  Jetzt bestellen
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-4">
              Warum bei uns bestellen?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Schnell, sicher und unkompliziert zu Ihrem offiziellen Grundbuchauszug
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title} 
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6">
                  <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                    <benefit.icon className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-serif">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-muted/50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-4">
              Bestellablauf
            </h2>
            <p className="text-lg text-muted-foreground">
              In nur 4 Schritten zum Grundbuchauszug – ohne Registrierung
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {processSteps.map((step, index) => (
              <div 
                key={step.number} 
                className="bg-white rounded-xl p-6 lg:p-8 shadow-premium-sm text-center hover:shadow-premium-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl lg:text-2xl mx-auto mb-5 font-serif">
                  {step.number}
                </div>
                <h3 className="font-bold text-foreground mb-2 font-serif">
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
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                Wissenswertes
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-6">
                Was ist ein Grundbuchauszug?
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                In einem Grundbuchauszug werden Informationen über eine Liegenschaft bzw. eine Immobilie gesammelt. 
                Hier ist ersichtlich wie groß das Grundstück ist und wie dieses genutzt wird.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Ebenso sind hier Informationen zum Eigentümer wie Name, Adresse und Geburtsdatum ersichtlich 
                und seit wann dieser Eigentümer der Immobilie ist.
              </p>
              
              <div className="space-y-4">
                {grundbuchInfo.map((info) => (
                  <div key={info.title} className="bg-info rounded-xl p-5 border-l-4 border-primary">
                    <h3 className="font-bold text-foreground mb-2">{info.title}</h3>
                    <p className="text-muted-foreground">{info.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center order-first lg:order-last">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl rotate-6" />
                <img 
                  src={iconMap} 
                  alt="Katasterplan" 
                  className="relative w-64 h-64 lg:w-80 lg:h-80 object-contain" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-4">
              Aufbau eines Grundbuchauszugs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Der Grundbuchauszug besteht aus drei Blättern mit unterschiedlichen Informationen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-premium-sm border-t-4 border-primary hover:shadow-premium-md transition-all duration-300">
              <h3 className="text-xl font-bold text-primary mb-2 font-serif">A-Blatt</h3>
              <h4 className="font-semibold text-foreground mb-4">Gutsbestandsblatt</h4>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Das A-Blatt besteht aus der Abteilung A-1 und A-2. Darin befinden sich alle Grundstücke 
                des Grundbuchkörpers mit Adresse, Grundstücksnummer und Benützungsart.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Abteilung A-2 enthält die mit der Liegenschaft verbundenen Rechte sowie Zu- und Abschreibungen.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-premium-sm border-t-4 border-secondary hover:shadow-premium-md transition-all duration-300">
              <h3 className="text-xl font-bold text-secondary mb-2 font-serif">B-Blatt</h3>
              <h4 className="font-semibold text-foreground mb-4">Eigentumsblatt</h4>
              <p className="text-muted-foreground leading-relaxed">
                Das B-Blatt gibt Auskunft über die Eigentumsverhältnisse der Liegenschaft. 
                Hier wird ersichtlich, wer der Eigentümer ist. Bei mehreren Eigentümern ist der jeweilige 
                Eigentumsanteil eingetragen. Weiters kann festgestellt werden, wann und durch welche 
                Urkunde das Eigentumsrecht erworben wurde.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-premium-sm border-t-4 border-muted-foreground hover:shadow-premium-md transition-all duration-300">
              <h3 className="text-xl font-bold text-muted-foreground mb-2 font-serif">C-Blatt</h3>
              <h4 className="font-semibold text-foreground mb-4">Lastenblatt</h4>
              <p className="text-muted-foreground leading-relaxed">
                Das C-Blatt enthält die mit der Liegenschaft verbundenen Belastungen: Hypotheken, 
                Dienstbarkeiten, Vor- und Wiederverkaufsrechte sowie Miet- und Pachtverträge. 
                Bei Eigentumsübertragung gehen die Lasten auf den neuen Eigentümer über.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="bg-white">
              <Link to="/lexikon" className="hover:no-underline">
                Zum Grundbuch-Lexikon
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-6">
              Grundbuchauszug jetzt anfordern
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Mit Eingabe der Katastralgemeinde in Verbindung mit Grundstücksnummer oder Einlagezahl 
              können Sie sofort einen Grundbuchauszug als PDF erhalten.
            </p>
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link to="/anfordern" className="hover:no-underline">
                Jetzt anfordern – €19,90
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Sofortige Zustellung</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>SSL-verschlüsselt</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <span>Amtlich beglaubigt</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
