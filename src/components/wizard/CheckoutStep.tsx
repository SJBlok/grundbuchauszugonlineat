import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, Building2, MapPin, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";

const applicantSchema = z.object({
  vorname: z.string().min(1, "Vorname ist erforderlich").max(50),
  nachname: z.string().min(1, "Nachname ist erforderlich").max(50),
  email: z.string().email("Ungültige E-Mail-Adresse").max(100),
  emailConfirm: z.string().email("Ungültige E-Mail-Adresse").max(100),
  wohnsitzland: z.string().min(1, "Wohnsitzland ist erforderlich"),
  firma: z.string().max(100).optional(),
}).refine((data) => data.email === data.emailConfirm, {
  message: "E-Mail-Adressen stimmen nicht überein",
  path: ["emailConfirm"],
});

type FormData = z.infer<typeof applicantSchema>;

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
  initialApplicantData: ApplicantData;
  onSubmit: (orderNumber: string) => void;
  onBack: () => void;
}

export function CheckoutStep({
  propertyData,
  initialApplicantData,
  onSubmit,
  onBack,
}: CheckoutStepProps) {
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [confirmNoRefund, setConfirmNoRefund] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      ...initialApplicantData,
      emailConfirm: initialApplicantData.email,
    },
  });

  const wohnsitzland = watch("wohnsitzland");
  const email = watch("email");

  const allConfirmed = confirmTerms && confirmNoRefund;

  const handleFormSubmit = async (formData: FormData) => {
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
          vorname: formData.vorname,
          nachname: formData.nachname,
          email: formData.email,
          wohnsitzland: formData.wohnsitzland,
          firma: formData.firma || null,
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 md:space-y-6">
      {/* Order Summary Card - Combined Grundstück & Zustellung */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b bg-muted/30">
          <h2 className="text-base md:text-xl font-semibold text-foreground">Bestellübersicht</h2>
        </div>
        
        <div className="p-3 md:p-6">
          {/* Product & Property Combined */}
          <div className="flex items-start gap-3 p-3 md:p-4 bg-muted/30 rounded-lg">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm md:text-base text-foreground">Aktueller Grundbuchauszug</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs md:text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
                <span className="truncate">KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {propertyData.bundesland} • {propertyData.grundbuchsgericht}
              </p>
            </div>
            <p className="font-bold text-base md:text-lg text-foreground shrink-0">€19,90</p>
          </div>
        </div>
      </div>

      {/* Contact Details Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b bg-muted/30">
          <h2 className="text-base md:text-xl font-semibold text-foreground">Kontakt & Zustellung</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Der Grundbuchauszug wird an diese E-Mail-Adresse versendet.
          </p>
        </div>

        <div className="p-3 md:p-6 space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="vorname" className="text-xs md:text-sm font-medium">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="vorname" 
                {...register("vorname")} 
                placeholder="Max"
                className="h-10 md:h-12 text-base bg-background"
              />
              {errors.vorname && (
                <p className="text-xs md:text-sm text-destructive">{errors.vorname.message}</p>
              )}
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="nachname" className="text-xs md:text-sm font-medium">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="nachname" 
                {...register("nachname")} 
                placeholder="Mustermann"
                className="h-10 md:h-12 text-base bg-background"
              />
              {errors.nachname && (
                <p className="text-xs md:text-sm text-destructive">{errors.nachname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="email" className="text-xs md:text-sm font-medium">
              E-Mail-Adresse <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="max.mustermann@email.at"
                className="h-10 md:h-12 pl-10 text-base bg-background"
              />
            </div>
            {errors.email && (
              <p className="text-xs md:text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="emailConfirm" className="text-xs md:text-sm font-medium">
              E-Mail-Adresse bestätigen <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="emailConfirm" 
                type="email" 
                {...register("emailConfirm")} 
                placeholder="E-Mail-Adresse wiederholen"
                className="h-10 md:h-12 pl-10 text-base bg-background"
              />
            </div>
            {errors.emailConfirm && (
              <p className="text-xs md:text-sm text-destructive">{errors.emailConfirm.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="wohnsitzland" className="text-xs md:text-sm font-medium">
                Wohnsitzland <span className="text-destructive">*</span>
              </Label>
              <Select
                value={wohnsitzland}
                onValueChange={(value) =>
                  setValue("wohnsitzland", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-10 md:h-12 text-base bg-background">
                  <SelectValue placeholder="Auswählen..." />
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
                <p className="text-xs md:text-sm text-destructive">{errors.wohnsitzland.message}</p>
              )}
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="firma" className="text-xs md:text-sm font-medium text-muted-foreground">
                Firma <span className="text-xs font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="firma" 
                  {...register("firma")} 
                  placeholder="Firmenname"
                  className="h-10 md:h-12 pl-10 text-base bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Confirmation Card */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="px-4 py-3 md:px-6 md:py-4 border-b bg-muted/30">
          <h2 className="text-base md:text-xl font-semibold text-foreground">Zahlung & Bestätigung</h2>
        </div>

        <div className="p-3 md:p-6 space-y-4 md:space-y-5">
          {/* Payment Method - Better display */}
          <div className="p-3 md:p-4 border-2 border-primary/20 bg-primary/5 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm md:text-base text-foreground">Zahlung auf Rechnung</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Die Rechnung wird per E-Mail an {email || "Ihre E-Mail-Adresse"} übermittelt.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Confirmations - Combined to 2 checkboxes */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmTerms"
                checked={confirmTerms}
                onCheckedChange={(checked) => setConfirmTerms(checked as boolean)}
                className="mt-0.5 h-5 w-5"
              />
              <Label htmlFor="confirmTerms" className="font-normal text-xs md:text-sm leading-relaxed cursor-pointer">
                Ich habe die <a href="/agb" target="_blank" className="text-primary underline hover:no-underline">AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary underline hover:no-underline">Datenschutzerklärung</a> gelesen und akzeptiere diese. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked as boolean)}
                className="mt-0.5 h-5 w-5"
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-xs md:text-sm leading-relaxed cursor-pointer">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 md:pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 md:h-12 text-base"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 md:h-14 text-base md:text-lg font-bold shadow-lg hover:shadow-xl transition-all rounded-xl"
              size="lg"
              disabled={isSubmitting || !allConfirmed}
            >
              {isSubmitting ? "Wird verarbeitet..." : "Kostenpflichtig bestellen • €19,90"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
