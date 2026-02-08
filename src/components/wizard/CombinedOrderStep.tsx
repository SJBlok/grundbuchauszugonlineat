import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressSearch } from "@/components/AddressSearch";
import { KatastralgemeindeCombobox } from "@/components/KatastralgemeindeCombobox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PropertyData, ApplicantData } from "@/pages/Anfordern";
import { 
  FileText, Info, Clock, Shield, HelpCircle, 
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

const combinedSchema = z.object({
  // Property fields
  katastralgemeinde: z.string().max(100).optional(),
  grundstuecksnummer: z.string().max(50).optional(),
  grundbuchsgericht: z.string().max(100).optional(),
  bundesland: z.string().optional(),
  wohnungsHinweis: z.string().max(200).optional(),
  // Applicant fields
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

interface AddressSearchResult {
  kgNummer: string;
  kgName: string;
  ez: string;
  gst: string;
  adresse: string;
  plz: string;
  ort: string;
  bundesland: string;
}

interface CombinedOrderStepProps {
  initialPropertyData: PropertyData;
  initialApplicantData: ApplicantData;
  onSubmit: (orderNumber: string, email: string, propertyInfo: string) => void;
}

export function CombinedOrderStep({
  initialPropertyData,
  initialApplicantData,
  onSubmit,
}: CombinedOrderStepProps) {
  const [activeTab, setActiveTab] = useState<string>("address");
  const [selectedFromSearch, setSelectedFromSearch] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedAddressData, setSelectedAddressData] = useState<AddressSearchResult | null>(null);
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
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      ...initialPropertyData,
      ...initialApplicantData,
      emailConfirm: initialApplicantData.email,
    },
  });

  const bundesland = watch("bundesland");
  const katastralgemeinde = watch("katastralgemeinde");
  const grundstuecksnummer = watch("grundstuecksnummer");
  const grundbuchsgericht = watch("grundbuchsgericht");
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
          katastralgemeinde,
          grundstuecksnummer,
          grundbuchsgericht,
          bundesland,
          wohnungsHinweis: watch("wohnungsHinweis"),
          adresse: selectedAddressData?.adresse || "",
          plz: selectedAddressData?.plz || "",
          ort: selectedAddressData?.ort || "",
          productName: "Aktueller Grundbuchauszug",
          productPrice: 19.90,
          step: 1,
        },
      });
    } catch (error) {
      console.error("Error tracking abandoned session:", error);
    }
  }, [email, vorname, nachname, firma, wohnsitzland, katastralgemeinde, grundstuecksnummer, grundbuchsgericht, bundesland, selectedAddressData, watch]);

  useEffect(() => {
    if (!email || !email.includes("@")) return;
    const timer = setTimeout(() => {
      trackAbandonedSession();
    }, 1500);
    return () => clearTimeout(timer);
  }, [email, trackAbandonedSession]);

  const handleAddressSelect = (result: AddressSearchResult) => {
    const addressDisplay = [result.adresse, result.plz, result.ort].filter(Boolean).join(", ");
    setSelectedAddress(addressDisplay);
    setSelectedAddressData(result);
    
    if (result.kgName || result.kgNummer) {
      setValue("katastralgemeinde", result.kgName || result.kgNummer, { shouldValidate: true });
    }
    if (result.gst || result.ez) {
      setValue("grundstuecksnummer", result.gst || result.ez, { shouldValidate: true });
    }
    if (result.bundesland) {
      setValue("bundesland", result.bundesland, { shouldValidate: true });
    }
    
    const gerichtMap: Record<string, string> = {
      "Wien": "Bezirksgericht Innere Stadt Wien",
      "Niederösterreich": "Bezirksgericht " + (result.ort || ""),
      "Oberösterreich": "Bezirksgericht " + (result.ort || ""),
      "Salzburg": "Bezirksgericht " + (result.ort || "Salzburg"),
      "Tirol": "Bezirksgericht " + (result.ort || "Innsbruck"),
      "Vorarlberg": "Bezirksgericht " + (result.ort || "Feldkirch"),
      "Kärnten": "Bezirksgericht " + (result.ort || "Klagenfurt"),
      "Steiermark": "Bezirksgericht " + (result.ort || "Graz"),
      "Burgenland": "Bezirksgericht " + (result.ort || "Eisenstadt"),
    };
    if (result.bundesland) {
      setValue("grundbuchsgericht", gerichtMap[result.bundesland] || "", { shouldValidate: true });
    }
    
    setSelectedFromSearch(true);
  };

  const allConfirmed = confirmTerms && confirmNoRefund;
  const hasPropertyData = selectedFromSearch || (katastralgemeinde && grundstuecksnummer);

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
            katastralgemeinde: formData.katastralgemeinde,
            grundstuecksnummer: formData.grundstuecksnummer,
            grundbuchsgericht: formData.grundbuchsgericht,
            bundesland: formData.bundesland,
            wohnungs_hinweis: formData.wohnungsHinweis || null,
            adresse: selectedAddressData?.adresse || null,
            plz: selectedAddressData?.plz || null,
            ort: selectedAddressData?.ort || null,
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

      const { error: deliveryError } = await supabase.functions.invoke(
        "send-grundbuch-document",
        { body: { orderId: orderResult.id, sessionId: sessionIdRef.current } }
      );

      if (deliveryError) {
        console.error("Document delivery error:", deliveryError);
      }

      sessionStorage.removeItem("grundbuch_session_id");
      
      // Build property info string
      const propertyInfo = [
        katastralgemeinde ? `KG ${katastralgemeinde}` : '',
        grundstuecksnummer ? `EZ/GST ${grundstuecksnummer}` : '',
        selectedAddress || ''
      ].filter(Boolean).join(', ');
      
      onSubmit(orderResult.order_number, formData.email, propertyInfo);
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
      {/* Product Header Card */}
      <div className="bg-card rounded shadow-lg overflow-hidden">
        <div className="px-6 py-8 lg:px-8 lg:py-10 border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent relative overflow-hidden">
          <div className="absolute top-4 right-6 lg:right-8 text-muted/[0.06] select-none pointer-events-none hidden sm:block">
            <span className="text-7xl lg:text-8xl font-bold tracking-tighter font-serif">GB</span>
          </div>
          
          <div className="relative">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight font-serif leading-tight">
              Grundbuchauszug anfordern
            </h1>
            <p className="text-muted-foreground mt-2">
              Aktueller, vollständiger Auszug aus dem österreichischen Grundbuch.
            </p>
          </div>
        </div>

        {/* Property Selection Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/40 bg-muted/10">
            <div className="px-4 md:px-6 lg:px-8">
              <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start gap-2 md:gap-8">
                <TabsTrigger 
                  value="address" 
                  className="relative px-3 md:px-0 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 whitespace-nowrap"
                >
                  Adresse
                </TabsTrigger>
                <TabsTrigger 
                  value="gst" 
                  className="relative px-3 md:px-0 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 whitespace-nowrap"
                >
                  Grundstücksnr.
                </TabsTrigger>
                <TabsTrigger 
                  value="ez" 
                  className="relative px-3 md:px-0 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 whitespace-nowrap"
                >
                  Einlagezahl
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            <TabsContent value="address" className="mt-0 space-y-5">
              <AddressSearch onSelectResult={handleAddressSelect} />
            </TabsContent>

            <TabsContent value="gst" className="mt-0 space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kg-gst" className="text-sm font-medium text-foreground">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gst-nr" className="text-sm font-medium text-foreground">Grundstücksnummer (GST-NR)</Label>
                  <Input
                    id="gst-nr"
                    {...register("grundstuecksnummer")}
                    placeholder="z.B. 123/4"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>Was ist die Grundstücksnummer?</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ez" className="mt-0 space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kg-ez" className="text-sm font-medium text-foreground">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ez-nr" className="text-sm font-medium text-foreground">Einlagezahl (EZ)</Label>
                  <Input
                    id="ez-nr"
                    {...register("grundstuecksnummer")}
                    placeholder="z.B. 567"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>Was ist die Einlagezahl?</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* Hidden fields for manual entry */}
            {(activeTab === "gst" || activeTab === "ez") && (
              <div className="hidden">
                <Input {...register("grundbuchsgericht")} />
                <Input {...register("bundesland")} />
              </div>
            )}
          </div>
        </Tabs>
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

      {/* Payment & Confirmation Card */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Zahlung & Bestätigung</h2>
        </div>

        <div className="p-4 lg:p-6 space-y-4">
          {/* Payment Info */}
          <div className="bg-info border border-primary/15 rounded p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Zahlung auf Rechnung</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  €19,90 netto zzgl. 20% MwSt. (€3,98) = €23,88 • Rechnung per E-Mail
                </p>
              </div>
              <span className="text-base md:text-lg font-bold text-foreground shrink-0">€23,88</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-primary/10">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-xs font-medium text-primary">
                Zustellung per E-Mail in der Regel innerhalb von 1 Stunde
              </p>
            </div>
          </div>

          {/* Legal Confirmations */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 -mx-3 rounded hover:bg-muted/30 transition-colors">
              <Checkbox
                id="confirmTerms"
                checked={confirmTerms}
                onCheckedChange={(checked) => setConfirmTerms(checked === true)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
              />
              <Label htmlFor="confirmTerms" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich habe die <a href="/agb" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>AGB</a> und <a href="/datenschutz" target="_blank" className="text-primary font-medium hover:underline" onClick={(e) => e.stopPropagation()}>Datenschutzerklärung</a> gelesen und akzeptiere diese. <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3 p-3 -mx-3 rounded hover:bg-muted/30 transition-colors">
              <Checkbox
                id="confirmNoRefund"
                checked={confirmNoRefund}
                onCheckedChange={(checked) => setConfirmNoRefund(checked === true)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer"
              />
              <Label htmlFor="confirmNoRefund" className="font-normal text-sm leading-relaxed cursor-pointer">
                Ich stimme zu, dass die Bestellung sofort bearbeitet wird. Nach Zustellung besteht gemäß § 18 Abs. 1 Z 11 FAGG kein Widerrufsrecht mehr. <span className="text-destructive">*</span>
              </Label>
            </div>
          </div>

          {/* Submit Button - Hidden on mobile (shown in sticky bar) */}
          <Button
            type="submit"
            className="hidden md:flex w-full h-14 text-base font-semibold shadow-lg touch-target-lg"
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
                <span>Kostenpflichtig bestellen – <span className="text-sm font-normal opacity-90">€23,88 inkl. MwSt.</span></span>
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
