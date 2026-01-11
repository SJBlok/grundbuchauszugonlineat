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
      {/* Austrian flag stripe */}
      <div className="h-1 bg-primary" />
      
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-0.5">
                  <div className="w-1.5 h-7 bg-primary rounded-sm" />
                  <div className="w-1.5 h-7 bg-header-foreground rounded-sm" />
                  <div className="w-1.5 h-7 bg-primary rounded-sm" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">GrundbuchauszugOnline</span>
                  <span className="text-xs text-header-foreground/70">Ihr Grundbuchservice für Österreich</span>
                </div>
              </div>
              <p className="text-sm text-header-foreground/70 max-w-md">
                Ihr Service für die Anforderung von Grundbuchauszügen aus dem österreichischen Grundbuch.
              </p>
            </div>

            {/* Right column */}
            <div className="md:text-right">
              <nav className="flex flex-wrap md:justify-end gap-4 mb-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-header-foreground/70 hover:text-header-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <p className="text-sm text-header-foreground/50">
                © {new Date().getFullYear()} Application Assistant Ltd
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
