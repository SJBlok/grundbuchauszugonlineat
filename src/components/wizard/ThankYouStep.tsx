import { CheckCircle, Copy, FileText, Mail, CreditCard, Building2, Clock, Shield } from "lucide-react";
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
}

export function ThankYouStep({ orderNumber, email }: ThankYouStepProps) {
  // Track purchase conversion
  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17870570997/A99CCM3Y2eEbEPWLrclC',
        'transaction_id': orderNumber
      });
    }
  }, [orderNumber]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Bestellung erfolgreich!</h1>
            <p className="text-primary-foreground/80 text-sm">Vielen Dank für Ihre Bestellung</p>
          </div>
        </div>
      </div>

      <div className="bg-card border-2 border-t-0 border-border rounded-b-lg shadow-xl">
        {/* Order Summary */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Bestellübersicht</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Bestellnummer</div>
              <div className="font-bold text-primary text-lg">{orderNumber}</div>
            </div>
          </div>

          <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Dokument wird zugestellt</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Der Grundbuchauszug wird innerhalb weniger Minuten an{" "}
                  <strong className="text-foreground">{email}</strong> gesendet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Zahlungsinformationen</span>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Bitte überweisen Sie den Rechnungsbetrag unter Angabe der <strong>Zahlungsreferenz</strong> als Verwendungszweck:
          </p>

          <div className="bg-muted/50 border rounded-lg divide-y">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs text-muted-foreground">Empfänger</div>
                <div className="font-medium text-foreground">Application Assistant Ltd</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard("Application Assistant Ltd", "Empfänger")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs text-muted-foreground">IBAN</div>
                <div className="font-medium text-foreground font-mono">DE56 2022 0800 0058 7945 48</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard("DE56202208000058794548", "IBAN")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs text-muted-foreground">BIC</div>
                <div className="font-medium text-foreground font-mono">SXPYDEHHXXX</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard("SXPYDEHHXXX", "BIC")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5">
              <div>
                <div className="text-xs text-muted-foreground">Zahlungsreferenz / Verwendungszweck</div>
                <div className="font-bold text-primary text-lg">{orderNumber}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(orderNumber, "Zahlungsreferenz")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-xs text-muted-foreground">Rechnungsbetrag</div>
                <div className="font-bold text-foreground text-xl">€ 19,90</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Sichere Übertragung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Sofortige Bearbeitung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Amtliche Dokumente</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t">
          <Button asChild className="w-full" size="lg">
            <Link to="/" className="hover:no-underline">Zurück zur Startseite</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
