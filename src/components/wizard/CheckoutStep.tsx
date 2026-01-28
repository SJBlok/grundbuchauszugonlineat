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
import { ArrowLeft, Mail, Building2, MapPin, FileText, Loader2, Check, Shield, Clock, BadgeCheck, CheckCircle2 } from "lucide-react";
import grundbuchPreview from "@/assets/grundbuch-preview.jpg";
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" data-testid="checkout-step">
      {/* Order Summary Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-muted/60 px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-4 bg-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Ihre Bestellung</h2>
          </div>
          <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm">
            <span className="text-xs font-semibold">Offiziell</span>
          </div>
        </div>
        
        <div className="p-4">
          {/* Product Header with Preview */}
          <div className="flex items-start gap-4">
            {/* Document Preview */}
            <div className="hidden sm:block shrink-0">
              <div className="w-16 h-22 bg-muted/30 border border-border rounded-sm overflow-hidden shadow-sm">
                <img 
                  src={grundbuchPreview} 
                  alt="Grundbuchauszug Beispiel" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm">Aktueller Grundbuchauszug</h3>
              <p className="text-xs text-muted-foreground mt-1">Vollständiger Auszug mit allen drei Blättern:</p>
              
              {/* Blatt Info */}
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  <span><span className="font-medium text-foreground">A-Blatt</span> – Grundstücksdaten & Flächen</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  <span><span className="font-medium text-foreground">B-Blatt</span> – Eigentümer & Anteile</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  <span><span className="font-medium text-foreground">C-Blatt</span> – Lasten & Beschränkungen</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Property Details - Highlighted */}
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-sm p-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-sm flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Grundstück</p>
                <p className="font-semibold text-foreground text-sm">
                  KG {propertyData.katastralgemeinde}, EZ/GST {propertyData.grundstuecksnummer}
                </p>
                {propertyData.adresse && (
                  <p className="text-foreground text-sm mt-1">
                    {propertyData.adresse}{propertyData.plz || propertyData.ort ? `, ${propertyData.plz} ${propertyData.ort}` : ''}
                  </p>
                )}
                <p className="text-muted-foreground text-xs mt-1">
                  {propertyData.bundesland} • {propertyData.grundbuchsgericht}
                </p>
                {propertyData.wohnungsHinweis && (
                  <p className="text-muted-foreground text-xs mt-1">
                    Hinweis: {propertyData.wohnungsHinweis}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trust Features */}
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Sofort per E-Mail</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Amtlich beglaubigt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Card */}
      <div className="bg-white border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Kontakt</h2>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Der Grundbuchauszug wird per E-Mail an Sie versendet.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vorname" className="text-sm font-medium">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="vorname" 
                {...register("vorname")} 
                placeholder="Max"
                className="h-12 text-base bg-white border-border"
              />
              {errors.vorname && (
                <p className="text-sm text-destructive">{errors.vorname.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nachname" className="text-sm font-medium">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="nachname" 
                {...register("nachname")} 
                placeholder="Mustermann"
                className="h-12 text-base bg-white border-border"
              />
              {errors.nachname && (
                <p className="text-sm text-destructive">{errors.nachname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              E-Mail-Adresse <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="max.mustermann@email.at"
                className="pl-10 h-12 text-base bg-white border-border"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emailConfirm" className="text-sm font-medium">
              E-Mail-Adresse bestätigen <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="emailConfirm" 
                type="email" 
                {...register("emailConfirm")} 
                placeholder="E-Mail-Adresse wiederholen"
                className="pl-10 h-12 text-base bg-white border-border"
              />
            </div>
            {errors.emailConfirm && (
              <p className="text-sm text-destructive">{errors.emailConfirm.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="wohnsitzland" className="text-sm font-medium">
                Wohnsitzland <span className="text-destructive">*</span>
              </Label>
              <Select
                value={wohnsitzland}
                onValueChange={(value) =>
                  setValue("wohnsitzland", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="h-12 text-base bg-white border-border">
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="py-3 text-base">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wohnsitzland && (
                <p className="text-sm text-destructive">{errors.wohnsitzland.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="firma" className="text-sm font-medium text-muted-foreground">
                Firma <span className="text-sm font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="firma" 
                  {...register("firma")} 
                  placeholder="Firmenname"
                  className="pl-10 h-12 text-base bg-white border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Confirmation Card */}
      <div className="bg-white border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Zahlung</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Payment Method Info */}
          <div className="bg-info border border-primary/15 p-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-foreground">
                <span className="font-semibold">Zahlung auf Rechnung:</span>{" "}
                Die Rechnung wird per E-Mail übermittelt.
              </p>
              <span className="text-lg font-bold text-foreground shrink-0">€19,90</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-primary/10">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-xs font-medium text-primary">
                Sofortige Zustellung per E-Mail nach Bestellung
              </p>
            </div>
          </div>

          {/* Legal Confirmations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setConfirmTerms(!confirmTerms)}>
              <Checkbox
                id="confirmTerms"
                checked={confirmTerms}
                onCheckedChange={(checked) => setConfirmTerms(checked as boolean)}
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <Label htmlFor="confirmTerms" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich habe die <a href="/agb" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>Datenschutzerklärung</a> gelesen und akzeptiere diese. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setConfirmNoRefund(!confirmNoRefund)}>
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked as boolean)}
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 text-base px-5"
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button
              type="submit"
              className="flex-1 h-14 px-6 text-base font-semibold"
              disabled={isSubmitting || !allConfirmed}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Wird verarbeitet...
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
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Sichere Bestellung • SSL-verschlüsselt</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border rounded-lg p-8 shadow-xl max-w-sm mx-4 text-center">
            <div className="relative mx-auto w-16 h-16 mb-5">
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