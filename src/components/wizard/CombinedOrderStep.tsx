import { useState, useEffect, useCallback, useRef } from "react";
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


import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";
import { 
  FileText, Info, Clock, Shield, 
  Mail, Building2, MapPin, Loader2, Check, BadgeCheck 
} from "lucide-react";
import grundbuchPreview from "@/assets/grundbuch-preview.jpg";

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

const bundeslaender = [
  "Wien",
  "Niederösterreich",
  "Oberösterreich",
  "Salzburg",
  "Tirol",
  "Vorarlberg",
  "Kärnten",
  "Steiermark",
  "Burgenland",
];

const combinedSchema = z.object({
  // Property fields - address
  strasse: z.string().min(1, "Straße und Hausnummer ist erforderlich").max(200),
  plz: z.string().min(1, "PLZ ist erforderlich").max(10),
  ort: z.string().min(1, "Ort ist erforderlich").max(100),
  bundesland: z.string().min(1, "Bundesland ist erforderlich"),
  katastralgemeinde: z.string().max(100).optional(),
  grundstuecksnummer: z.string().max(50).optional(),
  grundbuchsgericht: z.string().max(100).optional(),
  wohnungsHinweis: z.string().max(200).optional(),
  // Applicant fields
  vorname: z.string().min(1, "Vorname ist erforderlich").max(50),
  nachname: z.string().min(1, "Nachname ist erforderlich").max(50),
  email: z.string().email("Ungültige E-Mail-Adresse").max(100).transform(v => v.toLowerCase()),
  emailConfirm: z.string().email("Ungültige E-Mail-Adresse").max(100).transform(v => v.toLowerCase()),
  wohnsitzland: z.string().min(1, "Wohnsitzland ist erforderlich"),
  firma: z.string().max(100).optional(),
}).refine((data) => data.email === data.emailConfirm, {
  message: "E-Mail-Adressen stimmen nicht überein",
  path: ["emailConfirm"],
});

type FormData = z.infer<typeof combinedSchema>;

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

interface CombinedOrderStepProps {
  initialPropertyData: PropertyData;
  initialApplicantData: ApplicantData;
  onSubmit: (orderNumber: string, email: string, propertyInfo: string, totalPrice?: string) => void;
}

