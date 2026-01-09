import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle } from "lucide-react";

const productFeatures = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Zustellung per E-Mail innerhalb weniger Minuten",
];

export default function Preise() {
  return (
    <Layout>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Preise
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Transparente Preisgestaltung ohne versteckte Kosten.
            </p>

            <div className="bg-card border rounded-lg overflow-hidden mb-12">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="font-semibold">Produkt</TableHead>
                    <TableHead className="font-semibold text-right">Preis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Aktueller Grundbuchauszug
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      19,90 €
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-info p-6 rounded-lg mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Im Preis enthalten
              </h2>
              <ul className="space-y-3">
                {productFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-muted p-6 rounded-lg mb-12">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Zahlungsart
              </h2>
              <p className="text-muted-foreground">
                Die Zahlung erfolgt auf Rechnung (Überweisung). Die Rechnung wird nach Abschluss der Bestellung per E-Mail übermittelt.
              </p>
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/anfordern">Jetzt anfordern</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
