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
import { Search, MapPin, Hash, ChevronRight, CheckCircle2, FileText, Info } from "lucide-react";

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
    <div className="space-y-6" data-testid="property-details-step">
      {/* Main Product Card */}
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Grundbuchauszug
              </h1>
              <p className="text-muted-foreground mt-1">
                Aktueller Auszug aus dem Grundbuch
              </p>
            </div>
            {/* GB Logo/Badge */}
            <div className="hidden sm:flex flex-col items-center text-muted-foreground/30">
              <span className="text-4xl font-bold tracking-tighter">GB</span>
              <span className="text-[10px] uppercase tracking-wider">Grundbuch</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border">
            <TabsList className="h-auto p-0 bg-transparent rounded-none w-full justify-start">
              <TabsTrigger 
                value="address" 
                className="relative px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-colors"
              >
                Adresse
              </TabsTrigger>
              <TabsTrigger 
                value="gst" 
                className="relative px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-colors"
              >
                Grundstücksnummer
              </TabsTrigger>
              <TabsTrigger 
                value="ez" 
                className="relative px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-colors"
              >
                Einlagezahl
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Address Search Tab */}
            <TabsContent value="address" className="mt-0 space-y-4">
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Adresse gefunden</p>
                    {selectedAddress && (
                      <p className="text-sm text-muted-foreground mt-0.5">{selectedAddress}</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* GST Number Tab */}
            <TabsContent value="gst" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kg-gst" className="text-sm font-medium">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gst-nr" className="text-sm font-medium">Grundstücksnummer (GST-NR)</Label>
                  <Input
                    id="gst-nr"
                    {...register("grundstuecksnummer")}
                    placeholder=""
                    className="h-12 text-base bg-white"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Was ist die Grundstücksnummer?</span>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* EZ Number Tab */}
            <TabsContent value="ez" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kg-ez" className="text-sm font-medium">Katastralgemeinde (KG)</Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Gemeinde eingeben..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ez-nr" className="text-sm font-medium">Einlagezahl (EZ)</Label>
                  <Input
                    id="ez-nr"
                    {...register("grundstuecksnummer")}
                    placeholder=""
                    className="h-12 text-base bg-white"
                  />
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
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

            {/* Legal Notice */}
            <div className="mt-6 pt-4 border-t border-border space-y-3">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Bei Bestellung akzeptieren Sie unsere{" "}
                  <a href="/agb" className="text-primary hover:underline">AGB</a>{" "}
                  und{" "}
                  <a href="/datenschutz" className="text-primary hover:underline">Datenschutzerklärung</a>.
                </span>
              </p>
              
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>Sofort-Download als PDF & Versand per Mail</span>
              </p>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleFormSubmit}
              disabled={!selectedFromSearch && activeTab === "address"}
              className="w-full h-14 text-base font-semibold mt-6 bg-primary hover:bg-primary/90" 
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              Dokument anfordern | € 19,90
            </Button>
          </div>
        </Tabs>
      </div>

      {/* Optional: Additional Info Section */}
      {selectedFromSearch && (
        <div className="bg-white border border-border rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Ermittelte Grundbuchdaten</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Katastralgemeinde:</span>
              <p className="font-medium">{watch("katastralgemeinde") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">EZ/GST-Nr:</span>
              <p className="font-medium">{watch("grundstuecksnummer") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bundesland:</span>
              <p className="font-medium">{watch("bundesland") || "–"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bezirksgericht:</span>
              <p className="font-medium">{watch("grundbuchsgericht") || "–"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
