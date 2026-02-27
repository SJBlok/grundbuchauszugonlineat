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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const products = [
  {
    id: "aktuell",
    name: "Grundbuchauszug aktuell",
    description: "Aktueller, vollständiger Auszug mit A-Blatt, B-Blatt und C-Blatt.",
    price: 28.80,
    badge: "Meistgewählt",
  },
  {
    id: "historisch",
    name: "Grundbuchauszug historisch",
    description: "Vollständiger Auszug inkl. aller gelöschten Eintragungen seit der Grundbuchsanlegung. Zeigt frühere Eigentümer, alte Hypotheken und historische Änderungen.",
    price: 19.80,
  },
  {
    id: "kombi",
    name: "Grundbuch Kombi-Pack",
    description: "Aktueller und historischer Auszug gemeinsam bestellen. Enthält beide Dokumente zum Vorteilspreis.",
    price: 42.20,
    originalPrice: 48.60,
    savings: 6.40,
  },
];

const combinedSchema = z.object({
  strasse: z.string().min(1, "Straße ist erforderlich").max(200),
  hausnummer: z.string().max(20).optional(),
  plz: z.string().min(1, "PLZ ist erforderlich").max(10),
  ort: z.string().min(1, "Ort ist erforderlich").max(100),
  bundesland: z.string().min(1, "Bundesland ist erforderlich"),
  katastralgemeinde: z.string().max(100).optional(),
  grundstuecksnummer: z.string().max(50).optional(),
  grundbuchsgericht: z.string().max(100).optional(),
  wohnungsHinweis: z.string().max(200).optional(),
  vorname: z.string().min(1, "Vorname ist erforderlich").max(50),
  nachname: z.string().min(1, "Nachname ist erforderlich").max(50),
  email: z.string().email("Ungültige E-Mail-Adresse").max(100).transform(v => v.toLowerCase()),
  emailConfirm: z.string().email("Ungültige E-Mail-Adresse").max(100).transform(v => v.toLowerCase()),
}).refine((data) => data.email === data.emailConfirm, {
  message: "E-Mail-Adressen stimmen nicht überein",
  path: ["emailConfirm"],
});

type FormData = z.infer<typeof combinedSchema>;

const GBIcon = () => (
  <div className="w-14 h-16 rounded-md border border-border flex flex-col items-center justify-center bg-muted/30 relative overflow-hidden">
    <div className="absolute top-1 left-1.5 right-1.5">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="h-0.5 bg-border rounded-full mb-0.5" style={{ width: i === 3 ? '60%' : '100%' }} />
      ))}
    </div>
    <span className="text-xl font-bold text-foreground mt-2">GB</span>
  </div>
);

interface CombinedOrderStepProps {
  initialPropertyData: PropertyData;
  initialApplicantData: ApplicantData;
  onSubmit: (orderNumber: string, email: string, propertyInfo: string, totalPrice?: string, fastDelivery?: boolean) => void;
}

