import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Startseite", href: "/" },
  { label: "Grundbuchauszug", href: "/grundbuchauszug" },
  { label: "Ablauf", href: "/ablauf" },
  { label: "Preise", href: "/preise" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontakt", href: "/kontakt" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar with Austrian colors */}
      <div className="h-1 bg-primary" />
      
      {/* Main header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-foreground hover:no-underline">
              <div className="flex items-center gap-1">
                <div className="w-1 h-8 bg-primary" />
                <div className="w-1 h-8 bg-background border border-border" />
                <div className="w-1 h-8 bg-primary" />
              </div>
              <span className="text-lg font-semibold">GrundbuchauszugOnline</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors hover:no-underline ${
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
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
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t">
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded transition-colors hover:no-underline ${
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
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
      <div className="bg-muted border-b">
        <div className="container mx-auto px-4 py-2">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-secondary">Startseite</Link>
            {location.pathname !== "/" && (
              <>
                <span className="mx-2">›</span>
                <span className="text-foreground">
                  {navItems.find(item => item.href === location.pathname)?.label || "Seite"}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
