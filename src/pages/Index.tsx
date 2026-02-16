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
  { number: "1", title: "Produktauswahl", description: "Gewünschtes Produkt auswählen." },
  { number: "2", title: "Grundbuchdaten", description: "Daten der Immobilie eintragen." },
  { number: "3", title: "Zahlvorgang", description: "Überprüfen und sicher bezahlen." },
  { number: "4", title: "PDF-Download", description: "Herunterladen und per Mail erhalten." },
];

const useCases = [
  { icon: Building, title: "Immobilienkauf", description: "Vor dem Kauf einer Immobilie die Eigentumsverhältnisse und Belastungen prüfen." },
  { icon: Landmark, title: "Finanzierung", description: "Für Banken und Kreditgeber als Nachweis der Grundstücksverhältnisse." },
  { icon: Users, title: "Erbschaft", description: "Klärung von Eigentumsverhältnissen bei Erbschaftsangelegenheiten." },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section - clean institutional style */}
      <section className="relative min-h-[560px] lg:min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Österreichische Landschaft" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,20%,16%)] via-[hsl(220,20%,16%)/0.92] to-[hsl(220,20%,16%)/0.6]" />
        </div>
        
        <div className="relative z-10 container mx-auto py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/10 text-white/90 text-xs font-semibold mb-5 backdrop-blur-sm border border-white/10">
              <BadgeCheck className="h-3.5 w-3.5" />
              <span>Österreichisches Grundbuch</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white mb-5 leading-[1.15]">
              Grundbuchauszug Online
            </h1>

            <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
              Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. 
              Sofort als signiertes PDF verfügbar.
            </p>
            
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Sofort-Download als PDF & Versand per Mail",
                "Amtlich signierter Grundbuchauszug",
                "Keine Registrierung erforderlich",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2.5 text-white/80">
                  <CheckCircle className="h-4 w-4 text-white/60 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Button asChild size="xl" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <Link to="/anfordern" className="hover:no-underline text-white">
                  Grundbuchauszug anfordern
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <Link to="/grundbuchauszug" className="hover:no-underline">Mehr erfahren</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Price Banner - clean, institutional */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center lg:text-left">
              <div className="h-12 w-12 rounded bg-primary/8 flex items-center justify-center shrink-0 hidden sm:flex">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">
                  Aktueller Grundbuchauszug
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Vollständiger Auszug aus dem österreichischen Grundbuch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="text-center lg:text-right">
                <span className="text-3xl lg:text-4xl font-bold text-foreground">€28,90</span>
                <p className="text-xs text-muted-foreground mt-0.5">inkl. USt.</p>
              </div>
              <Button asChild size="lg" className="flex-1 lg:flex-none">
                <Link to="/anfordern" className="hover:no-underline">
                  Jetzt bestellen
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Warum bei uns bestellen?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Schnell, sicher und unkompliziert zu Ihrem offiziellen Grundbuchauszug
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="mb-6">
                  <div className="h-14 w-14 rounded bg-primary/8 flex items-center justify-center mx-auto">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-muted/50 py-14 lg:py-18">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-[28px] font-bold text-foreground mb-2">
              Wofür braucht man einen Grundbuchauszug?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="bg-card rounded border border-border p-6 hover:shadow-md transition-shadow duration-200">
                <div className="h-10 w-10 rounded bg-primary/8 flex items-center justify-center mb-4">
                  <useCase.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Bestellablauf
            </h2>
            <p className="text-muted-foreground">
              In nur 4 Schritten zum Grundbuchauszug – ohne Registrierung
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {processSteps.map((step) => (
              <div key={step.number} className="bg-card border border-border rounded p-5 lg:p-6 text-center">
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Grundbuch Section */}
      <section className="bg-muted/50 py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-secondary/8 text-secondary text-xs font-semibold mb-4">
                Wissenswertes
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-5 leading-tight">
                Was ist ein Grundbuchauszug?
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                In einem Grundbuchauszug werden alle wichtigen Informationen über eine Liegenschaft dokumentiert: 
                Grundstücksgröße, Nutzungsart, Eigentümer und verbundene Rechte und Pflichten.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Das Grundbuch ist ein öffentlich geführtes Register. Jede Person ist berechtigt, 
                einen Grundbuchauszug online anzufordern – ohne Begründung.
              </p>
              
              <div className="space-y-3">
                <div className="bg-card border border-border rounded p-5 border-l-3 border-l-primary">
                  <h3 className="font-bold text-foreground text-sm mb-1">Öffentliches Register</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Das Grundbuch ist für jeden einsehbar. Sie benötigen keine Vollmacht oder berechtigtes Interesse.
                  </p>
                </div>
                <div className="bg-card border border-border rounded p-5 border-l-3 border-l-secondary">
                  <h3 className="font-bold text-foreground text-sm mb-1">Amtliche Quelle</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Die Daten stammen direkt aus dem österreichischen Grundbuch und sind stets aktuell.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center order-first lg:order-last">
              <img 
                src={iconMap} 
                alt="Katasterplan" 
                className="w-56 h-56 lg:w-72 lg:h-72 object-contain opacity-80" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Aufbau eines Grundbuchauszugs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Der Grundbuchauszug besteht aus drei Blättern mit unterschiedlichen Informationen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                letter: "A",
                title: "Gutsbestandsblatt",
                description: "Das A-Blatt enthält alle Grundstücke des Grundbuchkörpers mit Adresse, Grundstücksnummer und Benützungsart. Abteilung A-2 enthält verbundene Rechte sowie Zu- und Abschreibungen."
              },
              {
                letter: "B",
                title: "Eigentumsblatt",
                description: "Das B-Blatt gibt Auskunft über die Eigentumsverhältnisse. Bei mehreren Eigentümern ist der jeweilige Eigentumsanteil eingetragen sowie wann und durch welche Urkunde das Eigentum erworben wurde."
              },
              {
                letter: "C",
                title: "Lastenblatt",
                description: "Das C-Blatt enthält alle Belastungen: Hypotheken, Dienstbarkeiten, Vor- und Wiederverkaufsrechte sowie Miet- und Pachtverträge. Diese gehen bei Eigentumsübertragung auf den neuen Eigentümer über."
              }
            ].map((sheet) => (
              <div key={sheet.letter} className="bg-card border border-border rounded p-6 lg:p-8 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-6xl font-bold text-muted/15 leading-none">
                  {sheet.letter}
                </div>
                
                <div className="h-10 w-10 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-base mb-4">
                  {sheet.letter}
                </div>
                <h3 className="text-base font-bold text-primary mb-1">
                  {sheet.letter}-Blatt
                </h3>
                <h4 className="font-semibold text-foreground text-sm mb-3">{sheet.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {sheet.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg">
              <Link to="/grundbuchauszug" className="hover:no-underline">
                Mehr zum Grundbuchauszug
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-14 lg:py-18">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">
              Grundbuchauszug jetzt anfordern
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Mit Eingabe der Katastralgemeinde in Verbindung mit Grundstücksnummer oder Einlagezahl 
              können Sie sofort einen Grundbuchauszug als PDF erhalten.
            </p>
            <Button asChild size="xl" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Link to="/anfordern" className="hover:no-underline text-white">
                Jetzt anfordern – €28,90
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Sofortige Zustellung</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>SSL-verschlüsselt</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                <span>Amtlich beglaubigt</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