export function CombinedOrderStep({
  initialPropertyData,
  initialApplicantData,
  onSubmit,
}: CombinedOrderStepProps) {
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [confirmNoRefund, setConfirmNoRefund] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [digitalStorage, setDigitalStorage] = useState(false);
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
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      ...initialPropertyData,
      ...initialApplicantData,
      emailConfirm: initialApplicantData.email,
    },
  });

  const bundesland = watch("bundesland");
  const strasse = watch("strasse");
  const plz = watch("plz");
  const ort = watch("ort");
  const email = watch("email");
  const vorname = watch("vorname");
  const nachname = watch("nachname");
  const firma = watch("firma");
  const wohnsitzland = watch("wohnsitzland");

  // Track abandoned session when form data changes
  const trackAbandonedSession = useCallback(async () => {
    if (!email || !email.includes("@")) return;
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
          bundesland,
          wohnungsHinweis: watch("wohnungsHinweis"),
          adresse: strasse || "",
          plz: plz || "",
          ort: ort || "",
          productName: "Aktueller Grundbuchauszug",
          productPrice: 28.90,
          step: 1,
        },
      });
    } catch (error) {
      console.error("Error tracking abandoned session:", error);
    }
  }, [email, vorname, nachname, firma, wohnsitzland, bundesland, strasse, plz, ort, watch]);

  useEffect(() => {
    if (!email || !email.includes("@")) return;
    const timer = setTimeout(() => {
      trackAbandonedSession();
    }, 1500);
    return () => clearTimeout(timer);
  }, [email, trackAbandonedSession]);

  const allConfirmed = confirmTerms && confirmNoRefund;
  const hasPropertyData = !!(strasse && plz && ort && bundesland);

  const handleFormSubmit = async (formData: FormData) => {
    if (!hasPropertyData) {
      toast({
        title: "Grundstück erforderlich",
        description: "Bitte wählen Sie ein Grundstück aus.",
        variant: "destructive",
      });
      return;
    }

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
            katastralgemeinde: formData.katastralgemeinde || "",
            grundstuecksnummer: formData.grundstuecksnummer || "",
            grundbuchsgericht: formData.grundbuchsgericht || "",
            bundesland: formData.bundesland,
            wohnungs_hinweis: formData.wohnungsHinweis || null,
            adresse: formData.strasse || null,
            plz: formData.plz || null,
            ort: formData.ort || null,
            vorname: formData.vorname,
            nachname: formData.nachname,
            email: formData.email,
            wohnsitzland: formData.wohnsitzland,
            firma: formData.firma || null,
            product_name: "Aktueller Grundbuchauszug",
            product_price: (fastDelivery ? 38.85 : 28.90) + (digitalStorage ? 7.95 : 0),
            fast_delivery: fastDelivery,
            digital_storage_subscription: digitalStorage,
          },
        }
      );

      if (error) throw error;
      if (!orderResult?.id || !orderResult?.order_number) {
        throw new Error("Order creation failed");
      }

      const { error: deliveryError } = await supabase.functions.invoke(
        "send-grundbuch-document",
        { body: { orderId: orderResult.id, sessionId: sessionIdRef.current } }
      );

      if (deliveryError) {
        console.error("Document delivery error:", deliveryError);
      }

      sessionStorage.removeItem("grundbuch_session_id");
      
      // Build property info string
      const propertyInfo = [strasse, plz, ort].filter(Boolean).join(', ');
      
      const totalPrice = ((fastDelivery ? 38.85 : 28.90) + (digitalStorage ? 7.95 : 0)).toFixed(2);
      onSubmit(orderResult.order_number, formData.email, propertyInfo, totalPrice);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-in" data-testid="combined-order-step">
      {/* Product Header + Address Search Card */}
      <div className="bg-card rounded shadow-lg overflow-hidden">
        <div className="px-6 py-5 lg:px-8 lg:py-6 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight font-serif leading-tight">
            Grundbuchauszug anfordern
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aktueller, vollständiger Auszug aus dem österreichischen Grundbuch
          </p>
        </div>

        {/* Property Address - Manual Input */}
        <div className="p-6 lg:p-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strasse" className="text-sm font-medium text-foreground">
              Straße und Hausnummer <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="strasse"
                {...register("strasse")}
                placeholder="z.B. Hauptstraße 1"
                className="pl-9"
              />
            </div>
            {errors.strasse && (
              <p className="text-xs text-destructive">{errors.strasse.message}</p>
            )}
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="plz" className="text-sm font-medium text-foreground">
                PLZ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="plz"
                {...register("plz")}
                placeholder="1010"
              />
              {errors.plz && (
                <p className="text-xs text-destructive">{errors.plz.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ort" className="text-sm font-medium text-foreground">
                Ort <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ort"
                {...register("ort")}
                placeholder="Wien"
              />
              {errors.ort && (
                <p className="text-xs text-destructive">{errors.ort.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bundesland" className="text-sm font-medium text-foreground">
              Bundesland <span className="text-destructive">*</span>
            </Label>
            <Select
              value={bundesland}
              onValueChange={(value) =>
                setValue("bundesland", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Bundesland auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {bundeslaender.map((bl) => (
                  <SelectItem key={bl} value={bl} className="text-sm">
                    {bl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bundesland && (
              <p className="text-xs text-destructive">{errors.bundesland.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Details Card */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Kontaktdaten</h2>
        </div>

        <div className="p-4 lg:p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Der Grundbuchauszug wird per E-Mail an Sie versendet.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vorname" className="text-sm font-medium text-foreground">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="vorname" 
                {...register("vorname")} 
                placeholder="Max"
              />
              {errors.vorname && (
                <p className="text-xs text-destructive">{errors.vorname.message}</p>
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
              />
              {errors.nachname && (
                <p className="text-xs text-destructive">{errors.nachname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              E-Mail-Adresse <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="max.mustermann@email.at"
                className="pl-9"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailConfirm" className="text-sm font-medium text-foreground">
              E-Mail-Adresse bestätigen <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input 
                id="emailConfirm" 
                type="email" 
                {...register("emailConfirm")} 
                placeholder="E-Mail-Adresse wiederholen"
                className="pl-9"
              />
            </div>
            {errors.emailConfirm && (
              <p className="text-xs text-destructive">{errors.emailConfirm.message}</p>
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
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="text-sm">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wohnsitzland && (
                <p className="text-xs text-destructive">{errors.wohnsitzland.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firma" className="text-sm font-medium text-muted-foreground">
                Firma <span className="text-xs font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  id="firma" 
                  {...register("firma")} 
                  placeholder="Firmenname"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Options Card */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Lieferoption</h2>
        </div>

        <div className="p-4 lg:p-6 space-y-3">
          <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Standard: Zustellung innerhalb von 24 Stunden per E-Mail</span>
          </div>

          {/* Express Delivery Upsell Checkbox */}
          <label
            htmlFor="fastDelivery"
            className={`block p-4 rounded-lg border-2 transition-all cursor-pointer ${
              fastDelivery
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="fastDelivery"
                checked={fastDelivery}
                onCheckedChange={(checked) => setFastDelivery(checked === true)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Express-Zustellung
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Schnell</span>
                  </span>
                  <span className="text-sm font-bold text-foreground">+ €9,95</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Lieferung innerhalb von 1 Stunde per E-Mail</p>
              </div>
            </div>
          </label>

          {/* Digital Storage Upsell */}
          <label
            htmlFor="digitalStorage"
            className={`block p-4 rounded-lg border-2 transition-all cursor-pointer ${
              digitalStorage
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id="digitalStorage"
                checked={digitalStorage}
                onCheckedChange={(checked) => setDigitalStorage(checked === true)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Digitale Speicherung
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">Abo</span>
                  </span>
                  <span className="text-sm font-bold text-foreground">+ €7,95/Monat</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Sichere Online-Speicherung Ihres Auszugs mit digitalem Zugriff</p>
              </div>
            </div>
          </label>
        </div>
      </div>
      {/* Payment & Confirmation Card */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Zahlung & Bestätigung</h2>
        </div>

        <div className="p-4 lg:p-6 space-y-4">
          {/* Payment Info - Clean minimal style */}
          <div className="space-y-2 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Grundbuchauszug</span>
              <span className="text-sm text-foreground">€28,90</span>
            </div>
            {fastDelivery && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Express-Zustellung</span>
                <span className="text-sm text-foreground">€9,95</span>
              </div>
            )}
            {digitalStorage && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Digitale Speicherung (monatl.)</span>
                <span className="text-sm text-foreground">€7,95</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Zahlung auf Rechnung</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  inkl. 20% MwSt.
                </p>
              </div>
              <span className="text-xl font-bold text-foreground">€{((fastDelivery ? 38.85 : 28.90) + (digitalStorage ? 7.95 : 0)).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          

          {/* Legal Confirmations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 -mx-3 rounded hover:bg-muted/30 transition-colors">
              <Checkbox
                id="confirmTerms"
                checked={confirmTerms}
                onCheckedChange={(checked) => setConfirmTerms(checked === true)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
              />
              <Label htmlFor="confirmTerms" className="font-normal text-xs leading-relaxed cursor-pointer">
                Ich habe die <a href="/agb" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>Datenschutzerklärung</a> gelesen und akzeptiere diese. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 -mx-3 rounded hover:bg-muted/30 transition-colors">
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked === true)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-xs leading-relaxed cursor-pointer">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold shadow-lg"
            disabled={isSubmitting || !allConfirmed || !hasPropertyData}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Wird verarbeitet...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline">Kostenpflichtig bestellen</span>
                <span className="sm:hidden">Bestellen</span>
              </span>
            )}
          </Button>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Sichere Bestellung • SSL-verschlüsselt</span>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
            <Shield className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>SSL-verschlüsselt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>Sofortige Zustellung</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>Amtlich beglaubigt</span>
        </div>
      </div>


      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded p-8 shadow-xl max-w-sm mx-4 text-center">
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
