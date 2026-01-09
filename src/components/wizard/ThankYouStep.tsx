import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ThankYouStepProps {
  orderNumber: string;
  email: string;
}

export function ThankYouStep({ orderNumber, email }: ThankYouStepProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
        <CheckCircle className="h-8 w-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
        Vielen Dank für Ihre Bestellung
      </h1>

      <div className="bg-info p-6 rounded-lg mb-8 text-left">
        <p className="text-foreground mb-4">
          Vielen Dank. Ihre Bestellung wurde erfolgreich erfasst.
        </p>
        <p className="text-muted-foreground">
          Der Grundbuchauszug wird innerhalb weniger Minuten per E-Mail an{" "}
          <strong className="text-foreground">{email}</strong> versendet.
        </p>
      </div>

      <div className="bg-muted p-6 rounded-lg mb-8 text-left">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Zahlungsinformationen
        </h2>
        <p className="text-muted-foreground mb-4">
          Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Bestellnummer als Verwendungszweck:
        </p>

        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Empfänger / Begünstigter:</span>
            <p className="font-semibold text-foreground">Application Assistant Ltd</p>
          </div>
          <div>
            <span className="text-muted-foreground">IBAN:</span>
            <p className="font-semibold text-foreground font-mono">DE56 2022 0800 0058 7945 48</p>
          </div>
          <div>
            <span className="text-muted-foreground">BIC:</span>
            <p className="font-semibold text-foreground font-mono">SXPYDEHHXXX</p>
          </div>
          <div>
            <span className="text-muted-foreground">Verwendungszweck:</span>
            <p className="font-semibold text-foreground">Bestellnummer: {orderNumber}</p>
          </div>
        </div>
      </div>

      <Button asChild variant="outline">
        <Link to="/">Zurück zur Startseite</Link>
      </Button>
    </div>
  );
}
