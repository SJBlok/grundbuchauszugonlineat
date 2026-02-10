import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressSearch } from "@/components/AddressSearch";
import { KatastralgemeindeCombobox } from "@/components/KatastralgemeindeCombobox";
import type { PropertyData } from "@/pages/Anfordern";
import { ChevronRight, CheckCircle2, FileText, Info, Clock, Shield, HelpCircle } from "lucide-react";

const propertySchema = z.object({
  katastralgemeinde: z.string().max(100).optional(),
  grundstuecksnummer: z.string().max(50).optional(),
  grundbuchsgericht: z.string().max(100).optional(),
  bundesland: z.string().optional(),
  wohnungsHinweis: z.string().max(200).optional(),
});

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
    setValue,
    watch,
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

  const handleFormSubmit = () => {
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
  };

  return (
    <div className="space-y-8 animate-fade-in" data-testid="property-details-step">
      {/* Main Product Card */}
      <div className="bg-card rounded shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 py-10 lg:px-12 lg:py-12 border-b border-border/40 bg-gradient-to-b from-muted/20 to-transparent relative overflow-hidden">
          {/* Decorative GB watermark */}
          <div className="absolute top-6 right-8 lg:right-12 text-muted/[0.08] select-none pointer-events-none hidden sm:block">
            <span className="text-8xl lg:text-9xl font-bold tracking-tighter font-serif">GB</span>
          </div>
          
          <div className="relative">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight font-serif leading-tight">
              Grundbuchauszug
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Aktueller Auszug aus dem österreichischen Grundbuch
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/40 bg-muted/10">
            <div className="px-8 lg:px-12">
              <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start gap-10">
                <TabsTrigger 
                  value="address" 
                  className="relative px-0 py-5 text-[15px] font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  Adresse
                </TabsTrigger>
                <TabsTrigger 
                  value="gst" 
                  className="relative px-0 py-5 text-[15px] font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  Grundstücksnummer
                </TabsTrigger>
                <TabsTrigger 
                  value="ez" 
                  className="relative px-0 py-5 text-[15px] font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  Einlagezahl
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 lg:p-12">
            {/* Address Search Tab */}
            <TabsContent value="address" className="mt-0 space-y-6">
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="flex items-start gap-4 bg-primary/5 border border-primary/15 rounded p-6 animate-scale-in">
                  <div className="h-11 w-11 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">Adresse gefunden</p>
                    {selectedAddress && (
                      <p className="text-[15px] text-muted-foreground mt-1">{selectedAddress}</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* GST Number Tab */}
            <TabsContent value="gst" className="mt-0 space-y-6">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="kg-gst" className="text-[15px] font-medium">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="gst-nr" className="text-[15px] font-medium">Grundstücksnummer (GST-NR)</Label>
                  <Input
                    id="gst-nr"
                    {...register("grundstuecksnummer")}
                    placeholder="z.B. 123/4"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Was ist die Grundstücksnummer?</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* EZ Number Tab */}
            <TabsContent value="ez" className="mt-0 space-y-6">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="kg-ez" className="text-[15px] font-medium">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2.5">
                  <Label htmlFor="ez-nr" className="text-[15px] font-medium">Einlagezahl (EZ)</Label>
                  <Input
                    id="ez-nr"
                    {...register("grundstuecksnummer")}
                    placeholder="z.B. 567"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Was ist die Einlagezahl?</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* Hidden fields */}
            {(activeTab === "gst" || activeTab === "ez") && (
              <div className="hidden">
                <Input {...register("grundbuchsgericht")} />
                <Input {...register("bundesland")} />
              </div>
            )}

            {/* Legal Notice */}
            <div className="mt-10 pt-8 border-t border-border/40 space-y-4">
              <p className="text-[15px] text-muted-foreground flex items-start gap-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/60" />
                <span>
                  Bei Bestellung akzeptieren Sie unsere{" "}
                  <a href="/agb" className="text-secondary hover:underline font-medium">AGB</a>{" "}
                  und{" "}
                  <a href="/datenschutz" className="text-secondary hover:underline font-medium">Datenschutzerklärung</a>.
                </span>
              </p>
              
              <p className="text-[15px] text-muted-foreground flex items-start gap-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/60" />
                <span>Sofort-Download als PDF & Versand per E-Mail</span>
              </p>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleFormSubmit}
              disabled={!selectedFromSearch && activeTab === "address"}
              className="w-full h-16 text-lg font-semibold mt-10 shadow-lg" 
              size="xl"
            >
              <FileText className="h-5 w-5 mr-2" />
              Dokument anfordern | € 28,90
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center justify-center gap-8 text-[15px] text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span>SSL-verschlüsselt</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <span>Sofortige Zustellung</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <span>Amtlich beglaubigt</span>
        </div>
      </div>

      {/* Property data summary */}
      {selectedFromSearch && (
        <div className="bg-card rounded shadow-sm p-8 border border-border/30 animate-fade-in-up">
          <h3 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wide">
            Ermittelte Grundbuchdaten
          </h3>
          <div className="grid grid-cols-2 gap-6 text-[15px]">
            <div>
              <span className="text-muted-foreground">Katastralgemeinde</span>
              <p className="font-medium mt-1">{watch("katastralgemeinde") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">EZ/GST-Nr</span>
              <p className="font-medium mt-1">{watch("grundstuecksnummer") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bundesland</span>
              <p className="font-medium mt-1">{watch("bundesland") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bezirksgericht</span>
              <p className="font-medium mt-1">{watch("grundbuchsgericht") || "–"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
