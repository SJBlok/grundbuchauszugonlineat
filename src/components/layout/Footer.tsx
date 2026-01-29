import { Link } from "react-router-dom";
import { Mail, MapPin, Building2 } from "lucide-react";

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
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/80" />
      
      <div className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                {/* Austrian flag colors */}
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-8 bg-[hsl(0,70%,45%)] rounded-sm" />
                  <div className="w-2 h-8 bg-header-foreground rounded-sm" />
                  <div className="w-2 h-8 bg-[hsl(0,70%,45%)] rounded-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg font-serif">GrundbuchauszugOnline</span>
                  <span className="text-sm text-header-foreground/70">Ihr Grundbuchservice für Österreich</span>
                </div>
              </div>
              
              <p className="text-sm text-header-foreground/70 max-w-md leading-relaxed mb-6">
                Unabhängiger, kommerzieller Online-Service für die Beantragung von Grundbuchauszügen. 
                Keine Behörde – kein Teil des österreichischen Grundbuchsystems.
              </p>

              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-header-foreground/70">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:info@grundbuchauszugonline.at" className="hover:text-header-foreground transition-colors">
                    info@grundbuchauszugonline.at
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-header-foreground/70">
                  <Building2 className="h-4 w-4" />
                  <span>Tophallen Bouw B.V.</span>
                </div>
              </div>
            </div>

            {/* Service links */}
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-header-foreground/90">
                Service
              </h3>
              <nav className="flex flex-col gap-3">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-header-foreground/70 hover:text-header-foreground transition-colors relative group"
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
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-header-foreground/90">
                Rechtliches
              </h3>
              <nav className="flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-header-foreground/70 hover:text-header-foreground transition-colors relative group"
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
          <div className="mt-12 pt-8 border-t border-header-foreground/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-header-foreground/50">
                © {new Date().getFullYear()} Tophallen Bouw B.V. Alle Rechte vorbehalten.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-xs text-header-foreground/40">
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
