import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";

const applicantSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich").max(50),
  nachname: z.string().min(1, "Nachname ist erforderlich").max(50),
  email: z.string().email("Ungültige E-Mail-Adresse").max(100),
  wohnsitzland: z.string().min(1, "Wohnsitzland ist erforderlich"),
  firma: z.string().max(100).optional(),
});

const countries = [
  "Österreich",
  "Deutschland",
  "Schweiz",
  "Liechtenstein",
  "Italien",
  "Slowenien",
  "Ungarn",
  "Slowakei",
  "Tschechien",
  "Andere",
];

interface CheckoutStepProps {
  propertyData: PropertyData;
  initialData: ApplicantData;
  onSubmit: (data: ApplicantData, orderNumber: string) => void;
  onBack: () => void;
}

export function CheckoutStep({
  propertyData,
  initialData,
  onSubmit,
  onBack,
}: CheckoutStepProps) {
  const [confirmData, setConfirmData] = useState(false);
  const [confirmPrivacy, setConfirmPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicantData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: initialData,
  });

  const wohnsitzland = watch("wohnsitzland");

  const handleFormSubmit = async (data: ApplicantData) => {
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
          vorname: data.vorname,
          nachname: data.nachname,
          email: data.email,
          wohnsitzland: data.wohnsitzland,
          firma: data.firma || null,
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
        // Don't block the order completion, just log the error
      }

      onSubmit(data, orderResult.order_number);
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
    <div>
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </Button>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        Bestellung abschließen
      </h1>

      {/* Product Card */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Aktueller Grundbuchauszug
            </h2>
            <p className="text-2xl font-bold text-primary mt-1">19,90 €</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Info className="h-5 w-5" />
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
                <p className="text-muted-foreground">
                  Die Zustellung erfolgt per E-Mail innerhalb weniger Minuten nach Bestellabschluss.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">
            Vollständige Eigentumsinformationen
          </p>
          <p className="text-muted-foreground">
            Enthält alle im Grundbuch eingetragenen Eigentümer, Eigentumsanteile sowie die rechtliche Grundlage des Eigentumserwerbs (B-Blatt).
          </p>

          <p className="font-semibold text-foreground mt-4">
            Detaillierte Grundstücks- und Objektdaten
          </p>
          <p className="text-muted-foreground">
            Zeigt die Katastralgemeinde, Grundstücksnummern, Flächenangaben und sonstige objektspezifische Informationen gemäß A1- und A2-Blatt.
          </p>

          <p className="font-semibold text-foreground mt-4">
            Übersicht über Lasten und Beschränkungen
          </p>
          <p className="text-muted-foreground">
            Gibt Auskunft über Hypotheken, Dienstbarkeiten, Pfandrechte sowie weitere im C-Blatt eingetragene Belastungen.
          </p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-info p-4 rounded-lg mb-8">
        <p className="text-sm text-foreground">
          Der Grundbuchauszug wird innerhalb weniger Minuten per E-Mail versendet.
        </p>
      </div>

      {/* Applicant Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Ihre Daten</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vorname">Vorname *</Label>
            <Input id="vorname" {...register("vorname")} />
            {errors.vorname && (
              <p className="text-sm text-destructive">{errors.vorname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nachname">Nachname *</Label>
            <Input id="nachname" {...register("nachname")} />
            {errors.nachname && (
              <p className="text-sm text-destructive">{errors.nachname.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse *</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="wohnsitzland">Wohnsitzland *</Label>
          <Select
            value={wohnsitzland}
            onValueChange={(value) =>
              setValue("wohnsitzland", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wohnsitzland auswählen" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.wohnsitzland && (
            <p className="text-sm text-destructive">{errors.wohnsitzland.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="firma">Firma (optional)</Label>
          <Input id="firma" {...register("firma")} />
          {errors.firma && (
            <p className="text-sm text-destructive">{errors.firma.message}</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Zahlungsart</h3>
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

        {/* Confirmations */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmData"
              checked={confirmData}
              onCheckedChange={(checked) => setConfirmData(checked as boolean)}
            />
            <Label htmlFor="confirmData" className="font-normal text-sm leading-relaxed">
              Ich bestätige die Richtigkeit meiner Angaben
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmPrivacy"
              checked={confirmPrivacy}
              onCheckedChange={(checked) => setConfirmPrivacy(checked as boolean)}
            />
            <Label htmlFor="confirmPrivacy" className="font-normal text-sm leading-relaxed">
              Ich stimme der Verarbeitung meiner Daten zur Bestellabwicklung zu
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || !confirmData || !confirmPrivacy}
        >
          {isSubmitting ? "Wird verarbeitet..." : "Bestellung abschließen"}
        </Button>
      </form>
    </div>
  );
}
