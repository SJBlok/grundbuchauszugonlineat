import { CheckCircle, Copy, FileText, Mail, Home, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface ThankYouStepProps {
  orderNumber: string;
  email: string;
  propertyInfo?: string;
}

export function ThankYouStep({ orderNumber, email, propertyInfo }: ThankYouStepProps) {
  // Track purchase conversions
  useEffect(() => {
    if (window.gtag) {
      // Original conversion tracking
      window.gtag('event', 'conversion', {
        'send_to': 'AW-10868807904/yBP-CILkyugbEOCx074o',
        'transaction_id': orderNumber
      });
      // New conversion tracking (AW-17892973244)
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17892973244/F7FXCK6a7-sbELy1hNRC',
        'transaction_id': orderNumber
      });
    }
  }, [orderNumber]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-serif">
          Anfrage eingegangen!
        </h1>
        <p className="text-muted-foreground mt-2">
          Ihre Grundbuchauszug-Anfrage wurde erfolgreich übermittelt und wird bearbeitet.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-card border border-border rounded overflow-hidden mb-6">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Anfragedetails</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-muted-foreground">Kenmerk</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-primary">{orderNumber}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(orderNumber, "Kenmerk")}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          {propertyInfo && (
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-muted-foreground">Grundstück</span>
              <span className="text-sm text-foreground text-right max-w-[200px]">{propertyInfo}</span>
            </div>
          )}
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-muted-foreground">Produkt</span>
            <span className="text-sm text-foreground">Aktueller Grundbuchauszug</span>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-muted-foreground">E-Mail</span>
            <span className="text-sm text-foreground">{email}</span>
          </div>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 bg-primary/10 rounded flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Bestätigung per E-Mail
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Sie erhalten in Kürze eine Bestätigung an <strong className="text-foreground">{email}</strong>. Bitte überprüfen Sie auch Ihren Spam-Ordner.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button asChild variant="default" className="flex-1 h-12">
          <Link to="/" className="hover:no-underline">
            <Home className="h-4 w-4 mr-2" />
            Zur Startseite
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 h-12">
          <Link to="/anfordern" className="hover:no-underline">
            <Plus className="h-4 w-4 mr-2" />
            Neue Anfrage
          </Link>
        </Button>
      </div>

      {/* Save Reference Notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded p-3">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          Bewahren Sie Ihr Kenmerk auf: <strong className="font-mono text-foreground">{orderNumber}</strong>
        </span>
      </div>
    </div>
  );
}
