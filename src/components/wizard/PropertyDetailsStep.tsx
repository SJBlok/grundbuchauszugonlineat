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
import { ChevronRight, CheckCircle2, FileText, Info, Clock, Shield } from "lucide-react";

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
      <div className="bg-white rounded-2xl shadow-premium-lg overflow-hidden border border-border/30">
        {/* Header */}
        <div className="px-8 py-8 lg:px-10 lg:py-10 border-b border-border/30 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight font-serif">
                Grundbuchauszug
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Aktueller Auszug aus dem Grundbuch
              </p>
            </div>
            {/* GB Logo/Badge */}
            <div className="hidden sm:flex flex-col items-center text-muted-foreground/20">
              <span className="text-5xl lg:text-6xl font-bold tracking-tighter font-serif">GB</span>
              <span className="text-[10px] uppercase tracking-widest">Grundbuch</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/30 bg-muted/20">
            <div className="px-8 lg:px-10">
              <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start gap-8">
                <TabsTrigger 
                  value="address" 
                  className="relative px-0 py-4 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  Adresse
                </TabsTrigger>
                <TabsTrigger 
                  value="gst" 
                  className="relative px-0 py-4 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  Grundstücksnummer
                </TabsTrigger>
                <TabsTrigger 
                  value="ez" 
                  className="relative px-0 py-4 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  Einlagezahl
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 lg:p-10">
            {/* Address Search Tab */}
            <TabsContent value="address" className="mt-0 space-y-6">
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="flex items-start gap-4 bg-primary/5 border border-primary/20 rounded-xl p-5 animate-scale-in">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">Adresse gefunden</p>
                    {selectedAddress && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedAddress}</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* GST Number Tab */}
            <TabsContent value="gst" className="mt-0 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="kg-gst" className="text-sm font-semibold">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gst-nr" className="text-sm font-semibold">Grundstücksnummer (GST-NR)</Label>
                  <Input
                    id="gst-nr"
                    {...register("grundstuecksnummer")}
                    placeholder=""
                    className="h-14 text-base bg-white border-2 border-border rounded-xl px-5 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Was ist die Grundstücksnummer?</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* EZ Number Tab */}
            <TabsContent value="ez" className="mt-0 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="kg-ez" className="text-sm font-semibold">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ez-nr" className="text-sm font-semibold">Einlagezahl (EZ)</Label>
                  <Input
                    id="ez-nr"
                    {...register("grundstuecksnummer")}
                    placeholder=""
                    className="h-14 text-base bg-white border-2 border-border rounded-xl px-5 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
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
            <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
              <p className="text-sm text-muted-foreground flex items-start gap-3">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/70" />
                <span>
                  Bei Bestellung akzeptieren Sie unsere{" "}
                  <a href="/agb" className="text-secondary hover:underline font-medium">AGB</a>{" "}
                  und{" "}
                  <a href="/datenschutz" className="text-secondary hover:underline font-medium">Datenschutzerklärung</a>.
                </span>
              </p>
              
              <p className="text-sm text-muted-foreground flex items-start gap-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/70" />
                <span>Sofort-Download als PDF & Versand per E-Mail</span>
              </p>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleFormSubmit}
              disabled={!selectedFromSearch && activeTab === "address"}
              className="w-full h-16 text-lg font-semibold mt-8 rounded-xl" 
              size="xl"
            >
              <FileText className="h-5 w-5 mr-2" />
              Dokument anfordern | € 19,90
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>SSL-verschlüsselt</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Sofortige Zustellung</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>Amtlich beglaubigt</span>
        </div>
      </div>

      {/* Property data summary */}
      {selectedFromSearch && (
        <div className="bg-white rounded-xl shadow-premium-sm p-6 border border-border/30 animate-fade-in-up">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Ermittelte Grundbuchdaten
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Katastralgemeinde</span>
              <p className="font-medium mt-0.5">{watch("katastralgemeinde") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">EZ/GST-Nr</span>
              <p className="font-medium mt-0.5">{watch("grundstuecksnummer") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bundesland</span>
              <p className="font-medium mt-0.5">{watch("bundesland") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bezirksgericht</span>
              <p className="font-medium mt-0.5">{watch("grundbuchsgericht") || "–"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
