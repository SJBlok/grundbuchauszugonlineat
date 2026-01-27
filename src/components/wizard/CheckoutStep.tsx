import { useState, useEffect, useCallback, useRef } from "react";
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
import { ArrowLeft, Mail, Building2, MapPin, FileText, CreditCard, Loader2, Check, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";

// Generate or retrieve session ID for abandoned cart tracking
function getSessionId(): string {
  const storageKey = "grundbuch_session_id";
  let sessionId = sessionStorage.getItem(storageKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
  }
  return sessionId;
}

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
  const sessionIdRef = useRef<string>(getSessionId());
  const lastTrackedEmailRef = useRef<string>("");

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
  const vorname = watch("vorname");
  const nachname = watch("nachname");
  const firma = watch("firma");

  // Track abandoned session when form data changes
  const trackAbandonedSession = useCallback(async () => {
    if (!email || !email.includes("@")) return;
    
    // Don't re-track if email hasn't changed
    if (email === lastTrackedEmailRef.current) return;
    lastTrackedEmailRef.current = email;

    try {
      await supabase.functions.invoke("track-abandoned-session", {
        body: {
          sessionId: sessionIdRef.current,
          email,
          vorname,
          nachname,
          firma,
          wohnsitzland,
          katastralgemeinde: propertyData.katastralgemeinde,
          grundstuecksnummer: propertyData.grundstuecksnummer,
          grundbuchsgericht: propertyData.grundbuchsgericht,
          bundesland: propertyData.bundesland,
          wohnungsHinweis: propertyData.wohnungsHinweis,
          adresse: propertyData.adresse,
          plz: propertyData.plz,
          ort: propertyData.ort,
          productName: "Aktueller Grundbuchauszug",
          productPrice: 19.90,
          step: 2,
        },
      });
      console.log("Abandoned session tracked");
    } catch (error) {
      console.error("Error tracking abandoned session:", error);
    }
  }, [email, vorname, nachname, firma, wohnsitzland, propertyData]);

  // Track session when email is entered (with debounce)
  useEffect(() => {
    if (!email || !email.includes("@")) return;
    
    const timer = setTimeout(() => {
      trackAbandonedSession();
    }, 1500); // Debounce 1.5 seconds

    return () => clearTimeout(timer);
  }, [email, trackAbandonedSession]);

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
      const { data: orderResult, error } = await supabase.functions.invoke(
        "create-order",
        {
          body: {
            katastralgemeinde: propertyData.katastralgemeinde,
            grundstuecksnummer: propertyData.grundstuecksnummer,
            grundbuchsgericht: propertyData.grundbuchsgericht,
            bundesland: propertyData.bundesland,
            wohnungs_hinweis: propertyData.wohnungsHinweis || null,
            adresse: propertyData.adresse || null,
            plz: propertyData.plz || null,
            ort: propertyData.ort || null,
            vorname: formData.vorname,
            nachname: formData.nachname,
            email: formData.email,
            wohnsitzland: formData.wohnsitzland,
            firma: formData.firma || null,
            product_name: "Aktueller Grundbuchauszug",
            product_price: 19.9,
          },
        }
      );

      if (error) throw error;
      if (!orderResult?.id || !orderResult?.order_number) {
        throw new Error("Order creation failed");
      }

      // Trigger document delivery via edge function (this also marks session as completed)
      const { error: deliveryError } = await supabase.functions.invoke(
        "send-grundbuch-document",
        { body: { orderId: orderResult.id, sessionId: sessionIdRef.current } }
      );

      if (deliveryError) {
        console.error("Document delivery error:", deliveryError);
      }

      // Clear session ID on successful order
      sessionStorage.removeItem("grundbuch_session_id");

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Order Summary Card */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 md:px-6 border-b bg-gradient-to-r from-muted/50 to-muted/30">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Bestellübersicht</h2>
        </div>
        
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-xl">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Aktueller Grundbuchauszug</p>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="truncate">KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {propertyData.bundesland} • {propertyData.grundbuchsgericht}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-xl text-foreground">€19,90</p>
              <p className="text-xs text-muted-foreground">inkl. USt.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Card */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 md:px-6 border-b bg-gradient-to-r from-muted/50 to-muted/30">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Kontakt & Zustellung</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Der Grundbuchauszug wird an Ihre E-Mail-Adresse versendet
          </p>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vorname" className="text-sm font-medium text-foreground">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="vorname" 
                {...register("vorname")} 
                placeholder="Max"
                className="h-12 md:h-11 text-base bg-background border-border/60 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {errors.vorname && (
                <p className="text-sm text-destructive font-medium">{errors.vorname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nachname" className="text-sm font-medium text-foreground">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="nachname" 
                {...register("nachname")} 
                placeholder="Mustermann"
                className="h-12 md:h-11 text-base bg-background border-border/60 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {errors.nachname && (
                <p className="text-sm text-destructive font-medium">{errors.nachname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/70" />
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="max.mustermann@email.at"
                className="pl-11 h-12 md:h-11 text-base bg-background border-border/60 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailConfirm" className="text-sm font-medium text-foreground">
              E-Mail-Adresse bestätigen <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/70" />
              <Input 
                id="emailConfirm" 
                type="email" 
                {...register("emailConfirm")} 
                placeholder="E-Mail-Adresse wiederholen"
                className="pl-11 h-12 md:h-11 text-base bg-background border-border/60 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            {errors.emailConfirm && (
              <p className="text-sm text-destructive font-medium">{errors.emailConfirm.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wohnsitzland" className="text-sm font-medium text-foreground">
                Wohnsitzland <span className="text-destructive">*</span>
              </Label>
              <Select
                value={wohnsitzland}
                onValueChange={(value) =>
                  setValue("wohnsitzland", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-12 md:h-11 text-base bg-background border-border/60 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="py-2.5 text-base cursor-pointer">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wohnsitzland && (
                <p className="text-sm text-destructive font-medium">{errors.wohnsitzland.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firma" className="text-sm font-medium text-muted-foreground">
                Firma <span className="text-xs font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground/70" />
                <Input 
                  id="firma" 
                  {...register("firma")} 
                  placeholder="Firmenname"
                  className="pl-11 h-12 md:h-11 text-base bg-background border-border/60 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Confirmation Card */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 md:px-6 border-b bg-gradient-to-r from-muted/50 to-muted/30">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Zahlung & Bestätigung</h2>
        </div>

        <div className="p-5 md:p-6 space-y-5">
          {/* Payment Method */}
          <div className="p-4 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-xl">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">Zahlung auf Rechnung</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Empfohlen
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Die Rechnung wird per E-Mail an {email || "Ihre E-Mail-Adresse"} übermittelt.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Confirmations */}
          <div className="space-y-3 pt-1">
            <div 
              className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                confirmTerms 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/50 hover:border-border hover:bg-muted/30"
              }`}
              onClick={() => setConfirmTerms(!confirmTerms)}
            >
              <Checkbox
                id="confirmTerms"
                checked={confirmTerms}
                onCheckedChange={(checked) => setConfirmTerms(checked as boolean)}
                className="mt-0.5 h-5 w-5 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="confirmTerms" className="font-normal text-sm leading-relaxed cursor-pointer text-foreground/90">
                Ich habe die <a href="/agb" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>Datenschutzerklärung</a> gelesen und akzeptiere diese. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div 
              className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                confirmNoRefund 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-border/50 hover:border-border hover:bg-muted/30"
              }`}
              onClick={() => setConfirmNoRefund(!confirmNoRefund)}
            >
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked as boolean)}
                className="mt-0.5 h-5 w-5 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-sm leading-relaxed cursor-pointer text-foreground/90">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Price Summary */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Zwischensumme</span>
              <span className="font-medium">€16,58</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">USt. (20%)</span>
              <span className="font-medium">€3,32</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <span className="text-lg font-semibold text-foreground">Gesamtbetrag</span>
              <span className="text-2xl font-bold text-foreground">€19,90</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3">
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 text-base px-5 rounded-xl border-border/60 hover:bg-muted/50"
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 px-6 text-base font-semibold shadow-md hover:shadow-lg transition-all rounded-xl bg-primary hover:bg-primary/90"
              disabled={isSubmitting || !allConfirmed}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2.5">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Bestellung wird verarbeitet...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Kostenpflichtig bestellen
                </span>
              )}
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Sichere Bestellung • SSL-verschlüsselt</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center animate-scale-in">
            <div className="relative mx-auto w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <FileText className="absolute inset-0 m-auto h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Bestellung wird verarbeitet
            </h3>
            <p className="text-sm text-muted-foreground">
              Ihr Grundbuchauszug wird angefordert. Bitte warten Sie einen Moment...
            </p>
          </div>
        </div>
      )}
    </form>
  );
}