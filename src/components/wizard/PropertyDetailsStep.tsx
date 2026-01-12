import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressSearch } from "@/components/AddressSearch";
import { KatastralgemeindeCombobox } from "@/components/KatastralgemeindeCombobox";
import type { PropertyData } from "@/pages/Anfordern";
import { Search, FileText, MapPin, Building2, Hash, Scale, Info, ChevronRight, Clock, Shield, Mail, CheckCircle2, ExternalLink } from "lucide-react";

const propertySchema = z.object({
  katastralgemeinde: z.string().min(1, "Katastralgemeinde ist erforderlich").max(100),
  grundstuecksnummer: z.string().min(1, "Grundstücksnummer ist erforderlich").max(50),
  grundbuchsgericht: z.string().min(1, "Grundbuchsgericht ist erforderlich").max(100),
  bundesland: z.string().min(1, "Bundesland ist erforderlich"),
  wohnungsHinweis: z.string().max(200).optional(),
});

const bundeslaender = [
  "Burgenland",
  "Kärnten",
  "Niederösterreich",
  "Oberösterreich",
  "Salzburg",
  "Steiermark",
  "Tirol",
  "Vorarlberg",
  "Wien",
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

interface PropertyDetailsStepProps {
  initialData: PropertyData;
  onSubmit: (data: PropertyData) => void;
}

export function PropertyDetailsStep({ initialData, onSubmit }: PropertyDetailsStepProps) {
  const [activeTab, setActiveTab] = useState<string>("manual");
  const [selectedFromSearch, setSelectedFromSearch] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PropertyData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData,
  });

  const bundesland = watch("bundesland");
  const katastralgemeinde = watch("katastralgemeinde");

  const handleAddressSelect = (result: AddressSearchResult) => {
    // Store the selected address for display
    const addressDisplay = [result.adresse, result.plz, result.ort].filter(Boolean).join(", ");
    setSelectedAddress(addressDisplay);
    
    // Fill in the form with the selected result
    if (result.kgName || result.kgNummer) {
      setValue("katastralgemeinde", result.kgName || result.kgNummer, { shouldValidate: true });
    }
    if (result.gst || result.ez) {
      setValue("grundstuecksnummer", result.gst || result.ez, { shouldValidate: true });
    }
    if (result.bundesland) {
      setValue("bundesland", result.bundesland, { shouldValidate: true });
    }
    
    // Auto-generate Grundbuchsgericht based on Bundesland
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

  return (
    <div className="max-w-3xl mx-auto bg-muted/40 rounded-2xl p-6 md:p-10">
      {/* Hero Header with strong CTA */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Clock className="h-4 w-4" />
          Sofortige Lieferung per E-Mail
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Grundbuchauszug anfordern
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Offizieller Auszug aus dem österreichischen Grundbuch – rechtsgültig und sofort verfügbar.
        </p>
        
        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Amtlich beglaubigt</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span>Per E-Mail in Minuten</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Sichere Zahlung</span>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-card border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 border-b border-primary/10">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Schritt 1: Grundstück identifizieren
          </h2>
          <p className="text-muted-foreground mt-1 ml-13">
            Geben Sie die Daten des gewünschten Grundstücks ein
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-muted/30 h-14 p-0">
            <TabsTrigger 
              value="manual" 
              className="flex items-center gap-2 rounded-none border-r data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full transition-all"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Grundbuchdaten eingeben</span>
            </TabsTrigger>
            <TabsTrigger 
              value="address" 
              className="flex items-center gap-2 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full transition-all"
            >
              <Search className="h-4 w-4" />
              <span className="font-medium">Über Adresse suchen</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6 md:p-8">
            {/* Manual Entry Tab - Primary */}
            <TabsContent value="manual" className="mt-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selected address indicator */}
                {selectedFromSearch && selectedAddress && (
                  <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-4 rounded-lg mb-6">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Adresse ausgewählt:</p>
                      <p className="text-sm text-muted-foreground">{selectedAddress}</p>
                    </div>
                  </div>
                )}

                {/* Two-column layout for Bundesland and KG */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bundesland Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bundesland" className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      Bundesland <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bundesland}
                      onValueChange={(value) => setValue("bundesland", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="h-12 bg-background border-2 focus:border-primary">
                        <SelectValue placeholder="Bundesland auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {bundeslaender.map((land) => (
                          <SelectItem key={land} value={land}>
                            {land}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bundesland && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                        {errors.bundesland.message}
                      </p>
                    )}
                  </div>

                  {/* Katastralgemeinde Field */}
                  <div className="space-y-2">
                    <Label htmlFor="katastralgemeinde" className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="h-4 w-4 text-primary" />
                      Katastralgemeinde <span className="text-destructive">*</span>
                    </Label>
                    <KatastralgemeindeCombobox
                      value={katastralgemeinde}
                      onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                      bundesland={bundesland}
                      placeholder="KG suchen oder eingeben..."
                    />
                    {errors.katastralgemeinde && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                        {errors.katastralgemeinde.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Two-column layout for GST and Gericht */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Grundstücksnummer Field */}
                  <div className="space-y-2">
                    <Label htmlFor="grundstuecksnummer" className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4 text-primary" />
                      Einlagezahl (EZ) oder GST-Nr. <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundstuecksnummer"
                      {...register("grundstuecksnummer")}
                      placeholder="z.B. 123 oder 123/4"
                      className="h-12 bg-background border-2 focus:border-primary"
                    />
                    {errors.grundstuecksnummer && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                        {errors.grundstuecksnummer.message}
                      </p>
                    )}
                  </div>

                  {/* Grundbuchsgericht Field */}
                  <div className="space-y-2">
                    <Label htmlFor="grundbuchsgericht" className="flex items-center gap-2 text-sm font-medium">
                      <Scale className="h-4 w-4 text-primary" />
                      Grundbuchsgericht <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundbuchsgericht"
                      {...register("grundbuchsgericht")}
                      placeholder="z.B. BG Innere Stadt Wien"
                      className="h-12 bg-background border-2 focus:border-primary"
                    />
                    {errors.grundbuchsgericht && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                        {errors.grundbuchsgericht.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Optional Field - Wohnungshinweis */}
                <div className="space-y-2">
                  <Label htmlFor="wohnungsHinweis" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Info className="h-4 w-4" />
                    Wohnungs- / Anteilshinweis <span className="text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="wohnungsHinweis"
                    {...register("wohnungsHinweis")}
                    placeholder="z.B. Top 5, Anteil 1/10"
                    className="h-12 bg-background border-2 focus:border-primary"
                  />
                </div>

                {/* Help Box */}
                <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-lg border">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Sie kennen die KG-Nummer nicht?</p>
                    <p>
                      Nutzen Sie das{" "}
                      <a 
                        href="https://kataster.bev.gv.at/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        BEV-Katasterverzeichnis
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {" "}oder wechseln Sie zu "Über Adresse suchen".
                    </p>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90" 
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Grundbuchauszug anfordern
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Im nächsten Schritt: Kontaktdaten & Zahlung
                  </p>
                </div>
              </form>
            </TabsContent>

            {/* Address Search Tab */}
            <TabsContent value="address" className="mt-0 space-y-6">
              <div className="flex items-start gap-3 bg-info p-4 rounded-lg border border-primary/10">
                <Search className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground">
                  <p className="font-medium">Adresse eingeben und Grundstück finden</p>
                  <p className="text-muted-foreground mt-1">
                    Geben Sie eine österreichische Adresse ein. Die Grundbuchdaten werden automatisch ermittelt.
                  </p>
                </div>
              </div>
              
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-primary/5 border-2 border-primary/30 p-4 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Adresse ausgewählt!</p>
                      {selectedAddress && (
                        <p className="text-sm text-muted-foreground">{selectedAddress}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Die Grundbuchdaten wurden übernommen. Klicken Sie auf "Weiter" oder überprüfen Sie die Daten im Tab "Grundbuchdaten eingeben".
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={async () => {
                      const isValid = await trigger();
                      if (isValid) {
                        handleSubmit(onSubmit)();
                      } else {
                        setActiveTab("manual");
                      }
                    }} 
                    className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90" 
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Grundbuchauszug anfordern
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
              
              {!selectedFromSearch && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Oder{" "}
                    <button 
                      type="button"
                      onClick={() => setActiveTab("manual")}
                      className="text-primary font-medium hover:underline"
                    >
                      geben Sie die Grundbuchdaten direkt ein
                    </button>
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Bottom trust section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          🔒 Ihre Daten werden sicher übertragen und nicht an Dritte weitergegeben.
        </p>
      </div>
    </div>
  );
}
