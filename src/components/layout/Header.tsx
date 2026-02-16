import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Startseite", href: "/" },
  { label: "Grundbuchauszug", href: "/grundbuchauszug" },
  { label: "Preise & Ablauf", href: "/preise" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/kontakt" },
];

export function Header({ compact }: { compact?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const currentPageLabel = navItems.find(item => item.href === location.pathname)?.label;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={compact ? "relative z-50" : "sticky top-0 z-50"}>
      {/* Top institutional accent bar */}
      <div className="h-1 bg-primary" />
      
      {/* Main header - clean white */}
      <div className={`bg-white border-b border-border transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 text-foreground hover:no-underline min-w-0">
              {/* Austrian coat of arms inspired icon */}
              <div className="flex items-center gap-0.5 shrink-0">
                <div className="w-1.5 h-8 bg-[#ED2939] rounded-sm" />
                <div className="w-1.5 h-8 bg-white border border-border rounded-sm" />
                <div className="w-1.5 h-8 bg-[#ED2939] rounded-sm" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base lg:text-lg font-bold leading-tight tracking-tight">
                  GrundbuchauszugOnline
                </span>
                <span className="text-[11px] lg:text-xs text-muted-foreground leading-tight hidden sm:block">
                  Ihr Grundbuchservice für Österreich
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className={`${compact ? 'hidden' : 'hidden lg:flex'} items-center gap-0.5`}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3.5 py-2 text-sm font-semibold transition-colors duration-150 hover:no-underline ${
                    location.pathname === item.href
                      ? "text-primary border-b-2 border-primary -mb-[1px]"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`${compact ? '' : 'lg:hidden'} h-10 w-10 shrink-0`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className={`${compact ? '' : 'lg:hidden'} py-3 border-t border-border safe-area-inset-bottom`}>
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-4 py-3 text-sm font-semibold transition-colors hover:no-underline touch-target ${
                      location.pathname === item.href
                        ? "text-primary bg-primary/5 border-l-3 border-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* Breadcrumb bar */}
      {location.pathname !== "/" && currentPageLabel && (
        <div className="bg-muted/60 border-b border-border/50">
          <div className="container mx-auto py-2.5">
            <nav className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Link to="/" className="hover:text-foreground transition-colors">
                Startseite
              </Link>
              <span className="text-muted-foreground/40">›</span>
              <span className="text-foreground font-semibold">{currentPageLabel}</span>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
