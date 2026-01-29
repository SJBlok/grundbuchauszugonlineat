import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Startseite", href: "/" },
  { label: "Grundbuchauszug", href: "/grundbuchauszug" },
  { label: "Ablauf", href: "/ablauf" },
  { label: "Preise", href: "/preise" },
  { label: "Lexikon", href: "/lexikon" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/kontakt" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const currentPageLabel = navItems.find(item => item.href === location.pathname)?.label;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-primary/80" />
      
      {/* Main header */}
      <div className={`transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-xl shadow-premium-md" 
          : "bg-background border-b border-border/50"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 lg:gap-4 text-foreground hover:no-underline min-w-0 group">
              {/* Austrian flag colors */}
              <div className="flex items-center gap-0.5 shrink-0">
                <div className="w-2 lg:w-2.5 h-10 lg:h-12 bg-[hsl(0,70%,45%)] rounded-sm transition-transform group-hover:scale-105" />
                <div className="w-2 lg:w-2.5 h-10 lg:h-12 bg-white border border-border/50 rounded-sm transition-transform group-hover:scale-105" />
                <div className="w-2 lg:w-2.5 h-10 lg:h-12 bg-[hsl(0,70%,45%)] rounded-sm transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg lg:text-xl font-bold leading-tight tracking-tight font-serif">
                  GrundbuchauszugOnline
                </span>
                <span className="text-xs lg:text-sm text-muted-foreground leading-tight hidden sm:block">
                  Ihr Grundbuchservice für Österreich
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:no-underline ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground shadow-premium-sm"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
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
              className="lg:hidden h-12 w-12 shrink-0 hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-4 py-4 text-base font-medium rounded-lg transition-all duration-200 hover:no-underline ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
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

      {/* Breadcrumb bar - only on non-home pages */}
      {location.pathname !== "/" && currentPageLabel && (
        <div className="bg-muted/50 border-b border-border/30">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-muted-foreground flex items-center gap-2">
              <Link to="/" className="hover:text-foreground transition-colors">
                Startseite
              </Link>
              <span className="text-border">›</span>
              <span className="text-foreground font-medium">{currentPageLabel}</span>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
