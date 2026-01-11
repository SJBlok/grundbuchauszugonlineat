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
import { Search, FileText, MapPin, Building2, Hash, Scale, Info, ChevronRight } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<string>("address");
  const [selectedFromSearch, setSelectedFromSearch] = useState(false);

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
    // Fill in the form with the selected result
    setValue("katastralgemeinde", result.kgName || result.kgNummer, { shouldValidate: true });
    setValue("grundstuecksnummer", result.gst || result.ez, { shouldValidate: true });
    setValue("bundesland", result.bundesland, { shouldValidate: true });
    
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
    setValue("grundbuchsgericht", gerichtMap[result.bundesland] || "", { shouldValidate: true });
    
    setSelectedFromSearch(true);
    setActiveTab("manual"); // Switch to manual tab to show/edit the filled data
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Grundstücksdaten eingeben
        </h1>
        <p className="text-muted-foreground">
          Suchen Sie nach einer Adresse oder geben Sie die Grundbuchdaten manuell ein.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-muted/50 h-14">
            <TabsTrigger 
              value="address" 
              className="flex items-center gap-2 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full"
            >
              <Search className="h-4 w-4" />
              <span className="font-medium">Adresse suchen</span>
            </TabsTrigger>
            <TabsTrigger 
              value="manual" 
              className="flex items-center gap-2 rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Manuelle Eingabe</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="address" className="mt-0 space-y-6">
              <div className="flex items-start gap-3 bg-info p-4 rounded-lg border border-primary/10">
                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>Tipp:</strong> Geben Sie eine Adresse ein (z.B. "Ringstraße 1, 1010 Wien") um das zugehörige Grundstück zu finden. 
                  Die Daten werden automatisch in das Formular übernommen.
                </p>
              </div>
              
              <AddressSearch onSelectResult={handleAddressSelect} />
              
              {selectedFromSearch && (
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Grundstücksdaten wurden übernommen. Sie können diese im Tab "Manuelle Eingabe" überprüfen und anpassen.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Bundesland Field */}
                <div className="space-y-2">
                  <Label htmlFor="bundesland" className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Bundesland <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={bundesland}
                    onValueChange={(value) => setValue("bundesland", value, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-12 bg-background">
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
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Katastralgemeinde <span className="text-destructive">*</span>
                  </Label>
                  <KatastralgemeindeCombobox
                    value={katastralgemeinde}
                    onChange={(value) => setValue("katastralgemeinde", value, { shouldValidate: true })}
                    bundesland={bundesland}
                    placeholder="Katastralgemeinde suchen..."
                  />
                  {errors.katastralgemeinde && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                      {errors.katastralgemeinde.message}
                    </p>
                  )}
                </div>

                {/* Grundstücksnummer Field */}
                <div className="space-y-2">
                  <Label htmlFor="grundstuecksnummer" className="flex items-center gap-2 text-sm font-medium">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Grundstücksnummer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="grundstuecksnummer"
                    {...register("grundstuecksnummer")}
                    placeholder="z.B. 123/4"
                    className="h-12 bg-background"
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
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    Grundbuchsgericht <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="grundbuchsgericht"
                    {...register("grundbuchsgericht")}
                    placeholder="z.B. Bezirksgericht Innere Stadt Wien"
                    className="h-12 bg-background"
                  />
                  {errors.grundbuchsgericht && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                      {errors.grundbuchsgericht.message}
                    </p>
                  )}
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
                    className="h-12 bg-background"
                  />
                  {errors.wohnungsHinweis && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                      {errors.wohnungsHinweis.message}
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 bg-info p-4 rounded-lg border border-primary/10">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    <strong>Hinweis:</strong> Genaue Angaben erleichtern die eindeutige Zuordnung im Grundbuch.
                    Die Katastralgemeinde und Grundstücksnummer finden Sie auf Ihrem Grundbuchauszug oder im{" "}
                    <a 
                      href="https://www.bev.gv.at/Services/Produkte/Kataster-und-Verzeichnisse/Katastralgemeindesuche.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-secondary font-medium hover:underline"
                    >
                      BEV-Katasterverzeichnis
                    </a>.
                  </p>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg">
                  Weiter
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Show submit button when on address tab and data is selected */}
      {activeTab === "address" && selectedFromSearch && (
        <div className="mt-6">
          <Button 
            onClick={async () => {
              const isValid = await trigger();
              if (isValid) {
                handleSubmit(onSubmit)();
              } else {
                setActiveTab("manual");
              }
            }} 
            className="w-full h-12 text-base font-semibold" 
            size="lg"
          >
            Weiter
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
