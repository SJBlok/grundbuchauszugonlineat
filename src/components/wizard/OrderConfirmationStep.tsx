import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, FileText, CreditCard, Copy, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface OrderConfirmationStepProps {
  orderNumber: string;
  email: string;
  propertyInfo: string;
  totalPrice: string;
  onConfirm: () => void;
  onBack?: () => void;
}

export function OrderConfirmationStep({
  orderNumber,
  email,
  propertyInfo,
  totalPrice,
  onConfirm,
  onBack,
}: OrderConfirmationStepProps) {
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Track purchase conversions when page loads
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

  const bankDetails = {
    empfaenger: "Application Assistant Ltd",
    iban: "DE56 2022 0800 0058 7945 48",
    bic: "SXPYDEHHXXX",
    verwendungszweck: orderNumber,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: `${label} wurde in die Zwischenablage kopiert.`,
    });
  };

  const handleConfirmClick = () => {
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    setShowConfirmDialog(false);
    onConfirm();
  };

  return (
    <>
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
            Dokument per E-Mail innerhalb von 24 Stunden. Bitte Zahlung abschließen.
          </p>
        </div>



        {/* Payment Instructions Card */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center gap-2.5">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Zahlungsanweisung</h2>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Bitte <span className="font-semibold text-foreground">überweisen Sie den Betrag</span>, um Ihre Bestellung abzuschließen.
            </p>
            
            <div className="bg-muted/30 rounded p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Empfänger</p>
                  <p className="text-sm font-medium text-foreground">{bankDetails.empfaenger}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.empfaenger, 'Empfänger')}
                  className="p-2 hover:bg-muted rounded transition-colors"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
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
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankDetails.bic, 'BIC')}
                  className="p-2 hover:bg-muted rounded transition-colors"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
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
              
              <div className="flex justify-between items-center border-t border-border pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Betrag</p>
                  <p className="text-sm font-semibold text-foreground">{totalPrice}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(totalPrice, 'Betrag')}
                  className="p-2 hover:bg-muted rounded transition-colors"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleConfirmClick}
            className="w-full h-14 text-base font-semibold shadow-lg"
          >
            <Check className="h-5 w-5 mr-2" />
            Anfrage abschließen
          </Button>
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full h-11"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Klicken Sie auf „Anfrage abschließen", nachdem Sie die Zahlung durchgeführt haben.
          </p>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-serif">
              Bestätigen Sie Ihre Zahlung
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-foreground pt-2">
              Bestätigen Sie, dass Sie <span className="font-semibold">{totalPrice}</span> mit Verwendungszweck <span className="font-mono font-semibold text-primary">{orderNumber}</span> überwiesen haben.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Durch die Bestätigung erklären Sie:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Sie haben die Überweisung ausgeführt</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Der Verwendungszweck wurde korrekt angegeben</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Ihre Anfrage wird bearbeitet, sobald die Zahlung eingegangen ist</span>
              </li>
            </ul>
          </div>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleFinalConfirm}
              className="w-full h-12 font-semibold"
            >
              <Check className="h-4 w-4 mr-2" />
              Ja, ich habe bezahlt
            </Button>
            <AlertDialogCancel className="w-full h-11 mt-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
