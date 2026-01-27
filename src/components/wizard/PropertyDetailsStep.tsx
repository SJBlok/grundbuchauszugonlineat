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
import grundbuchPreview from "@/assets/grundbuch-preview.jpg";

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
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Subtle Section Header */}
        <div className="bg-muted/60 px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-4 bg-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Ihr Dokument</h2>
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
              <div className="w-20 h-28 bg-muted/30 border border-border rounded-sm overflow-hidden shadow-sm">
                <img 
                  src={grundbuchPreview} 
                  alt="Grundbuchauszug Beispiel" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-base">Aktueller Grundbuchauszug</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Vollständiger Auszug mit allen drei Blättern:
                </p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><span className="font-medium text-foreground">A-Blatt</span> – Grundstücksdaten & Flächen</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><span className="font-medium text-foreground">B-Blatt</span> – Eigentümer & Anteile</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span><span className="font-medium text-foreground">C-Blatt</span> – Lasten & Beschränkungen</span>
                  </li>
                </ul>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-2xl font-bold text-foreground">€19,90</span>
                <p className="text-xs text-muted-foreground">inkl. USt.</p>
              </div>
            </div>
          </div>

          {/* Trust Features */}
          <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">Sofort per E-Mail</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">Amtlich beglaubigt</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Zahlung auf Rechnung</span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-muted/60 px-4 py-2.5 border-b border-border flex items-center gap-2.5">
          <div className="w-0.5 h-4 bg-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Grundstück</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2 h-auto p-0.5 bg-muted/40 gap-0.5">
              <TabsTrigger 
                value="address" 
                className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">Adresssuche</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Hash className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">Manuelle Eingabe</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            {/* Address Search Tab */}
            <TabsContent value="address" className="mt-0 space-y-3">
              <div className="bg-info border border-primary/15 p-3">
                <div className="flex items-start gap-2">
                  <Search className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Geben Sie die Straße und den Ort ein. Die Grundbuchdaten werden automatisch ermittelt.
                  </p>
                </div>
              </div>
              
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 bg-success/10 border border-success/30 p-3">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-xs">Adresse gefunden</p>
                      {selectedAddress && (
                        <p className="text-xs text-muted-foreground mt-0.5">{selectedAddress}</p>
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
                    className="w-full h-12 text-sm font-semibold" 
                    size="lg"
                  >
                    Weiter zu Kontaktdaten
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {!selectedFromSearch && (
                <div className="text-center pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
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
              })} className="space-y-3">
                {selectedFromSearch && selectedAddress && (
                  <div className="flex items-center gap-2 bg-success/10 border border-success/30 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">Adresse: {selectedAddress}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="bundesland" className="text-xs font-medium">
                      Bundesland <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bundesland}
                      onValueChange={(value) => setValue("bundesland", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="h-10 text-sm bg-white border-border">
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bundeslaender.map((land) => (
                          <SelectItem key={land} value={land} className="py-2">
                            {land}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bundesland && !selectedFromSearch && (
                      <p className="text-xs text-destructive">Bundesland ist erforderlich</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="katastralgemeinde" className="text-xs font-medium">
                      Katastralgemeinde (KG) <span className="text-destructive">*</span>
                    </Label>
                    <KatastralgemeindeCombobox
                      value={katastralgemeinde}
                      onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                      bundesland={bundesland}
                      placeholder="KG suchen..."
                    />
                    {errors.katastralgemeinde && !selectedFromSearch && (
                      <p className="text-xs text-destructive">Katastralgemeinde ist erforderlich</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="grundstuecksnummer" className="text-xs font-medium">
                      Einlagezahl (EZ) / GST-Nr. <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundstuecksnummer"
                      {...register("grundstuecksnummer")}
                      placeholder="z.B. 123 oder 123/4"
                      className="h-10 text-sm bg-white border-border"
                    />
                    {errors.grundstuecksnummer && !selectedFromSearch && (
                      <p className="text-xs text-destructive">Grundstücksnummer ist erforderlich</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="grundbuchsgericht" className="text-xs font-medium">
                      Grundbuchsgericht <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundbuchsgericht"
                      {...register("grundbuchsgericht")}
                      placeholder="z.B. BG Innere Stadt Wien"
                      className="h-10 text-sm bg-white border-border"
                    />
                    {errors.grundbuchsgericht && !selectedFromSearch && (
                      <p className="text-xs text-destructive">Grundbuchsgericht ist erforderlich</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="wohnungsHinweis" className="text-xs font-medium text-muted-foreground">
                    Wohnungs- / Anteilshinweis <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="wohnungsHinweis"
                    {...register("wohnungsHinweis")}
                    placeholder="z.B. Top 5, Anteil 1/10"
                    className="h-10 text-sm bg-white border-border"
                  />
                </div>

                <div className="bg-muted/30 border p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-medium text-foreground">KG-Nummer nicht bekannt?</p>
                      <p className="text-muted-foreground mt-0.5">
                        Nutzen Sie das{" "}
                        <a 
                          href="https://kataster.bev.gv.at/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
                        >
                          BEV-Katasterverzeichnis
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-sm font-semibold" 
                  size="lg"
                >
                  Weiter zu Kontaktdaten
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}