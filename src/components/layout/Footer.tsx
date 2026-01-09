import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
  { label: "Widerrufsbelehrung", href: "/widerruf" },
  { label: "Impressum", href: "/impressum" },
];

export function Footer() {
  return (
    <footer className="bg-header text-header-foreground py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-header-foreground/70">
            © {new Date().getFullYear()} GrundbuchauszugOnline
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
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
        </div>
      </div>
    </footer>
  );
}