export function CombinedOrderStep({
  initialPropertyData,
  initialApplicantData,
  onSubmit,
}: CombinedOrderStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("aktuell");
  const [signatur, setSignatur] = useState(false);
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
      hausnummer: "",
      emailConfirm: initialApplicantData.email,
    },
  });

  const bundesland = watch("bundesland");
  const strasse = watch("strasse");
  const hausnummer = watch("hausnummer");
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
          adresse: [strasse, hausnummer].filter(Boolean).join(" ") || "",
          plz: plz || "",
          ort: ort || "",
          productName: selectedProduct === "historisch" ? "Grundbuchauszug historisch" : "Aktueller Grundbuchauszug",
          productPrice: basePrice,
          step: 1,
        },
      });
    } catch (error) {
      console.error("Error tracking abandoned session:", error);
    }
  }, [email, vorname, nachname, bundesland, strasse, plz, ort, watch, selectedProduct]);

  useEffect(() => {
    if (!email || !email.includes("@")) return;
    const timer = setTimeout(() => {
      trackAbandonedSession();
    }, 1500);
    return () => clearTimeout(timer);
  }, [email, trackAbandonedSession]);

  const basePrice = products.find(p => p.id === selectedProduct)?.price || 28.90;
  const total = basePrice + (signatur ? 2.95 : 0) + (fastDelivery ? 9.95 : 0) + (digitalStorage ? 7.95 : 0);
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
      const productName = selectedProduct === "kombi" ? "Grundbuch Kombi-Pack" : selectedProduct === "historisch" ? "Grundbuchauszug historisch" : "Aktueller Grundbuchauszug";
      const { data: orderResult, error } = await supabase.functions.invoke(
        "create-order",
        {
          body: {
            katastralgemeinde: formData.katastralgemeinde || "",
            grundstuecksnummer: formData.grundstuecksnummer || "",
            grundbuchsgericht: formData.grundbuchsgericht || "",
            bundesland: formData.bundesland,
            wohnungs_hinweis: formData.wohnungsHinweis || null,
            adresse: [formData.strasse, formData.hausnummer].filter(Boolean).join(" ") || null,
            plz: formData.plz || null,
            ort: formData.ort || null,
            vorname: formData.vorname,
            nachname: formData.nachname,
            email: formData.email,
            wohnsitzland: "Österreich",
            firma: null,
            product_name: productName,
            product_price: total,
            fast_delivery: fastDelivery,
            digital_storage_subscription: digitalStorage,
            amtliche_signatur: signatur,
          },
        }
      );

      if (error) throw error;
      if (!orderResult?.id || !orderResult?.order_number) {
        throw new Error("Order creation failed");
      }

      sessionStorage.removeItem("grundbuch_session_id");
      const propertyInfo = [[strasse, hausnummer].filter(Boolean).join(" "), plz, ort].filter(Boolean).join(", ");
      onSubmit(orderResult.order_number, formData.email, propertyInfo, total.toFixed(2), fastDelivery);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-3 animate-fade-in" data-testid="combined-order-step">
      
      {/* ── Header Card ── */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6 lg:p-7">
        <div className="flex gap-5 items-start">
          <div className="flex-1">
            <h1 className="text-xl lg:text-[22px] font-bold text-foreground tracking-tight leading-tight">
              Grundbuchauszug anfordern
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Aktueller, vollständiger Auszug aus dem österreichischen Grundbuch. Enthält{' '}
              <strong className="text-foreground">A-Blatt</strong> (Grundstücke &amp; Flächen),{' '}
              <strong className="text-foreground">B-Blatt</strong> (Eigentümer) und{' '}
              <strong className="text-foreground">C-Blatt</strong> (Hypotheken &amp; Lasten).
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group">
                <GBIcon />
                <span className="text-[11px] text-primary font-medium group-hover:underline">Beispiel ansehen →</span>
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

      {/* ── Product Selection Card ── */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6 lg:p-7">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Produkt wählen
        </div>
        <div className="flex flex-col gap-2.5">
          {products.map((product) => {
            const isSelected = selectedProduct === product.id;
            const isHighlighted = product.id === "aktuell";
            return (
              <label
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`flex items-start gap-3.5 p-4 sm:p-4 rounded-lg border-[1.5px] cursor-pointer transition-all min-h-[56px] ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : isHighlighted
                    ? "border-primary/30 bg-primary/[0.02] hover:border-primary/50"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                {/* Radio */}
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  isSelected ? "border-primary" : "border-muted-foreground/30"
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-foreground">{product.name}</span>
                      {product.badge && (
                        <span className="text-[11px] font-semibold text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full whitespace-nowrap leading-[18px]">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      {product.originalPrice && (
                        <span className="text-[13px] text-muted-foreground line-through tabular-nums">
                          € {product.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="text-[15px] font-bold text-foreground whitespace-nowrap tabular-nums">
                        € {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-1 leading-snug">{product.description}</p>
                  {product.savings && (
                    <p className="text-[12px] text-primary font-semibold mt-1">
                      Sie sparen € {product.savings.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Amtliche Signatur – inside product card */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div
            onClick={() => setSignatur(!signatur)}
            className="flex items-start gap-3.5 cursor-pointer select-none"
          >
            {/* Checkbox */}
            <div className={`w-5 h-5 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
              signatur ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"
            }`}>
              {signatur && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-[15px] font-semibold text-foreground">Amtliche Signatur</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    + € 2,95
                  </span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" onClick={(e) => e.stopPropagation()} className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="end" className="max-w-xs p-3 space-y-2">
                        <p className="text-xs leading-relaxed">Der Auszug kann elektronisch signiert werden.</p>
                        <p className="text-xs leading-relaxed">Auch ein Ausdruck dieses Dokuments hat in Folge die Beweiskraft einer öffentlichen Urkunde.</p>
                        <p className="text-xs leading-relaxed">Informationen zur Prüfung der elektronischen Signatur finden Sie unter: <a href="https://kundmachungen.justiz.gv.at/justizsignatur" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>kundmachungen.justiz.gv.at/justizsignatur</a></p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Address Card ── */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6 lg:p-7 space-y-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          Adresse des Grundstücks
        </div>

        <div className="grid grid-cols-[1fr_100px] sm:grid-cols-[1fr_110px] gap-3">
          <div className="space-y-2">
            <Label htmlFor="strasse" className="text-sm font-semibold text-foreground">
              Straße <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="strasse"
                {...register("strasse")}
                placeholder="z.B. Spiegelgasse"
                className="pl-9"
              />
            </div>
            {errors.strasse && <p className="text-xs text-destructive">{errors.strasse.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hausnummer" className="text-sm font-semibold text-foreground">
              Hausnr.
            </Label>
            <Input
              id="hausnummer"
              {...register("hausnummer")}
              placeholder="z.B. 7"
            />
          </div>
        </div>

        <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[120px_1fr] gap-3">
          <div className="space-y-2">
            <Label htmlFor="plz" className="text-sm font-semibold text-foreground">PLZ <span className="text-destructive">*</span></Label>
            <Input id="plz" {...register("plz")} placeholder="1010" />
            {errors.plz && <p className="text-xs text-destructive">{errors.plz.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ort" className="text-sm font-semibold text-foreground">Ort <span className="text-destructive">*</span></Label>
            <Input id="ort" {...register("ort")} placeholder="Wien" />
            {errors.ort && <p className="text-xs text-destructive">{errors.ort.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bundesland" className="text-sm font-semibold text-foreground">
            Bundesland <span className="text-destructive">*</span>
          </Label>
          <select
            id="bundesland"
            value={bundesland || ""}
            onChange={(e) => setValue("bundesland", e.target.value, { shouldValidate: true })}
            className="flex h-12 sm:h-11 w-full rounded border-[1.5px] border-input bg-background px-4 py-3 text-base sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/8 transition-all duration-200 hover:border-muted-foreground/30"
          >
            <option value="" disabled>Bundesland auswählen...</option>
            {bundeslaender.map((bl) => (
              <option key={bl} value={bl}>{bl}</option>
            ))}
          </select>
          {errors.bundesland && <p className="text-xs text-destructive">{errors.bundesland.message}</p>}
        </div>
      </div>

      {/* ── Contact Details Card ── */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6 lg:p-7 space-y-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          Kontaktdaten
        </div>
        <p className="text-sm text-muted-foreground">
          Der Grundbuchauszug wird per E-Mail an Sie versendet.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vorname" className="text-sm font-semibold text-foreground">Vorname <span className="text-destructive">*</span></Label>
            <Input id="vorname" {...register("vorname")} placeholder="Max" />
            {errors.vorname && <p className="text-xs text-destructive">{errors.vorname.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nachname" className="text-sm font-semibold text-foreground">Nachname <span className="text-destructive">*</span></Label>
            <Input id="nachname" {...register("nachname")} placeholder="Mustermann" />
            {errors.nachname && <p className="text-xs text-destructive">{errors.nachname.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">E-Mail-Adresse <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input id="email" type="email" {...register("email")} placeholder="max.mustermann@email.at" className="pl-9" />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailConfirm" className="text-sm font-semibold text-foreground">E-Mail-Adresse bestätigen <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input id="emailConfirm" type="email" {...register("emailConfirm")} placeholder="E-Mail-Adresse wiederholen" className="pl-9" />
          </div>
          {errors.emailConfirm && <p className="text-xs text-destructive">{errors.emailConfirm.message}</p>}
        </div>
      </div>


      {/* ── Delivery Options Card ── */}
      <div className="bg-card rounded-xl border border-border p-5 sm:p-6 lg:p-7 space-y-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          Lieferoption
        </div>
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Standard: Zustellung innerhalb von 24 Stunden per E-Mail</span>
        </div>

        {/* Express – highlighted */}
        <div
          onClick={() => setFastDelivery(!fastDelivery)}
          className={`relative flex items-start gap-3.5 p-4 rounded-lg border-[1.5px] cursor-pointer transition-all select-none min-h-[56px] ${
            fastDelivery ? "border-primary bg-primary/5" : "border-primary/40 bg-primary/[0.03] hover:border-primary/60"
          }`}
        >
          <span className="absolute -top-2.5 right-3 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Empfohlen
          </span>
          <div className={`w-5 h-5 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
            fastDelivery ? "border-primary bg-primary" : "border-primary/40 bg-background"
          }`}>
            {fastDelivery && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">Sofortige PDF-Zustellung per E-Mail</span>
              <span className="text-sm font-bold text-foreground whitespace-nowrap">+ € 9,95</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Direkter Versand Ihres Dokuments als PDF an Ihre E-Mail-Adresse.</p>
          </div>
        </div>

        {/* Digital Storage */}
        <div
          onClick={() => setDigitalStorage(!digitalStorage)}
          className={`flex items-start gap-3.5 p-4 rounded-lg border-[1.5px] cursor-pointer transition-all select-none min-h-[56px] ${
            digitalStorage ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className={`w-5 h-5 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${
            digitalStorage ? "border-primary bg-primary" : "border-muted-foreground/30 bg-background"
          }`}>
            {digitalStorage && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">Digitale Speicherung</span>
              <span className="text-sm font-bold text-foreground whitespace-nowrap">+ € 7,95 <span className="text-xs font-normal text-muted-foreground">/ Monat</span></span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sichere Online-Speicherung mit digitalem Zugriff · <span className="font-medium text-foreground">Jederzeit kündbar</span></p>
          </div>
        </div>
      </div>

      {/* ── Zahlung & Bestätigung Card ── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-6 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-widest">Zahlung & Bestätigung</h2>
        </div>

        <div className="p-6 lg:p-7 space-y-4">
          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedProduct === "historisch" ? "Grundbuchauszug historisch" : "Grundbuchauszug"}
              </span>
              <span className="text-sm text-foreground tabular-nums">€{basePrice.toFixed(2).replace('.', ',')}</span>
            </div>
            {signatur && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amtliche Signatur</span>
                <span className="text-sm text-foreground tabular-nums">€2,95</span>
              </div>
            )}
            {fastDelivery && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Express-Zustellung</span>
                <span className="text-sm text-foreground tabular-nums">€9,95</span>
              </div>
            )}
            {digitalStorage && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Digitale Speicherung (monatl.)</span>
                <span className="text-sm text-foreground tabular-nums">€7,95</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-baseline justify-between pt-3 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Zahlung auf Rechnung</p>
              <p className="text-xs text-muted-foreground mt-0.5">inkl. 20% MwSt.</p>
            </div>
            <span className="text-xl font-bold text-foreground tabular-nums">€{total.toFixed(2).replace('.', ',')}</span>
          </div>

          {/* Legal */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Bei Bestellung akzeptieren Sie:</p>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/30">
              <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                die <a href="/agb" target="_blank" className="text-primary font-medium hover:underline">AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary font-medium hover:underline">Datenschutzerklärung</a>. Die Bestellung wird sofort bearbeitet. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr.
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-14 sm:h-13 text-base sm:text-[15px] font-semibold shadow-lg"
            disabled={isSubmitting || !hasPropertyData}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Wird verarbeitet...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 shrink-0" />
                Kostenpflichtig bestellen
              </span>
            )}
          </Button>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Sichere Bestellung · SSL-verschlüsselt</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-xl p-8 shadow-xl max-w-sm mx-4 text-center">
            <div className="relative mx-auto w-16 h-16 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <FileText className="absolute inset-0 m-auto h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Bestellung wird verarbeitet</h3>
            <p className="text-sm text-muted-foreground">Ihr Grundbuchauszug wird angefordert. Bitte warten Sie einen Moment...</p>
          </div>
        </div>
      )}
    </form>
  );
}
