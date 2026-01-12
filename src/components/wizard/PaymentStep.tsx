import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, ArrowLeft, CreditCard, FileText, Shield, CheckCircle2, ChevronRight, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";

interface PaymentStepProps {
  propertyData: PropertyData;
  applicantData: ApplicantData;
  onSubmit: (orderNumber: string) => void;
  onBack: () => void;
}

export function PaymentStep({
  propertyData,
  applicantData,
  onSubmit,
  onBack,
}: PaymentStepProps) {
  const [confirmData, setConfirmData] = useState(false);
  const [confirmPrivacy, setConfirmPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async () => {
    if (!confirmData || !confirmPrivacy) {
      toast({
        title: "Bestätigungen erforderlich",
        description: "Bitte bestätigen Sie beide Checkboxen.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: orderResult, error } = await supabase
        .from("orders")
        .insert([{
          katastralgemeinde: propertyData.katastralgemeinde,
          grundstuecksnummer: propertyData.grundstuecksnummer,
          grundbuchsgericht: propertyData.grundbuchsgericht,
          bundesland: propertyData.bundesland,
          wohnungs_hinweis: propertyData.wohnungsHinweis || null,
          vorname: applicantData.vorname,
          nachname: applicantData.nachname,
          email: applicantData.email,
          wohnsitzland: applicantData.wohnsitzland,
          firma: applicantData.firma || null,
          order_number: "",
        }])
        .select("id, order_number")
        .single();

      if (error) throw error;

      // Trigger document delivery via edge function
      const { error: deliveryError } = await supabase.functions.invoke(
        "send-grundbuch-document",
        { body: { orderId: orderResult.id } }
      );

      if (deliveryError) {
        console.error("Document delivery error:", deliveryError);
      }

      onSubmit(orderResult.order_number);
    } catch (error) {
      console.error("Order submission error:", error);
      toast({
        title: "Fehler bei der Bestellung",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Official Header Bar */}
      <div className="bg-primary text-primary-foreground px-6 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary-foreground/20 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Grundbuchauszug Online</h1>
              <p className="text-primary-foreground/80 text-xs">Offizieller Grundbuchauszug – Österreich</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border-2 border-t-0 border-border rounded-b-lg shadow-xl">
        {/* Step Indicator */}
        <div className="bg-muted/50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              3
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Bestellung abschließen</h2>
              <p className="text-sm text-muted-foreground">Überprüfen und bestätigen</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="space-y-4">
            {/* Product */}
            <div className="bg-muted/30 border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Aktueller Grundbuchauszug</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      KG: {propertyData.katastralgemeinde} | EZ/GST: {propertyData.grundstuecksnummer}
                    </p>
                    <p className="text-sm text-muted-foreground">{propertyData.bundesland}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">19,90 €</p>
                  <p className="text-xs text-muted-foreground">inkl. MwSt.</p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="flex items-start gap-3 bg-info/50 border border-info rounded-lg p-4">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground text-sm">Zustellung an: {applicantData.email}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Lieferung innerhalb weniger Minuten
                </p>
              </div>
            </div>

            {/* Product Details Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Info className="h-4 w-4 mr-2" />
                  Was enthält der Grundbuchauszug?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aktueller Grundbuchauszug</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <p className="font-semibold">
                    Der Grundbuchauszug enthält folgende Informationen:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      <strong>A-Blatt:</strong> Grundstücksbeschreibung, Katastralgemeinde, Fläche
                    </li>
                    <li>
                      <strong>B-Blatt:</strong> Eigentümer, Eigentumsanteile, Rechtsgrundlage
                    </li>
                    <li>
                      <strong>C-Blatt:</strong> Hypotheken, Dienstbarkeiten, Pfandrechte
                    </li>
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Payment Method */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Zahlungsart
            </h3>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm">Zahlung auf Rechnung (Überweisung)</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-6">
              Die Rechnung wird nach Abschluss der Bestellung per E-Mail übermittelt.
            </p>
          </div>

          {/* Confirmations */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-foreground">Bestätigungen</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmData"
                checked={confirmData}
                onCheckedChange={(checked) => setConfirmData(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="confirmData" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich bestätige die Richtigkeit meiner Angaben
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmPrivacy"
                checked={confirmPrivacy}
                onCheckedChange={(checked) => setConfirmPrivacy(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="confirmPrivacy" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich stimme der Verarbeitung meiner Daten zur Bestellabwicklung gemäß der{" "}
                <a href="/datenschutz" target="_blank" className="text-primary hover:underline">
                  Datenschutzerklärung
                </a>{" "}
                zu
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleFormSubmit}
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              disabled={isSubmitting || !confirmData || !confirmPrivacy}
            >
              {isSubmitting ? (
                <>Wird verarbeitet...</>
              ) : (
                <>
                  Kostenpflichtig bestellen – 19,90 €
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Sichere Bezahlung</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
