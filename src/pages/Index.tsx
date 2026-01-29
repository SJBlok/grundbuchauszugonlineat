import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Shield, ChevronRight, Download, CheckCircle, Clock, BadgeCheck, ArrowRight, Building, Users, Landmark } from "lucide-react";
import heroImage from "@/assets/hero-austria.jpg";
import iconMap from "@/assets/icon-map.png";

const benefits = [
  {
    icon: Download,
    title: "Sofort-Download als PDF",
    description: "Der Grundbuchauszug wird sofort im Grundbuch abgefragt und steht innerhalb von Minuten als PDF zur Verfügung.",
  },
  {
    icon: Mail,
    title: "Versand per E-Mail",
    description: "Zusätzlich erhalten Sie das Dokument automatisch per E-Mail an Ihre angegebene Adresse zugestellt.",
  },
  {
    icon: Shield,
    title: "Amtlich signiert",
    description: "Jeder Auszug enthält eine elektronische Signatur der Justiz zur Bestätigung der Echtheit und Aktualität.",
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
    description: "Daten der Immobilie eintragen.",
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

const useCases = [
  {
    icon: Building,
    title: "Immobilienkauf",
    description: "Vor dem Kauf einer Immobilie die Eigentumsverhältnisse und Belastungen prüfen.",
  },
  {
    icon: Landmark,
    title: "Finanzierung",
    description: "Für Banken und Kreditgeber als Nachweis der Grundstücksverhältnisse.",
  },
  {
    icon: Users,
    title: "Erbschaft",
    description: "Klärung von Eigentumsverhältnissen bei Erbschaftsangelegenheiten.",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Österreichische Landschaft" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto py-24 lg:py-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <BadgeCheck className="h-4 w-4" />
              <span>Österreichisches Grundbuch</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-foreground mb-6 leading-[1.1] font-serif animate-fade-in-up">
              Grundbuchauszug{" "}
              <span className="text-primary">Online</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. 
              Sofort als signiertes PDF verfügbar.
            </p>
            
            {/* Feature list */}
            <div className="flex flex-col gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {[
                "Sofort-Download als PDF & Versand per Mail",
                "Amtlich signierter Grundbuchauszug",
                "Keine Registrierung erforderlich",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-foreground/80">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[15px]">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="xl" className="w-full sm:w-auto">
                <Link to="/anfordern" className="hover:no-underline">
                  Grundbuchauszug anfordern
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white/90 backdrop-blur-sm">
                <Link to="/grundbuchauszug" className="hover:no-underline">Mehr erfahren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Price Banner */}
      <section className="bg-card border-y border-border/50 shadow-md relative overflow-hidden">
        {/* Subtle decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-secondary/[0.02]" />
        
        <div className="container mx-auto py-10 lg:py-12 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-center lg:text-left">
              <div className="feature-icon feature-icon-lg shrink-0 hidden sm:flex">
                <FileText className="h-9 w-9 lg:h-10 lg:w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-[28px] font-bold text-foreground font-serif leading-tight">
                  Aktueller Grundbuchauszug
                </h2>
                <p className="text-muted-foreground mt-1.5 text-[15px]">
                  Vollständiger Auszug aus dem österreichischen Grundbuch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 w-full lg:w-auto">
              <div className="text-center lg:text-right">
                <span className="text-4xl lg:text-[42px] font-bold text-foreground font-serif">€19,90</span>
                <p className="text-sm text-muted-foreground mt-0.5">inkl. USt.</p>
              </div>
              <Button asChild size="lg" className="flex-1 lg:flex-none h-14 px-10 text-base">
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
      <section className="section-spacing">
        <div className="container mx-auto">
          <div className="text-center mb-16 lg:mb-20">
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
                className="text-center group"
              >
                <div className="mb-8">
                  <div className="feature-icon feature-icon-lg mx-auto transition-all duration-350 group-hover:scale-110 group-hover:shadow-lg">
                    <benefit.icon className="h-8 w-8 lg:h-9 lg:w-9 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 font-serif">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-muted/40 section-spacing-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground font-serif mb-3">
              Wofür braucht man einen Grundbuchauszug?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {useCases.map((useCase) => (
              <div 
                key={useCase.title} 
                className="bg-card rounded p-8 shadow-sm hover:shadow-hover hover:-translate-y-1 transition-all duration-350"
              >
                <div className="feature-icon mb-5">
                  <useCase.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 font-serif">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-spacing bg-gradient-warm">
        <div className="container mx-auto">
          <div className="text-center mb-16 lg:mb-20">
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
                className="bg-card rounded p-7 lg:p-8 shadow-md text-center hover:shadow-hover hover:-translate-y-1 transition-all duration-350"
              >
                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl lg:text-2xl mx-auto mb-5 font-serif shadow-sm">
                  {step.number}
                </div>
                <h3 className="font-bold text-foreground mb-2 font-serif">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Grundbuch Section */}
      <section className="section-spacing">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-secondary/10 text-secondary text-sm font-medium mb-6">
                Wissenswertes
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-6 leading-tight">
                Was ist ein Grundbuchauszug?
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                In einem Grundbuchauszug werden alle wichtigen Informationen über eine Liegenschaft dokumentiert: 
                Grundstücksgröße, Nutzungsart, Eigentümer und verbundene Rechte und Pflichten.
              </p>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Das Grundbuch ist ein öffentlich geführtes Register. Jede Person ist berechtigt, 
                einen Grundbuchauszug online anzufordern – ohne Begründung.
              </p>
              
              <div className="space-y-4">
                <div className="info-card">
                  <h3 className="font-bold text-foreground mb-1.5 font-serif">Öffentliches Register</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    Das Grundbuch ist für jeden einsehbar. Sie benötigen keine Vollmacht oder berechtigtes Interesse.
                  </p>
                </div>
                <div className="info-card">
                  <h3 className="font-bold text-foreground mb-1.5 font-serif">Amtliche Quelle</h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    Die Daten stammen direkt aus dem österreichischen Grundbuch und sind stets aktuell.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center order-first lg:order-last">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-secondary/8 rounded rotate-3 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-tr from-secondary/6 to-primary/6 rounded -rotate-2 scale-102" />
                <img 
                  src={iconMap} 
                  alt="Katasterplan" 
                  className="relative w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-lg" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="bg-muted/40 section-spacing">
        <div className="container mx-auto">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-4">
              Aufbau eines Grundbuchauszugs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Der Grundbuchauszug besteht aus drei Blättern mit unterschiedlichen Informationen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                letter: "A",
                title: "Gutsbestandsblatt",
                color: "primary",
                description: "Das A-Blatt enthält alle Grundstücke des Grundbuchkörpers mit Adresse, Grundstücksnummer und Benützungsart. Abteilung A-2 enthält verbundene Rechte sowie Zu- und Abschreibungen."
              },
              {
                letter: "B",
                title: "Eigentumsblatt",
                color: "secondary",
                description: "Das B-Blatt gibt Auskunft über die Eigentumsverhältnisse. Bei mehreren Eigentümern ist der jeweilige Eigentumsanteil eingetragen sowie wann und durch welche Urkunde das Eigentum erworben wurde."
              },
              {
                letter: "C",
                title: "Lastenblatt",
                color: "muted-foreground",
                description: "Das C-Blatt enthält alle Belastungen: Hypotheken, Dienstbarkeiten, Vor- und Wiederverkaufsrechte sowie Miet- und Pachtverträge. Diese gehen bei Eigentumsübertragung auf den neuen Eigentümer über."
              }
            ].map((sheet) => (
              <div key={sheet.letter} className="bg-card rounded p-8 lg:p-10 shadow-md hover:shadow-hover hover:-translate-y-1 transition-all duration-350 relative overflow-hidden">
                {/* Large decorative letter */}
                <div className="absolute top-4 right-4 text-7xl font-bold text-muted/20 font-serif leading-none">
                  {sheet.letter}
                </div>
                
                <div className={`h-12 w-12 rounded ${sheet.color === 'primary' ? 'bg-primary' : sheet.color === 'secondary' ? 'bg-secondary' : 'bg-muted-foreground'} text-white flex items-center justify-center font-bold text-xl mb-5 font-serif shadow-sm`}>
                  {sheet.letter}
                </div>
                <h3 className={`text-xl font-bold mb-2 font-serif ${sheet.color === 'primary' ? 'text-primary' : sheet.color === 'secondary' ? 'text-secondary' : 'text-muted-foreground'}`}>
                  {sheet.letter}-Blatt
                </h3>
                <h4 className="font-semibold text-foreground mb-4">{sheet.title}</h4>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {sheet.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-14">
            <Button asChild variant="outline" size="lg" className="bg-card">
              <Link to="/lexikon" className="hover:no-underline">
                Zum Grundbuch-Lexikon
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-mesh">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground font-serif mb-6 leading-tight">
              Grundbuchauszug jetzt anfordern
            </h2>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Mit Eingabe der Katastralgemeinde in Verbindung mit Grundstücksnummer oder Einlagezahl 
              können Sie sofort einen Grundbuchauszug als PDF erhalten.
            </p>
            <Button asChild size="xl" className="w-full sm:w-auto shadow-lg">
              <Link to="/anfordern" className="hover:no-underline">
                Jetzt anfordern – €19,90
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span>Sofortige Zustellung</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span>SSL-verschlüsselt</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <span>Amtlich beglaubigt</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
