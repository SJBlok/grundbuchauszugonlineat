import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  FileText, 
  Shield, 
  Download, 
  Clock, 
  ArrowRight,
  Building2
} from "lucide-react";
import grundbuchBeispiel from "@/assets/grundbuchauszug-beispiel.png";

interface GrundbuchIntroStepProps {
  onContinue: () => void;
}

const features = [
  {
    icon: FileText,
    title: "Vollständiger Auszug",
    description: "A-, B- und C-Blatt mit allen Grundstücks- und Eigentumsdaten"
  },
  {
    icon: Shield,
    title: "Amtlich signiert",
    description: "Elektronisch signiertes PDF-Dokument aus dem Grundbuch"
  },
  {
    icon: Clock,
    title: "Schnelle Lieferung",
    description: "In der Regel innerhalb von 1 Stunde per E-Mail"
  },
  {
    icon: Download,
    title: "Sofort-Download",
    description: "Direkter Download-Link im Posteingang"
  },
];

const includedItems = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Aktuelle Daten aus dem österreichischen Grundbuch",
];

export function GrundbuchIntroStep({ onContinue }: GrundbuchIntroStepProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <Building2 className="h-4 w-4" />
          Offizieller Dokumentenservice
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight font-serif leading-tight">
          Grundbuchauszug <span className="text-primary">Online</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. 
          Aktuell und vollständig aus dem österreichischen Grundbuch.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left: Info & Features */}
        <div className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-card border border-border/50 rounded-lg p-4 space-y-2"
              >
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* What's Included */}
          <div className="bg-card border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Im Grundbuchauszug enthalten
            </h3>
            <ul className="space-y-3">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price & CTA */}
          <div className="bg-primary text-primary-foreground rounded-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-primary-foreground/80 text-sm">Aktueller Grundbuchauszug</p>
                <p className="text-3xl font-bold">€ 23,88</p>
                <p className="text-primary-foreground/70 text-xs mt-1">inkl. 20% MwSt.</p>
              </div>
              <Button 
                onClick={onContinue}
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto group"
              >
                Jetzt anfordern
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Example Grundbuch */}
        <div className="space-y-4">
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-lg">
            {/* Document Header */}
            <div className="bg-muted/30 border-b border-border/50 p-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">GB</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Republik Österreich</p>
                  <p className="text-sm font-semibold text-foreground">Grundbuch</p>
                </div>
              </div>
            </div>

            {/* Example Document Preview */}
            <div className="relative">
              <img 
                src={grundbuchBeispiel}
                alt="Beispiel Grundbuchauszug"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>

            {/* Document Footer */}
            <div className="p-4 bg-muted/20 border-t border-border/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Beispielhafte Illustration
                </span>
                <span>Elektronisch signiert</span>
              </div>
            </div>
          </div>

          {/* Document Structure Info */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Aufbau des Grundbuchauszugs</h4>
            <div className="space-y-2 text-xs">
              <div className="flex gap-3">
                <span className="font-medium text-primary w-16 shrink-0">A-Blatt</span>
                <span className="text-muted-foreground">Gutsbestandsblatt – alle Grundstücke mit Adresse und Fläche</span>
              </div>
              <div className="flex gap-3">
                <span className="font-medium text-primary w-16 shrink-0">B-Blatt</span>
                <span className="text-muted-foreground">Eigentumsblatt – Eigentümer und Eigentumsanteile</span>
              </div>
              <div className="flex gap-3">
                <span className="font-medium text-primary w-16 shrink-0">C-Blatt</span>
                <span className="text-muted-foreground">Lastenblatt – Hypotheken, Pfandrechte, Dienstbarkeiten</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Mobile */}
      <div className="lg:hidden">
        <Button 
          onClick={onContinue}
          size="lg"
          className="w-full group"
        >
          Grundbuchauszug anfordern
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
