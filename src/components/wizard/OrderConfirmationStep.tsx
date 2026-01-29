import { Button } from "@/components/ui/button";
import { Check, FileText, CreditCard, Copy, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderConfirmationStepProps {
  orderNumber: string;
  email: string;
  propertyInfo: string;
  totalPrice: string;
  onConfirm: () => void;
}

export function OrderConfirmationStep({
  orderNumber,
  email,
  propertyInfo,
  totalPrice,
  onConfirm,
}: OrderConfirmationStepProps) {
  const { toast } = useToast();

  const bankDetails = {
    empfaenger: "Application Assistant Ltd",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "COBADEFFXXX",
    verwendungszweck: orderNumber,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: `${label} wurde in die Zwischenablage kopiert.`,
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-serif">
          Anfrage eingegangen
        </h1>
        <p className="text-muted-foreground mt-2">
          Ihre Anfrage wird nach Zahlungseingang innerhalb von 1 Stunde bearbeitet.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded p-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 bg-primary/10 rounded flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Schließen Sie Ihre Anfrage ab
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Überweisen Sie den unten angegebenen Betrag, um Ihren Grundbuchauszug zu erhalten.
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Bestellübersicht</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Bestellnummer</span>
            <span className="text-sm font-mono font-semibold text-foreground">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Produkt</span>
            <span className="text-sm text-foreground">Aktueller Grundbuchauszug</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Grundstück</span>
            <span className="text-sm text-foreground text-right max-w-[200px]">{propertyInfo}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Zustellung an</span>
            <span className="text-sm text-foreground">{email}</span>
          </div>
          <div className="border-t border-border pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Gesamtbetrag</span>
              <span className="text-lg font-bold text-foreground">{totalPrice}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">inkl. 20% MwSt.</p>
          </div>
        </div>
      </div>

      {/* Payment Instructions Card */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2.5">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Zahlungsanweisung</h2>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Bitte überweisen Sie den Betrag auf folgendes Konto:
          </p>
          
          <div className="bg-muted/30 rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Empfänger</p>
                <p className="text-sm font-medium text-foreground">{bankDetails.empfaenger}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">IBAN</p>
                <p className="text-sm font-mono font-medium text-foreground">{bankDetails.iban}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(bankDetails.iban.replace(/\s/g, ''), 'IBAN')}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">BIC</p>
                <p className="text-sm font-mono font-medium text-foreground">{bankDetails.bic}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-border pt-3">
              <div>
                <p className="text-xs text-muted-foreground">Verwendungszweck</p>
                <p className="text-sm font-mono font-semibold text-primary">{bankDetails.verwendungszweck}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(bankDetails.verwendungszweck, 'Verwendungszweck')}
                className="p-2 hover:bg-muted rounded transition-colors"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Nach Zahlungseingang erhalten Sie Ihren Grundbuchauszug per E-Mail.
          </p>
        </div>
      </div>

      {/* Confirm Button */}
      <div className="space-y-3">
        <Button
          onClick={onConfirm}
          className="w-full h-14 text-base font-semibold shadow-lg"
        >
          <Check className="h-5 w-5 mr-2" />
          Anfrage abschließen
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Klicken Sie auf „Anfrage abschließen", nachdem Sie die Zahlung durchgeführt haben.
        </p>
      </div>
    </div>
  );
}
