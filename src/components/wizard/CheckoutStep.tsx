import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, CreditCard, Shield, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "./ProductCard";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";

interface CheckoutStepProps {
  propertyData: PropertyData;
  applicantData: ApplicantData;
  onSubmit: (orderNumber: string) => void;
  onBack: () => void;
}

export function CheckoutStep({
  propertyData,
  applicantData,
  onSubmit,
  onBack,
}: CheckoutStepProps) {
  const [confirmAGB, setConfirmAGB] = useState(false);
  const [confirmPrivacy, setConfirmPrivacy] = useState(false);
  const [confirmNoRefund, setConfirmNoRefund] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const allConfirmed = confirmAGB && confirmPrivacy && confirmNoRefund;

  const handleFormSubmit = async () => {
    if (!allConfirmed) {
      toast({
        title: "Bestätigungen erforderlich",
        description: "Bitte bestätigen Sie alle Checkboxen.",
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
          {/* Product Card with Property Data */}
          <ProductCard propertyData={propertyData} />

          {/* Applicant Summary */}
          <div className="bg-muted/30 border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Zustellung an</p>
                <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                  <p>{applicantData.vorname} {applicantData.nachname}</p>
                  <p>{applicantData.email}</p>
                  {applicantData.firma && <p>{applicantData.firma}</p>}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                className="shrink-0"
              >
                Ändern
              </Button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-sm text-foreground">
              Der Grundbuchauszug wird innerhalb weniger Minuten per E-Mail an <strong>{applicantData.email}</strong> versendet.
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Zahlungsart
            </h3>
            <div className="flex items-center gap-2">
              <Checkbox id="payment" checked disabled />
              <Label htmlFor="payment" className="font-normal">
                Zahlung auf Rechnung (Überweisung)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Die Rechnung wird nach Abschluss der Bestellung per E-Mail übermittelt.
            </p>
          </div>

          {/* Legal Confirmations */}
          <div className="space-y-4 bg-muted/30 border rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-3">Bitte bestätigen Sie folgende Punkte:</p>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmAGB"
                checked={confirmAGB}
                onCheckedChange={(checked) => setConfirmAGB(checked as boolean)}
              />
              <Label htmlFor="confirmAGB" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich habe die <a href="/agb" target="_blank" className="text-primary underline hover:no-underline">Allgemeinen Geschäftsbedingungen (AGB)</a> gelesen und akzeptiere diese. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmPrivacy"
                checked={confirmPrivacy}
                onCheckedChange={(checked) => setConfirmPrivacy(checked as boolean)}
              />
              <Label htmlFor="confirmPrivacy" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich habe die <a href="/datenschutz" target="_blank" className="text-primary underline hover:no-underline">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bestellabwicklung zu. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked as boolean)}
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung des digitalen Grundbuchauszugs besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-14"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="flex-1 h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              disabled={isSubmitting || !allConfirmed}
            >
              {isSubmitting ? "Wird verarbeitet..." : "Kostenpflichtig bestellen"}
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
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Sichere Zahlung</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
