import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  ArrowRight,
} from "lucide-react";

interface GrundbuchIntroStepProps {
  onContinue: () => void;
}

const benefits = [
  "Aktuelle und vollständige Abfrage aus dem Grundbuch",
  "Keine Registrierung erforderlich",
  "Download als PDF & Versand per E-Mail",
];

export function GrundbuchIntroStep({ onContinue }: GrundbuchIntroStepProps) {
  return (
    <div className="animate-fade-in">
      {/* Main Card */}
      <div className="bg-card rounded shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 lg:px-10 lg:py-10 border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-serif leading-tight">
            Grundbuchauszug <span className="text-primary">Online</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Ohne Anmeldung einen Grundbuchauszug einer Liegenschaft oder Wohnung online anfordern.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left: Benefits & CTA */}
          <div className="p-6 lg:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Section: Grundbuchauszug */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Grundbuchauszug</h2>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Box */}
              <div className="bg-primary text-primary-foreground rounded p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm">Aktueller Grundbuchauszug</p>
                    <p className="text-2xl font-bold">€ 23,88</p>
                    <p className="text-primary-foreground/70 text-xs mt-0.5">inkl. 20% MwSt.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8">
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

          {/* Right: Example Document */}
          <div className="bg-muted/30 p-6 lg:p-10 border-t lg:border-t-0 lg:border-l border-border/40 flex items-center justify-center">
            <div className="w-full max-w-sm">
              {/* Document Preview */}
              <div className="bg-white rounded shadow-lg overflow-hidden border border-border/50 transform hover:scale-[1.02] transition-transform duration-300">
                {/* Document Header */}
                <div className="bg-white p-4 border-b border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Austrian Eagle Simplified */}
                    <div className="text-zinc-800">
                      <svg width="32" height="32" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50 10c-5 0-9 4-9 9v6c-8 2-14 8-18 16-2-1-5-2-8-2-6 0-10 4-10 10 0 4 2 7 5 9-2 3-3 6-3 10 0 8 6 15 14 17v5c0 5 4 10 10 10h38c6 0 10-5 10-10v-5c8-2 14-9 14-17 0-4-1-7-3-10 3-2 5-5 5-9 0-6-4-10-10-10-3 0-6 1-8 2-4-8-10-14-18-16v-6c0-5-4-9-9-9z"/>
                        <circle cx="50" cy="50" r="8" fill="white"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Republik Österreich</p>
                      <p className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Grundbuch</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-zinc-300 font-serif">GB</div>
                </div>

                {/* Document Title */}
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
                  <p className="text-center text-xs text-zinc-600 font-medium">Auszug aus dem Hauptbuch</p>
                </div>

                {/* Document Content */}
                <div className="p-4 font-mono text-[9px] leading-relaxed text-zinc-700 bg-white">
                  {/* KG Info */}
                  <div className="flex justify-between mb-2">
                    <span>KATASTRALGEMEINDE 01660 Kagran</span>
                    <span>EINLAGEZAHL 3212</span>
                  </div>
                  <div className="mb-3 text-zinc-500">BEZIRKSGERICHT Donaustadt</div>
                  
                  {/* Separator */}
                  <div className="text-zinc-300 mb-2">{'*'.repeat(40)}</div>
                  
                  {/* A1 Section */}
                  <div className="mb-2">
                    <div className="text-zinc-400 mb-1">{'*'.repeat(15)} A1 {'*'.repeat(15)}</div>
                    <div className="grid grid-cols-4 gap-1 text-[8px]">
                      <span>GST-NR</span>
                      <span>NUTZUNG</span>
                      <span>FLÄCHE</span>
                      <span>ADRESSE</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[8px] mt-1">
                      <span>37/2</span>
                      <span>Bauf.</span>
                      <span>2812</span>
                      <span>Wolfgasse 3</span>
                    </div>
                  </div>

                  {/* B Section */}
                  <div className="mb-2">
                    <div className="text-zinc-400 mb-1">{'*'.repeat(15)} B {'*'.repeat(16)}</div>
                    <div className="text-[8px]">
                      <div>ANTEIL: 1/1</div>
                      <div className="mt-1">Franz Huber</div>
                      <div className="text-zinc-500">GEB: 1991-01-01</div>
                      <div className="text-zinc-500">a 711/2023 Kaufvertrag</div>
                    </div>
                  </div>

                  {/* C Section */}
                  <div>
                    <div className="text-zinc-400 mb-1">{'*'.repeat(15)} C {'*'.repeat(16)}</div>
                    <div className="text-[8px]">
                      <div>1 a 729/2023 Pfandurkunde</div>
                      <div className="text-zinc-500 ml-2">PFANDRECHT EUR 70.000,--</div>
                      <div className="text-zinc-500 ml-2">für Oberbank AG</div>
                    </div>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex justify-between text-[8px] text-zinc-400">
                  <span>Grundbuch</span>
                  <span>29.01.2026 10:53:16</span>
                </div>
              </div>

              {/* Caption */}
              <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-muted flex items-center justify-center text-[8px]">i</span>
                Beispielhafte Illustration eines fiktiven Grundbuchauszugs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
