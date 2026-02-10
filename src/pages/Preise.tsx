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
import { CheckCircle, ChevronRight } from "lucide-react";
import iconDocument from "@/assets/icon-document.png";

const productFeatures = [
  "Vollständige Eigentumsinformationen (B-Blatt)",
  "Detaillierte Grundstücks- und Objektdaten (A1- und A2-Blatt)",
  "Übersicht über Lasten und Beschränkungen (C-Blatt)",
  "Zustellung per E-Mail innerhalb weniger Minuten",
  "Elektronisch signiertes PDF-Dokument",
];

export default function Preise() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Preise
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Transparente Preisgestaltung ohne versteckte Kosten.
            </p>

            {/* Product Card */}
            <div className="bg-background border rounded-lg overflow-hidden mb-8">
              <div className="bg-primary text-primary-foreground px-6 py-3">
                <h2 className="font-semibold">Produkt</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <img src={iconDocument} alt="" className="w-20 h-20 object-contain" />
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Aktueller Grundbuchauszug
                      </h3>
                      <span className="text-3xl font-bold text-primary">28,90 €</span>
                    </div>
                    <ul className="space-y-2">
                      {productFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-info p-6 rounded border mb-8">
              <h3 className="font-semibold text-foreground mb-2">
                Zahlungsart
              </h3>
              <p className="text-muted-foreground">
                Die Zahlung erfolgt auf Rechnung (Überweisung). Die Rechnung wird nach Abschluss der Bestellung per E-Mail übermittelt. Die Zahlungsfrist beträgt 14 Tage.
              </p>
            </div>

            <div className="text-center">
              <Button asChild size="lg">
                <Link to="/anfordern" className="hover:no-underline">
                  Jetzt anfordern
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
