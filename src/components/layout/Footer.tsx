import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
  { label: "Widerrufsbelehrung", href: "/widerruf" },
  { label: "Impressum", href: "/impressum" },
];

export function Footer() {
  return (
    <footer className="bg-header text-header-foreground mt-auto">
      {/* Top accent bar */}
      <div className="h-1 bg-primary" />
      
      <div className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Left column */}
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                {/* Austrian flag colors in footer */}
                <div className="flex items-center gap-0.5">
                  <div className="w-1.5 h-6 md:h-7 bg-[hsl(0,70%,45%)] rounded-sm" />
                  <div className="w-1.5 h-6 md:h-7 bg-header-foreground rounded-sm" />
                  <div className="w-1.5 h-6 md:h-7 bg-[hsl(0,70%,45%)] rounded-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm md:text-base">GrundbuchauszugOnline</span>
                  <span className="text-[10px] md:text-xs text-header-foreground/70">Ihr Grundbuchservice für Österreich</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-header-foreground/70 max-w-md">
                Ihr Service für die Anforderung von Grundbuchauszügen aus dem österreichischen Grundbuch.
              </p>
            </div>

            {/* Right column */}
            <div className="md:text-right">
              <nav className="flex flex-wrap md:justify-end gap-x-4 gap-y-2 mb-3 md:mb-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-xs md:text-sm text-header-foreground/70 hover:text-header-foreground transition-colors py-1"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <p className="text-xs md:text-sm text-header-foreground/50">
                © {new Date().getFullYear()} Tophallen Bouw B.V.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
