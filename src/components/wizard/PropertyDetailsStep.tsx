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
import { Search, FileText, MapPin, Hash, Info, ChevronRight, CheckCircle2, ExternalLink, Clock, BadgeCheck } from "lucide-react";

const propertySchema = z.object({
  katastralgemeinde: z.string().max(100).optional(),
  grundstuecksnummer: z.string().max(50).optional(),
  grundbuchsgericht: z.string().max(100).optional(),
  bundesland: z.string().optional(),
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
  const [activeTab, setActiveTab] = useState<string>("address");
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

  const [selectedAddressData, setSelectedAddressData] = useState<AddressSearchResult | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Product Selection Card */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="bg-header px-5 py-3">
          <h2 className="text-base font-semibold text-white">Dokument auswählen</h2>
        </div>
        
        <div className="p-5">
          {/* Single Product Option */}
          <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">Aktueller Grundbuchauszug</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Enthält Eigentumsinformationen, Grundstücksdaten und eingetragene Lasten (A-, B- und C-Blatt).
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-foreground">€19,90</span>
                  <p className="text-xs text-muted-foreground">inkl. USt.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>Sofortige Zustellung</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" />
              <span>Offizielles Dokument</span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Card */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="bg-header px-5 py-3">
          <h2 className="text-base font-semibold text-white">Grundstück identifizieren</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-5 pt-5">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/50 rounded-lg">
              <TabsTrigger 
                value="address" 
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="font-medium text-sm">Adresssuche</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
              >
                <Hash className="h-4 w-4 shrink-0" />
                <span className="font-medium text-sm">Manuelle Eingabe</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-5">
            {/* Address Search Tab */}
            <TabsContent value="address" className="mt-0 space-y-4">
              <div className="bg-info border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-sm">Adresse eingeben</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Geben Sie die Straße und den Ort ein. Die Grundbuchdaten werden automatisch ermittelt.
                    </p>
                  </div>
                </div>
              </div>
              
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-success/10 border border-success/30 p-4 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">Adresse gefunden</p>
                      {selectedAddress && (
                        <p className="text-sm text-muted-foreground mt-0.5">{selectedAddress}</p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const formData = {
                        katastralgemeinde: watch("katastralgemeinde") || "",
                        grundstuecksnummer: watch("grundstuecksnummer") || "",
                        grundbuchsgericht: watch("grundbuchsgericht") || "",
                        bundesland: watch("bundesland") || "",
                        wohnungsHinweis: watch("wohnungsHinweis") || "",
                        adresse: selectedAddressData?.adresse || "",
                        plz: selectedAddressData?.plz || "",
                        ort: selectedAddressData?.ort || "",
                      };
                      onSubmit(formData);
                    }} 
                    className="w-full h-14 text-base font-semibold" 
                    size="lg"
                  >
                    Weiter zu Kontaktdaten
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
              
              {!selectedFromSearch && (
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Kennen Sie bereits die Grundstücksnummer?{" "}
                    <button 
                      type="button"
                      onClick={() => setActiveTab("manual")}
                      className="text-primary font-medium hover:underline"
                    >
                      Direkt eingeben
                    </button>
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="mt-0">
              <form onSubmit={handleSubmit((data) => {
                const formData = {
                  katastralgemeinde: data.katastralgemeinde || "",
                  grundstuecksnummer: data.grundstuecksnummer || "",
                  grundbuchsgericht: data.grundbuchsgericht || "",
                  bundesland: data.bundesland || "",
                  wohnungsHinweis: data.wohnungsHinweis || "",
                  adresse: "",
                  plz: "",
                  ort: "",
                };
                
                if (!formData.katastralgemeinde || !formData.grundstuecksnummer || !formData.grundbuchsgericht || !formData.bundesland) {
                  if (!formData.katastralgemeinde) trigger("katastralgemeinde");
                  if (!formData.grundstuecksnummer) trigger("grundstuecksnummer");
                  if (!formData.grundbuchsgericht) trigger("grundbuchsgericht");
                  if (!formData.bundesland) trigger("bundesland");
                  return;
                }
                
                onSubmit(formData);
              })} className="space-y-4">
                {selectedFromSearch && selectedAddress && (
                  <div className="flex items-center gap-3 bg-success/10 border border-success/30 p-3 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Adresse ausgewählt:</p>
                      <p className="text-sm text-muted-foreground">{selectedAddress}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bundesland" className="text-sm font-medium">
                      Bundesland <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bundesland}
                      onValueChange={(value) => setValue("bundesland", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="h-11 text-base bg-white border-border">
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bundeslaender.map((land) => (
                          <SelectItem key={land} value={land} className="py-2.5">
                            {land}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bundesland && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Bundesland ist erforderlich</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="katastralgemeinde" className="text-sm font-medium">
                      Katastralgemeinde (KG) <span className="text-destructive">*</span>
                    </Label>
                    <KatastralgemeindeCombobox
                      value={katastralgemeinde}
                      onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                      bundesland={bundesland}
                      placeholder="KG suchen..."
                    />
                    {errors.katastralgemeinde && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Katastralgemeinde ist erforderlich</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="grundstuecksnummer" className="text-sm font-medium">
                      Einlagezahl (EZ) / GST-Nr. <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundstuecksnummer"
                      {...register("grundstuecksnummer")}
                      placeholder="z.B. 123 oder 123/4"
                      className="h-11 text-base bg-white border-border"
                    />
                    {errors.grundstuecksnummer && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Grundstücksnummer ist erforderlich</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="grundbuchsgericht" className="text-sm font-medium">
                      Grundbuchsgericht <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundbuchsgericht"
                      {...register("grundbuchsgericht")}
                      placeholder="z.B. BG Innere Stadt Wien"
                      className="h-11 text-base bg-white border-border"
                    />
                    {errors.grundbuchsgericht && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Grundbuchsgericht ist erforderlich</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="wohnungsHinweis" className="text-sm font-medium text-muted-foreground">
                    Wohnungs- / Anteilshinweis <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="wohnungsHinweis"
                    {...register("wohnungsHinweis")}
                    placeholder="z.B. Top 5, Anteil 1/10"
                    className="h-11 text-base bg-white border-border"
                  />
                </div>

                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">KG-Nummer nicht bekannt?</p>
                      <p className="text-muted-foreground mt-1">
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
                        {" "}oder suchen Sie über die Adresse.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold" 
                  size="lg"
                >
                  Weiter zu Kontaktdaten
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}