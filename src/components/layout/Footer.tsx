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
  { label: "Ablauf & Lieferung", href: "/preise" },
  { label: "Preise", href: "/preise" },
  { label: "Häufige Fragen", href: "/faq" },
];

export function Footer() {
  return (
    <footer className="bg-[hsl(220,20%,16%)] text-white mt-auto">
      {/* Top accent bar */}
      <div className="h-1 bg-primary" />
      
      {/* Trust bar */}
      <div className="border-b border-white/8">
        <div className="container mx-auto py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Sofortige Zustellung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Amtlich beglaubigt</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-5 rounded-sm overflow-hidden border border-white/20 flex flex-col">
                  <div className="flex-1 bg-[#ED2939]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#ED2939]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base">GrundbuchauszugOnline</span>
                  <span className="text-[11px] text-white/40">Ihr Grundbuchservice für Österreich</span>
                </div>
              </div>
              
              <p className="text-sm text-white/50 max-w-md leading-relaxed mb-6">
                Unabhängiger, kommerzieller Online-Service für die Beantragung von Grundbuchauszügen. 
                Wir sind keine Behörde und kein Teil des österreichischen Grundbuchsystems.
              </p>

              <div className="space-y-2">
                <a href="mailto:info@grundbuchauszugonline.at" className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  <span>info@grundbuchauszugonline.at</span>
                </a>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Tophallen Bouw B.V.</span>
                </div>
              </div>
            </div>

            {/* Service links */}
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider mb-4 text-white/60">
                Service
              </h3>
              <nav className="flex flex-col gap-2">
                {serviceLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="font-semibold text-xs uppercase tracking-wider mb-4 text-white/60">
                Rechtliches
              </h3>
              <nav className="flex flex-col gap-2">
                {footerLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/8 safe-area-inset-bottom">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between gap-3">
              <p className="text-xs text-white/30">
                © {new Date().getFullYear()} Tophallen Bouw B.V. Alle Rechte vorbehalten.
              </p>
              <span className="text-xs text-white/20">
                Kerkweg 1a, Stavenisse, Niederlande
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
