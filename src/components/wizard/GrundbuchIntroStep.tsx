import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  ArrowRight,
  Clock,
  Mail,
  Download,
} from "lucide-react";
import grundbuchExample from '@/assets/grundbuch-example-fictitious.jpg';

interface GrundbuchIntroStepProps {
  onContinue: () => void;
}

const usps = [
  { icon: CheckCircle, text: "Aktuelle und vollständige Abfrage aus dem Grundbuch" },
  { icon: Clock, text: "In der Regel binnen 1 Stunde per E-Mail" },
  { icon: Download, text: "Download als PDF & Versand per E-Mail" },
  { icon: Mail, text: "Keine Registrierung erforderlich" },
];

export function GrundbuchIntroStep({ onContinue }: GrundbuchIntroStepProps) {
  return (
    <div className="animate-fade-in pb-24 md:pb-0">
      {/* Main Card */}
      <div className="bg-card rounded shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 lg:px-10 lg:py-10 border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">Offizieller Dokumentenservice</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-serif leading-tight">
            Grundbuchauszug <span className="text-primary">Online</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern. 
            Aktuell und vollständig aus dem österreichischen Grundbuch.
          </p>
        </div>

        {/* Content Grid - Document Structure & Example */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left: Document Structure Info */}
          <div className="p-6 lg:p-10 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-5">
              Aufbau des Grundbuchauszugs
            </h3>
            <div className="space-y-4 flex-1">
              <div className="bg-muted/30 border border-border/50 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 bg-primary/10 text-primary rounded text-xs font-bold flex items-center justify-center">A</span>
                  <p className="font-medium text-foreground text-sm">Gutsbestandsblatt</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Alle Grundstücke mit Adresse, Grundstücksnummer, Fläche und Benützungsart. 
                  Enthält auch verbundene Rechte und öffentlich-rechtliche Beschränkungen.
                </p>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 bg-secondary/20 text-secondary rounded text-xs font-bold flex items-center justify-center">B</span>
                  <p className="font-medium text-foreground text-sm">Eigentumsblatt</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Wer ist Eigentümer, welche Eigentumsanteile bestehen, wann und durch welche Urkunde 
                  wurde das Eigentumsrecht erworben.
                </p>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-6 w-6 bg-muted text-muted-foreground rounded text-xs font-bold flex items-center justify-center">C</span>
                  <p className="font-medium text-foreground text-sm">Lastenblatt</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Alle Belastungen: Hypotheken, Pfandrechte, Dienstbarkeiten, 
                  Vor- und Wiederverkaufsrechte sowie Miet- und Pachtverträge.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Example Document */}
          <div className="bg-muted/30 p-6 lg:p-10 border-t lg:border-t-0 lg:border-l border-border/40 flex items-center justify-center">
            <div className="w-full max-w-sm">
              {/* Document Preview - Real Image */}
              <div className="bg-white rounded shadow-lg overflow-hidden border border-border/50 transform hover:scale-[1.02] transition-transform duration-300">
                <img 
                  src={grundbuchExample} 
                  alt="Beispiel Grundbuchauszug" 
                  className="w-full h-auto"
                />
              </div>

              {/* Caption */}
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                <span className="inline-flex w-4 h-4 rounded-full bg-muted/80 items-center justify-center text-[9px]">i</span>
                Beispiel eines fiktiven Grundbuchauszugs
              </p>
            </div>
          </div>
        </div>

        {/* USPs Section - Bottom */}
        <div className="border-t border-border/40 p-6 lg:p-10 bg-muted/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {usps.map((usp) => (
              <div key={usp.text} className="flex items-start gap-3">
                <usp.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{usp.text}</span>
              </div>
            ))}
          </div>

          {/* CTA - Hidden on mobile (shown in sticky bar) */}
          <div className="mt-8 hidden md:flex justify-center">
            <Button 
              onClick={onContinue}
              size="lg"
              className="group w-full sm:w-auto"
            >
              Jetzt Grundbuchauszug anfordern
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Button - always rendered, hidden via CSS on desktop */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-inset-bottom z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <Button 
          onClick={onContinue}
          className="w-full h-14 text-sm font-semibold shadow-lg group"
        >
          Jetzt Grundbuchauszug anfordern
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
