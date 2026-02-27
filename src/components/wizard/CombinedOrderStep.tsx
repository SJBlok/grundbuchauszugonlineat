import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";
import { 
  FileText, Info, Clock, Shield, 
  Mail, MapPin, Loader2, Check, BadgeCheck 
} from "lucide-react";
import grundbuchPreview from "@/assets/grundbuch-preview.jpg";
import grundbuchPage1 from "@/assets/grundbuch-example-fictitious.jpg";
import grundbuchPage2 from "@/assets/grundbuch-example-page2.jpg";

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
}).refine((data) => data.email === data.emailConfirm, {
  message: "E-Mail-Adressen stimmen nicht überein",
  path: ["emailConfirm"],
});

type FormData = z.infer<typeof combinedSchema>;


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
  }, [email, vorname, nachname, bundesland, strasse, plz, ort, watch]);

  useEffect(() => {
    if (!email || !email.includes("@")) return;
    const timer = setTimeout(() => {
      trackAbandonedSession();
    }, 1500);
    return () => clearTimeout(timer);
  }, [email, trackAbandonedSession]);

  const allConfirmed = true;
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
            wohnsitzland: "Österreich",
            firma: null,
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight font-serif leading-tight">
                Grundbuchauszug anfordern
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Aktueller, vollständiger Auszug aus dem österreichischen Grundbuch. Enthält <span className="font-medium text-foreground">A-Blatt</span> (Grundstücke &amp; Flächen), <span className="font-medium text-foreground">B-Blatt</span> (Eigentümer) und <span className="font-medium text-foreground">C-Blatt</span> (Hypotheken &amp; Lasten).
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="shrink-0 group flex sm:flex-col items-center gap-3 sm:gap-0 sm:text-center cursor-pointer rounded-lg border border-border/50 p-2 sm:border-0 sm:p-0 hover:bg-muted/30 sm:hover:bg-transparent transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img 
                        src={grundbuchPreview} 
                        alt="Beispiel Grundbuchauszug" 
                        className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded border border-border shadow-sm group-hover:shadow-md transition-shadow"
                      />
                    </div>
                    <div className="flex sm:hidden items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-serif font-bold text-sm">
                      GB
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-serif font-bold text-lg">
                      GB
                    </div>
                  </div>
                  <span className="text-xs sm:text-[10px] text-muted-foreground group-hover:text-primary transition-colors sm:mt-1">Beispiel ansehen →</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Beispiel Grundbuchauszug</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  So sieht ein Grundbuchauszug aus. Die gezeigten Daten sind fiktiv.
                </p>
                <div className="space-y-4">
                  <img src={grundbuchPage1} alt="Grundbuchauszug Seite 1" className="w-full rounded border border-border" />
                  <img src={grundbuchPage2} alt="Grundbuchauszug Seite 2" className="w-full rounded border border-border" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
            <select
              id="bundesland"
              value={bundesland || ""}
              onChange={(e) =>
                setValue("bundesland", e.target.value, { shouldValidate: true })
              }
              className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Bundesland auswählen...</option>
              {bundeslaender.map((bl) => (
                <option key={bl} value={bl}>
                  {bl}
                </option>
              ))}
            </select>
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
          <div
            onClick={() => setFastDelivery(!fastDelivery)}
            className={`block p-4 rounded-lg border-2 transition-all cursor-pointer select-none ${
              fastDelivery
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="fastDelivery"
                checked={fastDelivery}
                readOnly
                className="mt-0.5 h-5 w-5 shrink-0 pointer-events-none accent-[hsl(var(--primary))] rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Express-Zustellung
                  </span>
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">+ € 9,95</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lieferung innerhalb von 1 Stunde per E-Mail</p>
              </div>
            </div>
          </div>

          {/* Digital Storage Upsell */}
          <div
            onClick={() => setDigitalStorage(!digitalStorage)}
            className={`block p-4 rounded-lg border-2 transition-all cursor-pointer select-none ${
              digitalStorage
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="digitalStorage"
                checked={digitalStorage}
                readOnly
                className="mt-0.5 h-5 w-5 shrink-0 pointer-events-none accent-[hsl(var(--primary))] rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Digitale Speicherung
                  </span>
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">+ € 7,95 <span className="text-xs font-normal text-muted-foreground">/ Monat</span></span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sichere Online-Speicherung mit digitalem Zugriff · <span className="font-medium text-foreground">Jederzeit kündbar</span></p>
              </div>
            </div>
          </div>
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
          

          {/* Legal Notice */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Bei Bestellung akzeptieren Sie:</p>
            <div className="flex items-start gap-2 px-3 py-2 rounded bg-muted/30">
              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                die <a href="/agb" target="_blank" className="text-primary font-medium hover:underline">AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary font-medium hover:underline">Datenschutzerklärung</a>. Die Bestellung wird sofort bearbeitet. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr.
              </p>
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
