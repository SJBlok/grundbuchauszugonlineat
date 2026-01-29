import { Link } from "react-router-dom";
import { Mail, Building2, Shield, Clock, FileCheck } from "lucide-react";

const footerLinks = [
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
  { label: "Widerrufsbelehrung", href: "/widerruf" },
  { label: "Impressum", href: "/impressum" },
];

const serviceLinks = [
  { label: "Grundbuchauszug anfordern", href: "/anfordern" },
  { label: "Ablauf & Lieferung", href: "/ablauf" },
  { label: "Preise", href: "/preise" },
  { label: "Häufige Fragen", href: "/faq" },
];

export function Footer() {
  return (
    <footer className="bg-header text-header-foreground mt-auto">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary to-primary/70" />
      
      {/* Trust bar */}
      <div className="border-b border-header-foreground/10">
        <div className="container mx-auto py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-header-foreground/70">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Sofortige Zustellung</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary" />
              <span>Amtlich beglaubigt</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-16 lg:py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3.5 mb-6">
                {/* Austrian flag colors */}
                <div className="flex items-center gap-0.5">
                  <div className="w-1.5 h-8 bg-[hsl(0,65%,48%)] rounded-sm" />
                  <div className="w-1.5 h-8 bg-header-foreground rounded-sm" />
                  <div className="w-1.5 h-8 bg-[hsl(0,65%,48%)] rounded-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg font-serif">GrundbuchauszugOnline</span>
                  <span className="text-[13px] text-header-foreground/60">Ihr Grundbuchservice für Österreich</span>
                </div>
              </div>
              
              <p className="text-[15px] text-header-foreground/60 max-w-md leading-relaxed mb-8">
                Unabhängiger, kommerzieller Online-Service für die Beantragung von Grundbuchauszügen. 
                Wir sind keine Behörde und kein Teil des österreichischen Grundbuchsystems.
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <a 
                  href="mailto:info@grundbuchauszugonline.at" 
                  className="flex items-center gap-3 text-[15px] text-header-foreground/60 hover:text-header-foreground transition-colors group"
                >
                  <div className="h-9 w-9 rounded bg-header-foreground/5 flex items-center justify-center group-hover:bg-header-foreground/10 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>info@grundbuchauszugonline.at</span>
                </a>
                <div className="flex items-center gap-3 text-[15px] text-header-foreground/60">
                  <div className="h-9 w-9 rounded bg-header-foreground/5 flex items-center justify-center">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span>Tophallen Bouw B.V.</span>
                </div>
              </div>
            </div>

            {/* Service links */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-5 text-header-foreground/80">
                Service
              </h3>
              <nav className="flex flex-col gap-3">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-[15px] text-header-foreground/60 hover:text-header-foreground transition-colors relative group inline-flex"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-header-foreground transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-5 text-header-foreground/80">
                Rechtliches
              </h3>
              <nav className="flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-[15px] text-header-foreground/60 hover:text-header-foreground transition-colors relative group inline-flex"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-header-foreground transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-header-foreground/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-header-foreground/40">
                © {new Date().getFullYear()} Tophallen Bouw B.V. Alle Rechte vorbehalten.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-xs text-header-foreground/30">
                  Kerkweg 1a, Stavenisse, Niederlande
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
