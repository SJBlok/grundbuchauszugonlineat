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

// Schema is now optional - validation depends on which method is used
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
    <div className="max-w-3xl mx-auto">
      {/* Official Header Bar */}
      <div className="bg-primary text-primary-foreground px-6 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary-foreground/20 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Grundbuchauszug Online</h1>
              <p className="text-primary-foreground/80 text-xs">Offizieller Grundbuchauszug – Österreich</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-primary-foreground/80">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Amtlich</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Sofort per E-Mail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-card border-2 border-t-0 border-border rounded-b-lg shadow-xl">
        {/* Step Indicator */}
        <div className="bg-muted/50 px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Grundstück identifizieren</h2>
              <p className="text-sm text-muted-foreground">Wählen Sie <strong>eine</strong> der beiden Methoden</p>
            </div>
          </div>
        </div>

        {/* Search Method Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-6">
            
            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-muted/60 rounded-lg">
              <TabsTrigger 
                value="address" 
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all"
              >
                <MapPin className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Adresse</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Einfach & schnell</div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-primary/20 transition-all"
              >
                <Hash className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Grundstücksnummer</div>
                  <div className="text-xs text-muted-foreground hidden sm:block">Für Experten</div>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Address Search Tab - Primary */}
            <TabsContent value="address" className="mt-0 space-y-6">
              <div className="bg-info/50 border border-info rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Adresse eingeben</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Geben Sie die Straße, Hausnummer und den Ort ein. Die Grundbuchdaten werden automatisch ermittelt.
                    </p>
                  </div>
                </div>
              </div>
              
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-success/10 border-2 border-success/30 p-4 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Adresse gefunden!</p>
                      {selectedAddress && (
                        <p className="text-sm text-muted-foreground">{selectedAddress}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Die Grundbuchdaten wurden übernommen. Klicken Sie auf "Weiter zur Bestellung".
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      // When address is selected, submit directly without form validation
                      const formData = {
                        katastralgemeinde: watch("katastralgemeinde") || "",
                        grundstuecksnummer: watch("grundstuecksnummer") || "",
                        grundbuchsgericht: watch("grundbuchsgericht") || "",
                        bundesland: watch("bundesland") || "",
                        wohnungsHinweis: watch("wohnungsHinweis") || "",
                      };
                      onSubmit(formData);
                    }} 
                    className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all" 
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Weiter zur Bestellung
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
                // Manual validation for the manual tab
                const formData = {
                  katastralgemeinde: data.katastralgemeinde || "",
                  grundstuecksnummer: data.grundstuecksnummer || "",
                  grundbuchsgericht: data.grundbuchsgericht || "",
                  bundesland: data.bundesland || "",
                  wohnungsHinweis: data.wohnungsHinweis || "",
                };
                
                // Check if all required fields are filled
                if (!formData.katastralgemeinde || !formData.grundstuecksnummer || !formData.grundbuchsgericht || !formData.bundesland) {
                  // Trigger validation errors manually
                  if (!formData.katastralgemeinde) trigger("katastralgemeinde");
                  if (!formData.grundstuecksnummer) trigger("grundstuecksnummer");
                  if (!formData.grundbuchsgericht) trigger("grundbuchsgericht");
                  if (!formData.bundesland) trigger("bundesland");
                  return;
                }
                
                onSubmit(formData);
              })} className="space-y-6">
                {/* Selected address indicator */}
                {selectedFromSearch && selectedAddress && (
                  <div className="flex items-center gap-3 bg-success/10 border border-success/30 p-4 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Adresse ausgewählt:</p>
                      <p className="text-sm text-muted-foreground">{selectedAddress}</p>
                    </div>
                  </div>
                )}

                {/* Bundesland and KG in two columns */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Bundesland Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bundesland" className="text-sm font-medium">
                      Bundesland <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={bundesland}
                      onValueChange={(value) => setValue("bundesland", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {bundeslaender.map((land) => (
                          <SelectItem key={land} value={land}>
                            {land}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bundesland && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Bundesland ist erforderlich</p>
                    )}
                  </div>

                  {/* Katastralgemeinde Field */}
                  <div className="space-y-2">
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

                {/* GST and Gericht in two columns */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Grundstücksnummer Field */}
                  <div className="space-y-2">
                    <Label htmlFor="grundstuecksnummer" className="text-sm font-medium">
                      Einlagezahl (EZ) / GST-Nr. <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundstuecksnummer"
                      {...register("grundstuecksnummer")}
                      placeholder="z.B. 123 oder 123/4"
                      className="h-12 bg-background"
                    />
                    {errors.grundstuecksnummer && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Grundstücksnummer ist erforderlich</p>
                    )}
                  </div>

                  {/* Grundbuchsgericht Field */}
                  <div className="space-y-2">
                    <Label htmlFor="grundbuchsgericht" className="text-sm font-medium">
                      Grundbuchsgericht <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="grundbuchsgericht"
                      {...register("grundbuchsgericht")}
                      placeholder="z.B. BG Innere Stadt Wien"
                      className="h-12 bg-background"
                    />
                    {errors.grundbuchsgericht && !selectedFromSearch && (
                      <p className="text-sm text-destructive">Grundbuchsgericht ist erforderlich</p>
                    )}
                  </div>
                </div>

                {/* Optional Field - Wohnungshinweis */}
                <div className="space-y-2">
                  <Label htmlFor="wohnungsHinweis" className="text-sm font-medium text-muted-foreground">
                    Wohnungs- / Anteilshinweis <span className="text-xs font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="wohnungsHinweis"
                    {...register("wohnungsHinweis")}
                    placeholder="z.B. Top 5, Anteil 1/10"
                    className="h-12 bg-background"
                  />
                </div>

                {/* Help Box */}
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
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

                {/* Primary CTA Button */}
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all" 
                  size="lg"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Weiter zur Bestellung
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Versand in Minuten</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Sichere Bezahlung</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
