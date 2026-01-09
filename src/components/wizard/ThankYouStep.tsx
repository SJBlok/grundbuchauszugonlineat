import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ThankYouStepProps {
  orderNumber: string;
  email: string;
}

export function ThankYouStep({ orderNumber, email }: ThankYouStepProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Vielen Dank für Ihre Bestellung
        </h1>
      </div>

      <div className="bg-success/10 border border-success/20 p-6 rounded mb-8">
        <p className="text-foreground mb-2">
          Ihre Bestellung wurde erfolgreich erfasst.
        </p>
        <p className="text-muted-foreground">
          Der Grundbuchauszug wird innerhalb weniger Minuten per E-Mail an{" "}
          <strong className="text-foreground">{email}</strong> versendet.
        </p>
      </div>

      <div className="bg-info p-6 rounded border mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Zahlungsinformationen
        </h2>
        <p className="text-muted-foreground mb-4">
          Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Bestellnummer als Verwendungszweck:
        </p>

        <div className="bg-background p-4 rounded border space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">Empfänger / Begünstigter:</span>
            <span className="font-semibold text-foreground">Application Assistant Ltd</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">IBAN:</span>
            <span className="font-semibold text-foreground font-mono">DE56 2022 0800 0058 7945 48</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-muted-foreground">BIC:</span>
            <span className="font-semibold text-foreground font-mono">SXPYDEHHXXX</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 pt-2 border-t">
            <span className="text-muted-foreground">Verwendungszweck:</span>
            <span className="font-semibold text-primary">Bestellnummer: {orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button asChild variant="outline">
          <Link to="/" className="hover:no-underline">Zurück zur Startseite</Link>
        </Button>
      </div>
    </div>
  );
}
