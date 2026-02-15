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
      {/* Top accent bar - thin elegant line */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-primary to-primary/70" />
      
      {/* Main header */}
      <div className={`transition-all duration-350 ease-premium ${
        scrolled 
          ? "backdrop-premium shadow-lg" 
          : "bg-background border-b border-border/40"
      }`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-[88px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3.5 text-foreground hover:no-underline min-w-0 group">
              {/* Austrian flag colors - refined */}
              <div className="flex items-center gap-0.5 shrink-0">
                <div className="w-1.5 lg:w-2 h-9 lg:h-11 bg-[hsl(0,65%,48%)] rounded-sm transition-all duration-300 group-hover:h-10 lg:group-hover:h-12" />
                <div className="w-1.5 lg:w-2 h-9 lg:h-11 bg-white border border-border/30 rounded-sm transition-all duration-300 group-hover:h-10 lg:group-hover:h-12" />
                <div className="w-1.5 lg:w-2 h-9 lg:h-11 bg-[hsl(0,65%,48%)] rounded-sm transition-all duration-300 group-hover:h-10 lg:group-hover:h-12" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg lg:text-xl font-bold leading-tight tracking-tight font-serif">
                  GrundbuchauszugOnline
                </span>
                <span className="text-xs lg:text-[13px] text-muted-foreground leading-tight hidden sm:block">
                  Ihr Grundbuchservice für Österreich
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className={`${compact ? 'hidden' : 'hidden lg:flex'} items-center gap-1`}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2.5 text-[15px] font-medium rounded transition-all duration-200 hover:no-underline relative group ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/75 hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {item.label}
                  {location.pathname !== item.href && (
                    <span className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`${compact ? '' : 'lg:hidden'} h-12 w-12 shrink-0 hover:bg-muted`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className={`${compact ? '' : 'lg:hidden'} py-4 border-t border-border/40 animate-fade-in safe-area-inset-bottom`}>
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-4 py-3.5 text-base font-medium rounded transition-all duration-200 hover:no-underline animate-fade-in-up touch-target ${
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
          <div className="container mx-auto py-3">
            <nav className="text-sm text-muted-foreground flex items-center gap-2">
              <Link to="/" className="hover:text-foreground transition-colors link-underline">
                Startseite
              </Link>
              <span className="text-muted-foreground/50">›</span>
              <span className="text-foreground font-medium">{currentPageLabel}</span>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
