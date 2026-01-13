import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, MapPin, Lock, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
    <div className="space-y-6">
      {/* Order Summary Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b bg-muted/30">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Bestellübersicht</h2>
          <p className="text-sm text-muted-foreground mt-1">Überprüfen Sie Ihre Bestellung vor dem Abschluss.</p>
        </div>
        
        <div className="p-4 md:p-6 space-y-4">
          {/* Product */}
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Aktueller Grundbuchauszug</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vollständige Eigentumsinformationen, Grundstücksdaten und Lasten
              </p>
            </div>
            <p className="font-bold text-foreground shrink-0">€19,90</p>
          </div>

          {/* Property */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Grundstück</p>
              <p className="text-sm text-muted-foreground">
                KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}
              </p>
              <p className="text-sm text-muted-foreground">
                {propertyData.bundesland} • {propertyData.grundbuchsgericht}
              </p>
            </div>
          </div>

          {/* Applicant */}
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">Zustellung an</p>
              <p className="text-sm text-muted-foreground">
                {applicantData.vorname} {applicantData.nachname}
              </p>
              <p className="text-sm text-muted-foreground">{applicantData.email}</p>
              {applicantData.firma && (
                <p className="text-sm text-muted-foreground">{applicantData.firma}</p>
              )}
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

          {/* Delivery Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-sm text-foreground">
              Der Grundbuchauszug wird innerhalb weniger Minuten per E-Mail an <strong>{applicantData.email}</strong> versendet.
            </p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
            <p className="font-semibold text-foreground">Gesamtbetrag</p>
            <p className="text-xl font-bold text-foreground">€19,90</p>
          </div>
        </div>
      </div>

      {/* Payment & Confirmation Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b bg-muted/30">
          <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Zahlungsart & Bestätigung
          </h2>
        </div>

        <div className="p-4 md:p-6 space-y-5">
          {/* Payment Method */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Checkbox id="payment" checked disabled />
            <Label htmlFor="payment" className="font-normal text-sm">
              Zahlung auf Rechnung (Überweisung) – Die Rechnung wird per E-Mail übermittelt.
            </Label>
          </div>

          {/* Legal Confirmations */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Bitte bestätigen Sie folgende Punkte:</p>
            
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
                Ich habe die <a href="/datenschutz" target="_blank" className="text-primary underline hover:no-underline">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked as boolean)}
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-11 md:h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              onClick={handleFormSubmit}
              className="flex-1 h-12 md:h-14 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              disabled={isSubmitting || !allConfirmed}
            >
              {isSubmitting ? "Wird verarbeitet..." : "Kostenpflichtig bestellen • €19,90"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
